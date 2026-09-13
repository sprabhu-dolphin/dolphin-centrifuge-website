import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,stat,unlink,rmdir,utimes} from 'node:fs/promises';
import path from 'node:path';
import worker,{CentralQueue,makeSession,readSession,sha} from '../workers/central/index.mjs';
import {answerQuestion} from './engine.mjs';
import {Knowledge} from './knowledge.mjs';
import {cleanTemporary,runtimeRoot} from './model.mjs';
import {DatabaseSync} from 'node:sqlite';

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
 const old=new Date(Date.now()-2*3600000);await utimes(disposable,old,old);await utimes(preserved,old,old);
 try{await cleanTemporary();await assert.rejects(stat(disposable),{code:'ENOENT'});assert.ok(await stat(path.join(preserved,'unrecognized-fixture.json')));}finally{await unlink(path.join(preserved,'unrecognized-fixture.json'));await rmdir(preserved);}
});

test('an address request retains the public contact source even when the planner overlooks it',async()=>{
 const contact={id:'contact',title:'Contact Dolphin',heading:'Reach Us Directly',text:'Address 24248 Gibson Dr, Warren, MI 48089',kind:'website',url:'https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/'};
 const service={id:'service',title:'Sample testing',text:'A paid sample-testing service.',kind:'website',url:'https://dolphincentrifuge.com/industrial-centrifuge-sample-testing/'};
 const knowledge=new Knowledge();knowledge.docs=[contact,service];knowledge.load=async()=>{};knowledge.candidates=()=>[service,contact];knowledge.search=()=>[];
 let calls=0;const modelCall=async({input})=>{calls++;if(calls===1)return {needs:['shipping address'],selectedIds:['service'],additionalSearches:[]};if(calls===3)return {needsCorrection:false,issues:[]};assert.ok(input.evidence.some(d=>d.id==='contact'));return {customerAnswer:contact.text,followUpQuestions:[],staffNote:'',needsStaffFollowUp:false,sourceIds:['contact'],coverage:[]};};
 const answer=await answerQuestion({question:'Please confirm the test and provide the shipping address.'},{knowledge,modelCall});assert.equal(answer.sources[0].id,'contact');assert.equal(knowledge.contactSources('What size centrifuge?').length,0);
});

test('the next-reply plan reaches both drafting and checking with the revised project basis',async()=>{
 const d={id:'project',title:'Application guide',text:'Use the actual process flow.',kind:'website',url:'https://dolphincentrifuge.com/'};
 const knowledge={load:async()=>{},candidates:()=>[d],search:()=>[],info:{}};
 const stage={asOfDate:'2026-09-01',latestCustomerDate:'2026-08-20',latestDolphinDate:'2026-08-21',latestCustomerRequestAlreadyAnswered:true,replyPurpose:'Follow up on the revised quote',currentProjectFacts:['Revised basis is 10,000 liters in five hours.'],unresolvedNextStep:'Ask whether the revised quote has been reviewed.',missingStaffRecords:[]};
 let calls=0;const modelCall=async({input})=>{calls++;if(calls===1)return {conversationStage:stage,needs:['quote follow-up'],selectedIds:['project'],additionalSearches:[]};assert.deepEqual(input.conversationStage,stage);if(calls===3)return {needsCorrection:false,issues:[]};return {customerAnswer:'Following up on the revised quote.',followUpQuestions:['Have you had a chance to review it?'],staffNote:'',needsStaffFollowUp:false,sourceIds:['project'],coverage:[]};};
 const result=await answerQuestion({question:'Draft the next customer reply.',context:'Original basis changed to 10,000 liters in five hours. Dolphin sent the revised quote August 21.'},{knowledge,modelCall});assert.equal(calls,3);assert.equal(result.followUpQuestions.length,1);
});

test('inquiries require staff auth, exclude deleted records, paginate and expose only customer fields',async()=>{
 const {env}=await setup();let reads=0;
 env.SUBMISSIONS={prepare:()=>{reads++;throw new Error('Unexpected read');}};
 for(const url of ['/central/api/inquiries','/central/api/inquiries?id=1'])assert.equal((await request(env,url)).status,401);
 assert.equal(reads,0);
 const sql=new DatabaseSync(':memory:');
 try{
  sql.exec(`CREATE TABLE submissions (id INTEGER PRIMARY KEY, created_at TEXT, first_name TEXT, last_name TEXT, company TEXT, country TEXT, us_state TEXT, fluid_type TEXT, form_type TEXT, email TEXT, phone TEXT, contact_method TEXT, capacity TEXT, solids_percentage TEXT, centrifuge_condition TEXT, additional_details TEXT, parts_json TEXT, deleted INTEGER DEFAULT 0, visitor_ip TEXT, admin_notes TEXT)`);
  const insert=sql.prepare('INSERT INTO submissions (id, company, country, deleted, additional_details, visitor_ip, admin_notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for(let id=1;id<=28;id++)insert.run(id,'Synthetic customer '+id,id===28?'Canada':'US',id===27?1:0,'Customer requirement','private-ip','private-admin');
  env.SUBMISSIONS={prepare(query){const statement=sql.prepare(query);let args=[];const bound={bind(...values){args=values;return bound;},async all(){return {results:statement.all(...args)};},async first(){return statement.get(...args)||null;}};return bound;}};
  const token=await makeSession(env.SESSION_KEY);
  const listed=await request(env,'/central/api/inquiries',{token});assert.equal(listed.headers.get('cache-control'),'no-store');
  const page=await listed.json();assert.equal(page.items.length,25);assert.equal(page.items[0].id,26);assert.equal(page.nextBefore,2);assert.equal(page.items[0].email,undefined);assert.equal(page.items[0].visitor_ip,undefined);
  const tail=await (await request(env,'/central/api/inquiries?before=2',{token})).json();assert.deepEqual(tail.items.map(x=>x.id),[1]);assert.equal(tail.nextBefore,null);
  const all=await (await request(env,'/central/api/inquiries?region=all',{token})).json();assert.equal(all.items[0].id,28);
  const detail=await (await request(env,'/central/api/inquiries?id=26',{token})).json();assert.equal(detail.inquiry.additional_details,'Customer requirement');assert.equal(detail.inquiry.visitor_ip,undefined);assert.equal(detail.inquiry.admin_notes,undefined);
  assert.equal((await request(env,'/central/api/inquiries?id=27',{token})).status,404);
  for(const suffix of ['?id=1%20OR%201=1','?before=-1','?region=bogus'])assert.equal((await request(env,'/central/api/inquiries'+suffix,{token})).status,400);
  assert.equal(sql.prepare('SELECT count(*) AS n FROM submissions').get().n,28);
 }finally{sql.close();}
});
