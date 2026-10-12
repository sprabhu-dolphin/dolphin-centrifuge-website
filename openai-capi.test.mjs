import test from 'node:test';
import assert from 'node:assert/strict';
import {sendOpenAiLead, savedLeadEventId} from './workers/contact-form/openai-ads.mjs';
import worker from './workers/contact-form/index.js';

const env = {
  OPENAI_ADS_PIXEL_ID: 'test-pixel',
  OPENAI_ADS_CAPI_KEY: 'placeholder',
  TURNSTILE_SECRET_KEY: 'test',
  RESEND_API_KEY: 'test',
};
const request = new Request('https://worker.example/',{headers:{'User-Agent':'test-browser','CF-Connecting-IP':'192.0.2.1'}});
const attribution={openai_ads:{allowed:true,sourceUrl:'https://dolphincentrifuge.com/used-oil/?private=1#private',oppref:'opaque%2Bvalue',obref:'browser-reference'}};
test('uses one ID, strips URL details, keeps opaque attribution and excludes form data',async()=>{
  let body;
  const result=await sendOpenAiLead({env,request,attribution,eventId:'lead-test',email:'  Buyer@Example.COM  '},async(url,options)=>{body=JSON.parse(options.body);return new Response('{}');});
  assert.equal(result.status,'accepted');
  assert.equal(body.events[0].id,'lead-test');
  assert.equal(body.events[0].source_url,'https://dolphincentrifuge.com/used-oil/');
  assert.equal(body.events[0].oppref,'opaque%2Bvalue');
  assert.equal(body.events[0].user.obref,'browser-reference');
  assert.deepEqual(body.events[0].user.emails_sha256,['6a6c26195c3682faa816966af789717c3bfa834eee6c599d667d2b3429c27cfd']);
  assert.equal(JSON.stringify(body).includes('Buyer@Example.COM'),false);
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
  const calls=[]; let failDb=false; const tasks=[]; const inserts=[];
  console.error=()=>{};
  globalThis.fetch=async(url,options)=>{
    if(String(url).includes('challenges.cloudflare.com')) return Response.json({success:true,hostname:'dolphincentrifuge.com',action:'parts_rfq'});
    calls.push({url:String(url),body:JSON.parse(options.body)});
    return new Response('{}');
  };
  const db={prepare:(sql)=>({bind(...values){if(sql.includes('INSERT INTO submissions')) inserts.push({sql,values});return this;},all:async()=>({results:[]}),first:async()=>null,run:async()=>{if(failDb)throw Error('db_failed');return {success:true,meta:{last_row_id:123}};}})};
  const payload={'cf-turnstile-response':'test-token',customer:{name:'Diagnostic Test',company:'TEST ONLY',email:'test@example.invalid',phone:'5550000000'},parts:[{part_number:'TEST',description:'TEST ONLY',quantity:1}],attribution:{...attribution, internal:true, openai_ads:{...attribution.openai_ads,internal:true}, first_touch:{source:'chatgpt',medium:'cpc',campaign:'original'}}};
  const submit=async(body)=>worker.fetch(new Request('https://worker.example/parts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),{...env,DB:db},{waitUntil:task=>tasks.push(task)});
  try{
    const valid=await submit(payload);assert.equal((await valid.json()).openai_event_id,'dolphin_lead_123');await Promise.all(tasks);
    assert.equal(calls.filter(c=>c.url.startsWith('https://bzr.openai.com')).length,1);
    const insert = inserts[0];
    const columns = insert.sql.match(/INSERT INTO submissions \(([\s\S]*?)\) VALUES/)[1].split(',').map(s=>s.trim());
    assert.equal(columns.length, insert.values.length);
    assert.equal((insert.sql.match(/\?/g)||[]).length, insert.values.length);
    assert.equal(insert.values[columns.indexOf('attribution_openai_click_ref')], 'opaque%2Bvalue');
    assert.equal(JSON.parse(insert.values[columns.indexOf('attribution_raw_json')]).openai_ads.internal, true);
    assert.equal(JSON.parse(insert.values[columns.indexOf('attribution_first_touch_json')]).campaign, 'original');
    calls.length=0;const invalid=await submit({...payload,customer:{}});assert.equal(invalid.status,400);assert.equal(calls.length,0);
    failDb=true;const unsaved=await submit(payload);assert.equal((await unsaved.json()).openai_event_id,null);assert.equal(calls.filter(c=>c.url.startsWith('https://bzr.openai.com')).length,0);
  }finally{globalThis.fetch=originalFetch;console.error=originalError;}
});

test('suppression reports only a bounded reason, never arbitrary form text', async () => {
  const messages = []; const original = console.info; console.info = (...args) => messages.push(args);
  try {
    for (const reason of ['gpc', 'dnt', 'stored_denial', 'queued_denial', 'storage_unavailable', 'untrusted text']) {
      const result = await sendOpenAiLead({ env, request, eventId: 'lead-test', attribution: { openai_ads: { allowed: false, reason } } }, () => { throw Error('must not send'); });
      assert.equal(result.reason, reason === 'untrusted text' ? 'permission_missing' : reason);
    }
    assert.equal(JSON.stringify(messages).includes('untrusted text'), false);
  } finally { console.info = original; }
});

test('visitor events omit click references, including nested URL copies, while keeping campaign attribution', async () => {
  const url = '/used-oil/?oppref=private-click&utm_source=chatgpt&utm_content=oil_a&%6Fppref=private-click#quote';
  const metadata = {
    visitor_id: 'test-visitor', session_id: 'test-session', source: 'chatgpt', medium: 'paid', content: 'oil_a',
    openai_ads: { allowed: true, oppref: 'private-click', sourceUrl: 'https://dolphincentrifuge.com' + url },
    landing_page: url, current_page: url, referrer: 'https://example.invalid/?oppref=private-click',
    first_touch: { landing_page: url, openai_ads: { oppref: 'private-click' } },
    pages: [{ path: url, referrer: '/?oppref=private-click', at: '2026-10-12T12:00:00Z' }],
  };
  for (const serialized of [false, true]) {
    for (const event of ['pageview', 'form_start']) {
      const writes = [];
      const db = { prepare(sql) { return {
        bind(...values) { this.values = values; return this; }, first: async () => null,
        run: async function () { writes.push({ sql, values: this.values }); return { success: true }; },
      }; } };
      const response = await worker.fetch(new Request('https://worker.example/track/' + (event === 'pageview' ? 'pageview' : 'event'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: event, page: { path: url }, target: url,
          attribution: serialized ? JSON.stringify(metadata) : metadata }),
      }), { DB: db }, {});
      assert.equal(response.status, event === 'pageview' ? 200 : 204);
      assert.equal(writes.filter(write => write.sql.includes('INSERT INTO visitor_events')).length, 1);
      const stored = JSON.stringify(writes.map(write => write.values));
      assert.equal(stored.includes('private-click'), false);
      assert.equal(stored.includes('openAiClickReference'), false);
      assert.equal(stored.includes('oppref'), false);
      assert.equal(stored.includes('/used-oil/?utm_source=chatgpt&utm_content=oil_a#quote'), true);
      assert.equal(stored.includes('chatgpt'), true);
      if (event === 'pageview') assert.equal(stored.includes('oil_a'), true);
    }
  }
});
