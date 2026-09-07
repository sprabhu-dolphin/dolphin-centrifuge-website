const SESSION_SECONDS=12*60*60, JOB_MS=30*60*1000;
const encoder=new TextEncoder();
const headers={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow'};
export const json=(value,status=200,extra={})=>new Response(JSON.stringify(value),{status,headers:{...headers,...extra}});
function equal(a,b){if(typeof a!=='string'||typeof b!=='string')return false;let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0;}
const b64=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const unb64=s=>Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),x=>x.charCodeAt(0));
export const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(s)))].map(b=>b.toString(16).padStart(2,'0')).join('');
async function sign(value,key){const k=await crypto.subtle.importKey('raw',encoder.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(await crypto.subtle.sign('HMAC',k,encoder.encode(value)));}
export async function makeSession(secret,sid=crypto.randomUUID(),now=Date.now()){
 const text=b64(encoder.encode(JSON.stringify({sid,exp:Math.floor(now/1000)+SESSION_SECONDS})));return text+'.'+await sign(text,secret);
}
export async function readSession(token,secret,now=Date.now()){
 try{const [value,signature,...rest]=String(token||'').split('.');if(rest.length||!signature||!equal(signature,await sign(value,secret)))return null;const claims=JSON.parse(new TextDecoder().decode(unb64(value)));return typeof claims.sid==='string'&&claims.sid.length<80&&Number.isFinite(claims.exp)&&claims.exp>now/1000?claims:null;}catch{return null;}
}
const cookie=t=>`central_session=${t}; Path=/central; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_SECONDS}`;
async function body(request,max=50000){const text=await request.text();if(text.length>max)throw new Error('The question or context is too long.');return JSON.parse(text||'{}');}
function allowedOrigin(request){const origin=request.headers.get('origin');return ['https://dolphincentrifuge.com','https://www.dolphincentrifuge.com','https://dolphin-centrifuge-website.pages.dev'].includes(origin);}

export default {
 async fetch(request,env){
  try{
   const pathname=new URL(request.url).pathname;
   if(!env.AGENT_TOKEN||!env.SESSION_KEY||!env.STAFF_PASSWORD_HASH)return json({error:'Central is being configured.'},503);
   const queue=env.CENTRAL_QUEUE.get(env.CENTRAL_QUEUE.idFromName('central'));
   const rpc=async (route,data={})=>queue.fetch(new Request('https://internal/'+route,{method:'POST',body:JSON.stringify(data)}));
   if(pathname.startsWith('/agent/')){
    if(!equal(request.headers.get('authorization')||'','Bearer '+env.AGENT_TOKEN))return json({error:'Unauthorized'},401);
    if(request.method!=='POST')return json({error:'Method not allowed'},405);
    const data=await body(request,130000),op=pathname.slice(7);
    if(op==='owner-session')return json({token:await makeSession(env.SESSION_KEY)});
    if(!['claim','progress','complete','feedback'].includes(op))return json({error:'Not found'},404);
    return rpc('agent/'+op,data);
   }
   if(!pathname.startsWith('/central/api/'))return json({error:'Not found'},404);
   const op=pathname.slice('/central/api/'.length);
   if(request.method==='POST'&&!allowedOrigin(request))return json({error:'Please use the Central page to make this request.'},403);
   if(op==='login'&&request.method==='POST'){
    const data=await body(request,1000);
    const ipHash=await sha(request.headers.get('cf-connecting-ip')||'unknown');
    const rate=await rpc('login-attempt',{key:ipHash});if(rate.status!==200)return rate;
    if(typeof data.password!=='string'||!equal(await sha(data.password),env.STAFF_PASSWORD_HASH))return json({error:'That staff password was not recognized.'},401);
    return json({ok:true},200,{'set-cookie':cookie(await makeSession(env.SESSION_KEY))});
   }
   const token=(request.headers.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('central_session='))?.slice(16);
   const session=await readSession(token,env.SESSION_KEY);
   if(!session)return json({error:'Sign in with the Dolphin staff password.',signIn:true},401);
   if(op==='logout'&&request.method==='POST')return json({ok:true},200,{'set-cookie':'central_session=; Path=/central; HttpOnly; Secure; SameSite=Strict; Max-Age=0'});
   if(op==='session'&&request.method==='GET')return json({signedIn:true,local:false});
   if(op==='health'&&request.method==='GET')return rpc('health');
   if(op==='ask'&&request.method==='POST'){
    const data=await body(request);
    if(typeof data.question!=='string'||!data.question.trim()||data.question.length>6000||typeof(data.context||'')!=='string'||(data.context||'').length>18000)return json({error:'Add a question and keep the context under 18,000 characters.'},400);
    const history=Array.isArray(data.history)?data.history.slice(-6).map(x=>({question:String(x.question||'').slice(0,3000),answer:String(x.answer||'').slice(0,5000)})):[];
    if(JSON.stringify(history).length>22000)return json({error:'Start a new question to shorten this conversation.'},400);
    return rpc('ask',{sid:session.sid,question:data.question.trim(),context:data.context||'',history});
   }
   if(op.startsWith('result/')&&request.method==='GET')return rpc('result',{sid:session.sid,id:op.slice(7)});
   if(op==='feedback'&&request.method==='POST'){
    const data=await body(request,6000);if(!['useful','needs-correction'].includes(data.rating))return json({error:'Choose useful or needs correction.'},400);
    return rpc('feedback',{sid:session.sid,id:String(data.id||''),rating:data.rating,note:String(data.note||'').slice(0,2000),question:String(data.question||'').slice(0,1000)});
   }
   return json({error:'Not found'},404);
  }catch{return json({error:'Central could not complete that request. Please try again.'},500);}
 }
};

export class CentralQueue{
 constructor(state,env){this.state=state;this.env=env;}
 async schedule(){const alarm=await this.state.storage.getAlarm();if(alarm===null)await this.state.storage.setAlarm(Date.now()+60000);}
 async clean(now=Date.now()){
  const rows=await this.state.storage.list();const expired=[];
  for(const [key,value] of rows)if(value.expiresAt&&value.expiresAt<=now)expired.push(key);
  if(expired.length)await this.state.storage.delete(expired);
  return rows.size-expired.length;
 }
 async alarm(){if(await this.clean())await this.state.storage.setAlarm(Date.now()+60000);}
 async fetch(request){
  const route=new URL(request.url).pathname.slice(1),data=await request.json(),now=Date.now(),storage=this.state.storage;
  await this.schedule();
  if(route==='login-attempt'){
   const key='login:'+data.key,prior=await storage.get(key),record=prior&&prior.expiresAt>now?prior:{count:0,expiresAt:now+10*60000};record.count++;await storage.put(key,record);
   return record.count>20?json({error:'Too many sign-in attempts. Please wait ten minutes.'},429):json({ok:true});
  }
  if(route==='health'){
   const meta=await storage.get('agent');return json({connected:!!meta&&now-meta.lastSeen<90000,lastSeen:meta?.lastSeen||null,knowledge:meta?.knowledge||null});
  }
  if(route==='ask')return storage.transaction(async tx=>{
   const jobs=await tx.list({prefix:'job:'});
   if([...jobs.values()].filter(j=>j.sid===data.sid&&j.expiresAt>now&&['queued','running'].includes(j.status)).length>=2)return json({error:'Please let your current answer finish first.'},429);
   if([...jobs.values()].filter(j=>j.expiresAt>now&&['queued','running'].includes(j.status)).length>=12)return json({error:'Central has several questions waiting. Please try again shortly.'},429);
   const meta=await tx.get('agent');if(!meta||now-meta.lastSeen>90000)return json({error:'The Dolphin knowledge computer is offline. Please try again when it is connected.'},503);
   const id=crypto.randomUUID();await tx.put('job:'+id,{id,...data,status:'queued',stage:'Waiting for the answer engine',createdAt:now,expiresAt:now+JOB_MS});return json({id},202);
  });
  if(route==='result'){
   const job=await storage.get('job:'+data.id);if(!job||job.sid!==data.sid||job.expiresAt<=now)return json({error:'This question has expired. Please ask it again.'},404);
   return json({id:job.id,status:job.status,stage:job.stage,result:job.result||null,error:job.error||null});
  }
  if(route==='agent/claim')return storage.transaction(async tx=>{
   await tx.put('agent',{lastSeen:now,knowledge:data.knowledge||null,expiresAt:now+24*3600000});
   if(data.busy)return json({job:null});
   const rows=await tx.list({prefix:'job:'});
   const job=[...rows.values()].filter(j=>j.expiresAt>now&&(j.status==='queued'||(j.status==='running'&&j.leaseUntil<now))).sort((a,b)=>a.createdAt-b.createdAt)[0];
   if(!job)return json({job:null});job.status='running';job.lease=crypto.randomUUID();job.leaseUntil=now+12*60000;job.stage='Finding Dolphin sources';await tx.put('job:'+job.id,job);
   return json({job:{id:job.id,lease:job.lease,question:job.question,context:job.context,history:job.history}});
  });
  if(route==='agent/progress'||route==='agent/complete'){
   const job=await storage.get('job:'+data.id);if(!job||job.lease!==data.lease||job.expiresAt<=now)return json({error:'Question expired or reassigned.'},409);
   if(route==='agent/progress'){job.stage=String(data.stage||'Working on your answer').slice(0,80);job.leaseUntil=now+12*60000;}
   else{job.status=data.error?'failed':'complete';job.error=data.error?String(data.error).slice(0,300):null;job.result=data.error?null:data.result;job.stage=data.error?'Could not complete this answer':'Answer ready';delete job.question;delete job.context;delete job.history;}
   await storage.put('job:'+job.id,job);return json({ok:true});
  }
  if(route==='feedback'){
   const job=await storage.get('job:'+data.id);if(!job||job.sid!==data.sid||job.status!=='complete'||job.expiresAt<=now)return json({error:'This answer has expired.'},404);
   await storage.put('feedback:'+data.id,{id:data.id,rating:data.rating,note:data.note,question:data.question,answer:String(job.result?.customerAnswer||'').slice(0,4000),sourceIds:job.result?.sourceIds||[],createdAt:now,expiresAt:now+24*3600000});return json({ok:true});
  }
  if(route==='agent/feedback'){
   const rows=await storage.list({prefix:'feedback:'});return json({items:[...rows.values()].filter(f=>f.expiresAt>now)});
  }
  return json({error:'Not found'},404);
 }
}
