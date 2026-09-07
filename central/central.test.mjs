import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,stat,unlink,rmdir} from 'node:fs/promises';
import path from 'node:path';
import worker,{CentralQueue,makeSession,readSession,sha} from '../workers/central/index.mjs';
import {answerQuestion} from './engine.mjs';
import {cleanTemporary,runtimeRoot} from './model.mjs';

class MemoryStorage{
 constructor(){this.map=new Map();this.alarm=null;}
 async get(k){return structuredClone(this.map.get(k));}
 async put(k,v){this.map.set(k,structuredClone(v));}
 async delete(keys){for(const k of Array.isArray(keys)?keys:[keys])this.map.delete(k);}
 async list({prefix=''}={}){return new Map([...this.map].filter(([k])=>k.startsWith(prefix)).map(([k,v])=>[k,structuredClone(v)]));}
 async transaction(fn){return fn(this);}
 async getAlarm(){return this.alarm;}
 async setAlarm(v){this.alarm=v;}
}
async function setup(){const storage=new MemoryStorage(),queue=new CentralQueue({storage},{});const env={AGENT_TOKEN:'test-only-agent',SESSION_KEY:'test-only-session',STAFF_PASSWORD_HASH:await sha('test-only-password'),CENTRAL_QUEUE:{idFromName:()=>'',get:()=>queue}};return {storage,queue,env};}
async function request(env,url,{method='GET',data,token,agent=false,origin='https://dolphincentrifuge.com'}={}){const headers={};if(token)headers.cookie='central_session='+token;if(agent)headers.authorization='Bearer '+env.AGENT_TOKEN;if(method==='POST'){headers.origin=origin;headers['content-type']='application/json';}return worker.fetch(new Request('https://example.test'+url,{method,headers,body:data?JSON.stringify(data):method==='POST'?'{}':undefined}),env);}

test('signed sessions reject changes, wrong keys and expiration',async()=>{const t=await makeSession('fixture-key','person',1000);assert.equal((await readSession(t,'fixture-key',2000)).sid,'person');assert.equal(await readSession(t+'x','fixture-key',2000),null);assert.equal(await readSession(t,'wrong-key',2000),null);assert.equal(await readSession(t,'fixture-key',13*3600000),null);});
test('staff APIs and engine routes require their own credential',async()=>{const {env}=await setup();assert.equal((await request(env,'/central/api/health')).status,401);assert.equal((await request(env,'/central/api/health',{token:'invented'})).status,401);assert.equal((await request(env,'/agent/claim',{method:'POST'})).status,401);});
test('password sign-in sets a secure cookie and rejects an incorrect password',async()=>{const {env}=await setup();assert.equal((await request(env,'/central/api/login',{method:'POST',data:{password:'wrong'}})).status,401);const good=await request(env,'/central/api/login',{method:'POST',data:{password:'test-only-password'}});assert.equal(good.status,200);assert.match(good.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Strict/);});
test('cross-origin staff writes are rejected',async()=>{const {env}=await setup();const token=await makeSession(env.SESSION_KEY);const r=await request(env,'/central/api/ask',{method:'POST',token,origin:'https://unrelated.example',data:{question:'Question'}});assert.equal(r.status,403);});
test('a second staff session cannot read or rate another session question',async()=>{const {env}=await setup();await request(env,'/agent/claim',{method:'POST',agent:true,data:{busy:true}});const one=await makeSession(env.SESSION_KEY),two=await makeSession(env.SESSION_KEY);const asked=await request(env,'/central/api/ask',{method:'POST',token:one,data:{question:'How does testing work?'}});assert.equal(asked.status,202);const {id}=await asked.json();assert.equal((await request(env,'/central/api/result/'+id,{token:one})).status,200);assert.equal((await request(env,'/central/api/result/'+id,{token:two})).status,404);assert.equal((await request(env,'/central/api/feedback',{method:'POST',token:two,data:{id,rating:'useful'}})).status,404);});
test('engine completion requires the correct lease and removes original question/context',async()=>{const {env,storage}=await setup();await request(env,'/agent/claim',{method:'POST',agent:true,data:{busy:true}});const token=await makeSession(env.SESSION_KEY);const {id}=await (await request(env,'/central/api/ask',{method:'POST',token,data:{question:'Original inquiry',context:'Private context'}})).json();const {job}=await (await request(env,'/agent/claim',{method:'POST',agent:true})).json();assert.equal((await request(env,'/agent/complete',{method:'POST',agent:true,data:{id,lease:'wrong',result:{}}})).status,409);assert.equal((await request(env,'/agent/complete',{method:'POST',agent:true,data:{id,lease:job.lease,result:{customerAnswer:'Answer'}}})).status,200);const row=await storage.get('job:'+id);assert.equal(row.question,undefined);assert.equal(row.context,undefined);assert.equal(row.status,'complete');});
test('automatic queue cleanup removes expired jobs while retaining current jobs',async()=>{const {storage,queue}=await setup();await storage.put('job:expired',{expiresAt:100});await storage.put('job:current',{expiresAt:300});await queue.clean(200);assert.equal(await storage.get('job:expired'),undefined);assert.ok(await storage.get('job:current'));});
test('offline engine produces a useful failure instead of accepting an orphan question',async()=>{const {env}=await setup();const token=await makeSession(env.SESSION_KEY);const r=await request(env,'/central/api/ask',{method:'POST',token,data:{question:'Hello'}});assert.equal(r.status,503);assert.match((await r.json()).error,/offline/);});
test('answer engine repairs a concrete missing detail and returns only verified citations',async()=>{
 const d={id:'evidence-1',title:'Dolphin testing',text:'A real lab-scale disc stack test is used.',kind:'website',url:'https://dolphincentrifuge.com/industrial-centrifuge-sample-testing/'};
 const knowledge={load:async()=>{},candidates:()=>[d],search:()=>[d],info:{websitePages:151}};
 let calls=0;const modelCall=async()=>{calls++;if(calls===1)return {needs:['test scale'],selectedIds:['evidence-1'],additionalSearches:[]};if(calls===3)return {needsCorrection:true,issues:['Do not call this production-scale.']};return {customerAnswer:calls===2?'Production-scale test':'Real lab-scale disc-stack test',followUpQuestions:[],staffNote:'',needsStaffFollowUp:false,sourceIds:['evidence-1'],coverage:[]};};
 const answer=await answerQuestion({question:'What scale is the test?'},{knowledge,modelCall});assert.equal(calls,4);assert.equal(answer.customerAnswer,'Real lab-scale disc-stack test');assert.equal(answer.sources[0].url,d.url);
});
test('new app schema files are cleaned automatically, while unknown files are preserved',async()=>{
 const root=path.join(runtimeRoot,'temporary');await mkdir(root,{recursive:true});const disposable=await mkdtemp(path.join(root,'request-')),preserved=await mkdtemp(path.join(root,'request-'));
 await writeFile(path.join(disposable,'schema.json'),'{}');await writeFile(path.join(preserved,'unrecognized-fixture.json'),'{}');
 try{await cleanTemporary({olderThan:0,now:Date.now()+1000});await assert.rejects(stat(disposable),{code:'ENOENT'});assert.ok(await stat(path.join(preserved,'unrecognized-fixture.json')));}finally{await unlink(path.join(preserved,'unrecognized-fixture.json'));await rmdir(preserved);}
});
