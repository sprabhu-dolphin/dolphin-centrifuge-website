import http from 'node:http';
import {readFile,writeFile,mkdir,appendFile,stat} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {answerQuestion} from './engine.mjs';
import {Knowledge,knowledgeRoot} from './knowledge.mjs';
import {cleanTemporary,runtimeRoot} from './model.mjs';

const here=path.dirname(fileURLToPath(import.meta.url)),repo=path.dirname(here),run=promisify(execFile);
const remote='https://dolphin-central.dolphin-centrifuge.workers.dev';
const port=4412,knowledge=new Knowledge();
const secretsPath=path.join(process.env.APPDATA||path.join(os.homedir(),'AppData','Roaming'),'DolphinCodex','secrets','central','runtime.dpapi');
const credentialScript=`$ErrorActionPreference='Stop';Add-Type -AssemblyName System.Security;$b=[IO.File]::ReadAllBytes($env:CENTRAL_SECRETS_FILE);$v=[Security.Cryptography.ProtectedData]::Unprotect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);[Console]::Write([Text.Encoding]::UTF8.GetString($v))`;
let secrets,busy=false,polling=false,lastSeen=0,ownerToken='',ownerTokenAt=0;
await mkdir(runtimeRoot,{recursive:true});
async function log(message){const p=path.join(runtimeRoot,'runtime.log');try{if((await stat(p)).size>512000){const old=await readFile(p,'utf8');await writeFile(p,old.slice(-128000));}}catch{}await appendFile(p,new Date().toISOString()+' '+message+'\n');}
async function getSecrets(){if(secrets)return secrets;const r=await run('powershell.exe',['-NoLogo','-NoProfile','-NonInteractive','-Command',credentialScript],{windowsHide:true,env:{...process.env,CENTRAL_SECRETS_FILE:secretsPath},maxBuffer:100000});secrets=JSON.parse(r.stdout);return secrets;}
async function rpc(operation,data={}){const credentials=await getSecrets();const r=await fetch(remote+'/agent/'+operation,{method:'POST',headers:{authorization:'Bearer '+credentials.agentToken,'content-type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(20000)});const out=await r.json();if(!r.ok)throw new Error('Central connection unavailable ('+r.status+').');return out;}
async function ownSession(){if(ownerToken&&Date.now()-ownerTokenAt<10*3600000)return ownerToken;ownerToken=(await rpc('owner-session')).token;ownerTokenAt=Date.now();return ownerToken;}
async function requestBody(req,max=60000){let text='';for await(const chunk of req){text+=chunk.toString('utf8');if(Buffer.byteLength(text)>max)throw new Error('Request is too long.');}return text;}
const send=(res,status,value)=>{res.writeHead(status,{'content-type':'application/json','cache-control':'no-store','x-content-type-options':'nosniff'});res.end(JSON.stringify(value));};
const localHosts=new Set(['127.0.0.1:'+port,'localhost:'+port]);
const origins=new Set(['http://127.0.0.1:'+port,'http://localhost:'+port]);
const server=http.createServer(async(req,res)=>{
 try{
  if(!localHosts.has(req.headers.host))return send(res,403,{error:'Use the local Central address.'});
  const pathname=new URL(req.url,'http://127.0.0.1:'+port).pathname;
  if(req.method==='POST'&&!origins.has(req.headers.origin))return send(res,403,{error:'Use the Central page.'});
  if(pathname==='/api/health')return send(res,200,{ok:true,connected:Date.now()-lastSeen<90000,busy});
  if(pathname==='/central/api/session')return send(res,200,{signedIn:true,local:true});
  if(pathname==='/central/api/staff-password'&&req.method==='POST')return send(res,200,{password:(await getSecrets()).staffPassword});
  if(pathname.startsWith('/central/api/')){
   if(!['GET','POST'].includes(req.method))return send(res,405,{error:'Method not allowed'});
   const payload=req.method==='POST'?await requestBody(req):undefined;
   const r=await fetch(remote+pathname+new URL(req.url,'http://127.0.0.1:'+port).search,{method:req.method,headers:{cookie:'central_session='+await ownSession(),'content-type':'application/json',origin:'https://dolphincentrifuge.com'},body:payload,signal:AbortSignal.timeout(30000)});
   if(r.status===401){ownerToken='';return send(res,503,{error:'Reconnecting Central. Please try again.'});}
   res.writeHead(r.status,{'content-type':'application/json','cache-control':'no-store'});return res.end(await r.text());
  }
  const files={'/':'index.html','/central':'index.html','/central/':'index.html','/central/index.html':'index.html','/central/app.js':'app.js','/central/central.css':'central.css'};
  const name=files[pathname];if(!name||req.method!=='GET')return send(res,404,{error:'Not found'});
  const type=name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'content-type':type+'; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-frame-options':'DENY','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'"});res.end(await readFile(path.join(repo,'public','central',name)));
 }catch{send(res,503,{error:'Central is reconnecting. Please try again shortly.'});}
});
server.on('error',async e=>{if(e.code==='EADDRINUSE')process.exit(0);await log('Server could not start: '+e.code);process.exit(1);});
server.listen(port,'127.0.0.1',()=>log('Central started on local port '+port));

async function poll(){
 if(polling)return;polling=true;
 try{
  await knowledge.load();const response=await rpc('claim',{busy,knowledge:{websitePages:knowledge.info.websitePages,conversations:knowledge.info.conversations,loadedAt:knowledge.info.loadedAt}});lastSeen=Date.now();
  if(response.job&&!busy){busy=true;const job=response.job;log('Answer started '+job.id);
   (async()=>{try{const result=await answerQuestion(job,{knowledge,onProgress:stage=>rpc('progress',{id:job.id,lease:job.lease,stage})});await rpc('complete',{id:job.id,lease:job.lease,result});await log('Answer completed '+job.id);}catch{await rpc('complete',{id:job.id,lease:job.lease,error:'Central could not finish this answer. Please try again or add more customer context.'}).catch(()=>{});await log('Answer failed '+job.id);}finally{busy=false;}})();
  }
 }catch{if(Date.now()-lastSeen>90000)await log('Waiting for the knowledge connection');}finally{polling=false;}
}
async function collectFeedback(){try{const data=await rpc('feedback');const p=path.join(knowledgeRoot,'..','Reports','CENTRAL_FEEDBACK.json');let old={items:[]};try{old=JSON.parse(await readFile(p,'utf8'));}catch{}const items=[...new Map([...old.items,...data.items].map(i=>[i.id,i])).values()].sort((a,b)=>b.createdAt-a.createdAt).slice(0,200);if(data.items.length)await writeFile(p,JSON.stringify({updatedAt:new Date().toISOString(),items},null,2));}catch{}}
await cleanTemporary().catch(()=>{});poll();setInterval(poll,6000);setInterval(collectFeedback,60000);setInterval(()=>cleanTemporary().catch(()=>{}),3600000);
