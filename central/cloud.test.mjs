import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {CloudKnowledge,queryTerms} from '../workers/central/knowledge.mjs';
import {CentralQueue} from '../workers/central/index.mjs';
import {cloudModel,validate} from '../workers/central/model.mjs';
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec("CREATE TABLE knowledge_meta (key TEXT PRIMARY KEY,value TEXT); CREATE VIRTUAL TABLE knowledge_search USING fts5(release UNINDEXED,id UNINDEXED,title,heading,text,url UNINDEXED,kind UNINDEXED,date UNINDEXED,tokenize='porter unicode61');");
 const active={release:'current',info:{hosting:'cloud',websitePages:1,conversations:1}};
 sql.prepare('INSERT INTO knowledge_meta VALUES (?,?)').run('active',JSON.stringify(active));
 sql.prepare('INSERT INTO knowledge_meta VALUES (?,?)').run('release:current',JSON.stringify({...active,writing:{guide:'Write briefly.',examples:[]}}));
 const insert=sql.prepare('INSERT INTO knowledge_search VALUES (?,?,?,?,?,?,?,?)');
 insert.run('current','fact','Diesel purification','','A disc-stack centrifuge removes free water from diesel.','https://dolphincentrifuge.com/diesel/','website','');
 insert.run('old','retired','Diesel diesel diesel','','RETIRED unsupported claim','private-old','brain','');
 return {sql,db:{prepare(query){const stmt=sql.prepare(query);let args=[];return {bind(...values){args=values;return this;},async all(){return {results:stmt.all(...args)};},async first(){return stmt.get(...args);}};}}};
}
class Storage{
 constructor(){this.rows=new Map();this.nextAlarm=null;}
 async get(key){return structuredClone(this.rows.get(key));}
 async put(key,value){this.rows.set(key,structuredClone(value));}
 async list({prefix=''}={}){return new Map([...this.rows].filter(([k])=>k.startsWith(prefix)).map(([k,v])=>[k,structuredClone(v)]));}
 async delete(keys){for(const k of Array.isArray(keys)?keys:[keys])this.rows.delete(k);}
 async transaction(fn){return fn(this);}
 async getAlarm(){return this.nextAlarm;}
 async setAlarm(value){this.nextAlarm=value;}
}
test('cloud retrieval selects the active private release and safely handles query syntax',async()=>{
 const {sql,db}=database();try{const kb=new CloudKnowledge(db);const rows=await kb.search('diesel "); DROP TABLE knowledge_meta; --');assert.deepEqual(rows.map(r=>r.id),['fact']);assert.equal(kb.info.hosting,'cloud');assert.deepEqual(queryTerms('" OR *'),[]);assert.equal((await kb.writingReference('diesel')).guide,'Write briefly.');}finally{sql.close();}
});
test('cloud alarm completes a session-owned question without a laptop heartbeat',async()=>{
 const {sql,db}=database(),storage=new Storage(),original=globalThis.fetch;let calls=0;
 const env={CLOUD_ENABLED:'true',KNOWLEDGE:db,ANTHROPIC_API_KEY:'synthetic-test-key',CENTRAL_MODEL:'synthetic'};
 const queue=new CentralQueue({storage},env),rpc=(route,data={})=>queue.fetch(new Request('https://internal/'+route,{method:'POST',body:JSON.stringify(data)}));
 globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.anthropic.com/v1/messages');const body=JSON.parse(options.body);assert.equal(body.tools,undefined);calls++;const schema=body.output_config.format.schema;let output;
  if(schema.properties.conversationStage)output={conversationStage:{asOfDate:'',latestCustomerDate:'',latestDolphinDate:'',latestCustomerRequestAlreadyAnswered:false,replyPurpose:'Answer new question',currentProjectFacts:[],unresolvedNextStep:'',missingStaffRecords:[]},needs:['free water'],selectedIds:['fact'],additionalSearches:[]};
  else if(schema.properties.needsCorrection)output={needsCorrection:false,issues:[]};
  else output={customerAnswer:'A disc-stack centrifuge removes free water from diesel.',followUpQuestions:[],staffNote:'',needsStaffFollowUp:false,sourceIds:['fact'],coverage:[]};
  return Response.json({stop_reason:'end_turn',content:[{type:'text',text:JSON.stringify(output)}]});
 };
 try{
  assert.equal((await (await rpc('health')).json()).hosting,'cloud');
  const ask=await rpc('ask',{sid:'hudson',question:'Can a centrifuge remove free water from diesel?',context:'',history:[]});assert.equal(ask.status,202);const {id}=await ask.json();assert.ok(storage.nextAlarm<Date.now()+2000);
  assert.equal((await (await rpc('agent/claim')).json()).job,null);
  await queue.alarm();const result=await (await rpc('result',{sid:'hudson',id})).json();assert.equal(result.status,'complete');assert.equal(result.result.knowledge.hosting,'cloud');assert.equal(calls,3);
  assert.equal((await rpc('result',{sid:'another-person',id})).status,404);const stored=await storage.get('job:'+id);assert.equal(stored.question,undefined);assert.equal(stored.context,undefined);
 }finally{globalThis.fetch=original;sql.close();}
});
test('model adapter rejects truncation and invalid source IDs without exposing service errors',async()=>{
 const env={ANTHROPIC_API_KEY:'synthetic',CENTRAL_MODEL:'synthetic'};
 const schema={type:'object',properties:{sourceIds:{type:'array',items:{type:'string',enum:['valid']},maxItems:1}},required:['sourceIds'],additionalProperties:false};
 assert.throws(()=>validate({sourceIds:['untrusted']},schema),/INVALID_OUTPUT/);
 const model=cloudModel(env,async()=>Response.json({stop_reason:'max_tokens',content:[]}));await assert.rejects(model({prompt:'',input:{},schema}),/INCOMPLETE/);
 const failure=cloudModel(env,async()=>new Response('private provider details',{status:503}));await assert.rejects(failure({prompt:'',input:{},schema}),/^Error: MODEL_HTTP_503$/);
});
