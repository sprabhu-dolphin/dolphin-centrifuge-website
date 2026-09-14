import test from 'node:test';
import assert from 'node:assert/strict';
import {sendOpenAiLead, savedLeadEventId} from './workers/contact-form/openai-ads.mjs';
import worker from './workers/contact-form/index.js';

const env = {OPENAI_ADS_PIXEL_ID:'test-pixel',OPENAI_ADS_CAPI_KEY:'test-only-placeholder'};
const request = new Request('https://worker.example/',{headers:{'User-Agent':'test-browser','CF-Connecting-IP':'192.0.2.1'}});
const attribution={openai_ads:{allowed:true,sourceUrl:'https://dolphincentrifuge.com/used-oil/?private=1#private',oppref:'opaque%2Bvalue',obref:'browser-reference'}};
test('uses one ID, strips URL details, keeps opaque attribution and excludes form data',async()=>{
  let body;
  const result=await sendOpenAiLead({env,request,attribution,eventId:'lead-test'},async(url,options)=>{body=JSON.parse(options.body);return new Response('{}');});
  assert.equal(result.status,'accepted');
  assert.equal(body.events[0].id,'lead-test');
  assert.equal(body.events[0].source_url,'https://dolphincentrifuge.com/used-oil/');
  assert.equal(body.events[0].oppref,'opaque%2Bvalue');
  assert.equal(body.events[0].user.obref,'browser-reference');
  assert.equal(body.events[0].opt_out,true);
});
test('suppresses denied or missing consent, GPC, missing saves and credentials',async()=>{
  let calls=0;const transport=async()=>{calls++;return new Response('{}');};
  for(const override of [{attribution:{}},{attribution:{openai_ads:{allowed:false}}},{eventId:null},{env:{}},{request:new Request('https://worker.example/',{headers:{'Sec-GPC':'1'}})}]){
    await sendOpenAiLead({env,request,attribution,eventId:'lead-test',...override},transport);
  }
  assert.equal(calls,0);
  assert.equal(savedLeadEventId({success:false,meta:{last_row_id:12}}),null);
});
test('prefers raw server cookies and rejects foreign source URLs',async()=>{
  let event;
  await sendOpenAiLead({env,eventId:'lead-test',request:new Request('https://worker.example/',{headers:{Cookie:'__oppref=server%2Fopaque'}}),attribution:{openai_ads:{allowed:true,sourceUrl:'https://evil.example/path',oppref:'client'}}},async(url,options)=>{event=JSON.parse(options.body).events[0];return new Response('{}');});
  assert.equal(event.oppref,'server%2Fopaque');
  assert.equal(event.source_url,'https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/');
});
test('retries transient failure with an identical payload and contains permanent failures',async()=>{
  const bodies=[];
  const result=await sendOpenAiLead({env,request,attribution,eventId:'lead-test'},async(url,options)=>{bodies.push(options.body);return new Response('{}',{status:bodies.length===1?503:200});});
  assert.equal(result.status,'accepted');assert.equal(bodies.length,2);assert.equal(bodies[0],bodies[1]);
  assert.equal((await sendOpenAiLead({env,request,attribution,eventId:'lead-test'},async()=>{throw Error('offline');})).status,'failed');
});

test('real parts handler sends after a saved inquiry, never after validation or database failure',async()=>{
  const originalFetch=globalThis.fetch; const originalError=console.error;
  const calls=[]; let failDb=false; const tasks=[];
  console.error=()=>{};
  globalThis.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});return new Response('{}');};
  const db={prepare:()=>({bind(){return this;},all:async()=>({results:[]}),first:async()=>null,run:async()=>{if(failDb)throw Error('db_failed');return {success:true,meta:{last_row_id:123}};}})};
  const payload={customer:{name:'Diagnostic Test',company:'TEST ONLY',email:'test@example.invalid',phone:'5550000000'},parts:[{part_number:'TEST',description:'TEST ONLY',quantity:1}],attribution};
  const submit=async(body)=>worker.fetch(new Request('https://worker.example/parts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),{...env,DB:db},{waitUntil:task=>tasks.push(task)});
  try{
    const valid=await submit(payload);assert.equal((await valid.json()).openai_event_id,'dolphin_lead_123');await Promise.all(tasks);
    assert.equal(calls.filter(c=>c.url.startsWith('https://bzr.openai.com')).length,1);
    calls.length=0;const invalid=await submit({...payload,customer:{}});assert.equal(invalid.status,400);assert.equal(calls.length,0);
    failDb=true;const unsaved=await submit(payload);assert.equal((await unsaved.json()).openai_event_id,null);assert.equal(calls.filter(c=>c.url.startsWith('https://bzr.openai.com')).length,0);
  }finally{globalThis.fetch=originalFetch;console.error=originalError;}
});
