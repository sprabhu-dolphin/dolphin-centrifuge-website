import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

export const knowledgeRoot=process.env.CENTRAL_KNOWLEDGE_ROOT||'N:/Business Docs/AI/Knowledge/Current';
const names=['SITE_KNOWLEDGE.json','CENTRIFUGE_BRAIN.md','CENTRIFUGE_SKILLS.md','TECHNICAL_CATALOG.json','CENTRIFUGE_WIKI.json'];
const stop=new Set('the a an and or of in for to from on with is are it this that we you our your can could would please about have has be as at by what how which do does will need want thank thanks regards hello hi information request question customer company name dolphin centrifuge centrifuges'.split(' '));
const hash=s=>createHash('sha256').update(s).digest('hex');
export function tokens(s){return (String(s).toLowerCase().replace(/\buco\b/g,'used cooking oil').replace(/\bfuel\b/g,'fuel diesel').replace(/\bsolids?\b/g,'solid sludge').replace(/\bdisk\b/g,'disc').match(/[a-z0-9]+(?:[-.][a-z0-9]+)*/g)||[]).filter(t=>t.length>1&&!stop.has(t)).map(t=>t.length>5?t.replace(/(?:ing|es|s)$/,''):t);}
function pieces(text,max=2200){let section='',heading='';const out=[];for(const para of String(text||'').split(/\n\s*\n/)){if(/^#{1,5} /.test(para)){if(section.trim())out.push({text:section,heading});section='';heading=para.split('\n')[0].replace(/^#+\s*/,'');}if(section.length+para.length>max&&section){out.push({text:section,heading});section='';}for(let at=0;at<para.length;at+=max){const p=para.slice(at,at+max);if(at){if(section)out.push({text:section,heading});section='';}section+=(section?'\n\n':'')+p;}}if(section.trim())out.push({text:section,heading});return out;}

export class Knowledge{
 constructor({root=knowledgeRoot,excludeThreads=[]}={}){this.root=root;this.excluded=new Set(excludeThreads);this.docs=[];this.checked=0;this.signature='';}
 async load(){
  if(Date.now()-this.checked<60000&&this.docs.length)return;
  this.checked=Date.now();const infos=await Promise.all(names.map(n=>stat(path.join(this.root,n))));
  const signature=infos.map(s=>s.mtimeMs+':'+s.size).join('|');if(signature===this.signature)return;
  const contents=await Promise.all(names.map(n=>readFile(path.join(this.root,n),'utf8'))),docs=[];
  const add=(text,title,url,kind,thread=null,date=null)=>{
   if(thread&&this.excluded.has(thread))return;
   if([...this.excluded].some(id=>text.includes(id)))return;
   for(const p of pieces(text)){if(p.text.trim().length<45)continue;docs.push({id:hash(kind+'|'+url+'|'+p.text).slice(0,18),title,heading:p.heading,text:p.text,url,kind,date,thread});}
  };
  const site=JSON.parse(contents[0].replace(/^\uFEFF/,''));
  for(const p of [...site.pages,...site.documents])add(p.content,p.title,p.sourceCitationUrl||p.url,'website',null,p.fetchedAt||site.generatedAt||null);
  for(const i of [1,2])for(const section of contents[i].split(/(?=^#{1,4} )/m)){const title=section.match(/^#+\s+([^\n]+)/)?.[1]||names[i];add(section,title,'knowledge:'+names[i],i===1?'brain':'skills');}
  const catalog=JSON.parse(contents[3].replace(/^\uFEFF/,''));for(const m of catalog.models)add(JSON.stringify(m),m.displayName,m.canonicalPage,'catalog');
  const wiki=JSON.parse(contents[4].replace(/^\uFEFF/,''));
  for(const c of wiki.cases){if(this.excluded.has(c.threadId))continue;for(const v of c.sourceVariants||[]){const d=v.data;if(d.status&&d.status!=='useful')continue;const text=d.technicalFacts?[...(d.technicalFacts||[]).map(f=>f.statement+' Conditions: '+f.conditions),...(d.salesGuidance||[]).map(f=>f.statement+' Conditions: '+f.conditions),...(d.customerQuestions||[]).map(q=>q.question+' '+q.answer)].join('\n'):JSON.stringify(d);add(text,d.title||c.application||'Historical Dolphin case',`https://mail.google.com/mail/u/sprabhu@dolphincentrifuge.com/#all/${c.threadId}`,'email',c.threadId,c.date);}}
  const df=new Map();let total=0;
  for(const d of docs){d.tf=new Map();for(const t of tokens(d.title+' '+d.heading+' '+d.text))d.tf.set(t,(d.tf.get(t)||0)+1);d.length=[...d.tf.values()].reduce((a,b)=>a+b,0);total+=d.length;for(const t of d.tf.keys())df.set(t,(df.get(t)||0)+1);}
  this.docs=docs;this.df=df;this.average=total/docs.length;this.signature=signature;
  this.info={loadedAt:new Date().toISOString(),websitePages:site.pages.length,conversations:wiki.cases.length,sourceFiles:names.map((name,i)=>({name,sha256:hash(contents[i]),modifiedAt:infos[i].mtime.toISOString()}))};
 }
 search(query,{limit=12,kind}={}){
  const ts=[...new Set(tokens(query))],counts=new Map(),out=[];
  const rows=this.docs.filter(d=>!kind||d.kind===kind).map(d=>{let score=0;for(const t of ts){const f=d.tf.get(t)||0;if(f)score+=Math.log(1+(this.docs.length-(this.df.get(t)||0)+.5)/((this.df.get(t)||0)+.5))*f*2.2/(f+1.2*(.25+.75*d.length/this.average));}return {d,score:score*(d.kind==='website'?1.15:d.kind==='skills'?1.1:1)};}).filter(r=>r.score>0).sort((a,b)=>b.score-a.score);
  for(const row of rows){if((counts.get(row.d.url)||0)>=3)continue;counts.set(row.d.url,(counts.get(row.d.url)||0)+1);out.push(row.d);if(out.length>=limit)break;}return out;
 }
 contactSources(question){
  if(!/\baddress\b|\bphone\b|\bcontact details\b|\bwhere\b.*\b(?:ship|send|visit|locat)/i.test(question))return [];
  return this.docs.filter(d=>d.kind==='website'&&d.url==='https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/'&&d.heading==='Reach Us Directly').slice(0,1);
 }
 candidates(question,context='',extra=[]){
  const queries=[question,question+' '+context.slice(-5000),...extra];
  const docs=[...this.contactSources(question),...queries.flatMap(q=>this.search(q,{limit:12}))];
  // Include basic principles for removal targets, not just matching machine numbers.
  if(/remove|separat|clarif|purif|starch|sulfur|ppm/i.test(question+' '+context))docs.push(...this.search('dissolved suspended free water sulfur starch sugar separation limitations',{limit:6}));
  if(/test|sample|ship/i.test(question))docs.push(...this.search('sample testing lab scale disc centrifuge return shipping quotation',{limit:5,kind:'website'}));
  if(/screen/i.test(question))docs.push(...this.search('solid bowl decanter no screen sedimentation',{limit:3,kind:'website'}));
  return [...new Map(docs.map(d=>[d.id,d])).values()].slice(0,42);
 }
}
