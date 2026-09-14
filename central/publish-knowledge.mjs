// Versioned private cloud publication. Every upload batch is safe to replay.
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {Knowledge} from './knowledge.mjs';
import {compactInserts} from './sql-batches.mjs';
const account='b421c569a13f32171251c80aa3c491a0',database='fc438771-53ef-4ea6-b9d2-a1927fe9ba68';
const endpoint=`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`;
const quote=v=>"'"+String(v??'').replaceAll("'","''")+"'";
async function query(sql,params=[]){
 for(let attempt=0;attempt<4;attempt++){
  try{const r=await fetch(endpoint,{method:'POST',headers:{authorization:'Bearer '+process.env.CLOUDFLARE_API_TOKEN,'content-type':'application/json'},body:JSON.stringify({sql,params}),signal:AbortSignal.timeout(90000)});const j=await r.json();if(!r.ok||!j.success||j.result?.some(x=>x.success===false)){const error=new Error('Cloud query failed: HTTP '+r.status+' codes '+(j.errors||[]).map(e=>e.code).join(','));error.permanent=r.status<500&&r.status!==429;throw error;}return j.result;
  }catch(error){if(error.permanent||attempt===3)throw error;console.log('Retrying interrupted cloud batch');await new Promise(r=>setTimeout(r,2000*(attempt+1)));}
 }
}
const out=path.join(process.env.LOCALAPPDATA,'Dolphin','Central','cloud-publish');await mkdir(out,{recursive:true});
const kb=new Knowledge({captureSources:true});console.log('Reading private source snapshot');await kb.load();
const release=createHash('sha256').update(JSON.stringify(kb.info.sourceFiles)).digest('hex').slice(0,20);
await query(`CREATE TABLE IF NOT EXISTS knowledge_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search USING fts5(release UNINDEXED,id UNINDEXED,title,heading,text,url UNINDEXED,kind UNINDEXED,date UNINDEXED,tokenize='porter unicode61'); CREATE TABLE IF NOT EXISTS source_archive (release TEXT,name TEXT,part INTEGER,content TEXT,PRIMARY KEY(release,name,part));`);
const active=(await query("SELECT value FROM knowledge_meta WHERE key='active'"))[0].results;
if(active.length&&JSON.parse(active[0].value).release===release){console.log('This exact release is already active');process.exit(0);}
const progressKey='publish:'+release;const progressRows=(await query('SELECT value FROM knowledge_meta WHERE key=?',[progressKey]))[0].results;
let progress=progressRows.length?JSON.parse(progressRows[0].value):{offset:0};
if(!progressRows.length){await query(`DELETE FROM knowledge_search WHERE release=${quote(release)}; DELETE FROM source_archive WHERE release=${quote(release)};`);await query('INSERT OR REPLACE INTO knowledge_meta VALUES (?,?)',[progressKey,JSON.stringify(progress)]);}
const rowBase=parseInt(release.slice(0,6),16)*1000000;
const collision=(await query('SELECT count(*) AS n FROM knowledge_search WHERE rowid>=? AND rowid<? AND release<>?',[rowBase,rowBase+kb.docs.length,release]))[0].results[0].n;if(collision)throw new Error('Document identifier range conflicts with another release');
const statements=kb.docs.map((d,i)=>`INSERT OR REPLACE INTO knowledge_search (rowid,release,id,title,heading,text,url,kind,date) VALUES (${rowBase+i},${[release,d.id,d.title,d.heading,d.text,d.url,d.kind,d.date].map(quote).join(',')})`);
for(const [index,source] of kb.info.sourceFiles.entries()){
 const text=kb.sourceContents[index];
 for(let at=0,part=0;at<text.length;part++){let end=Math.min(at+24000,text.length);if(end<text.length&&/[\uD800-\uDBFF]/.test(text[end-1]))end--;statements.push(`INSERT OR REPLACE INTO source_archive VALUES (${quote(release)},${quote(source.name)},${part},${quote(text.slice(at,end))})`);at=end;}
}
console.log(JSON.stringify({release,passages:kb.docs.length,records:statements.length,resumingAt:progress.offset}));
let lastReport=0;
while(progress.offset<statements.length){const batch=[];let size=0,next=progress.offset;while(next<statements.length&&(size+Buffer.byteLength(statements[next])<750000||!batch.length)){batch.push(statements[next]);size+=Buffer.byteLength(statements[next]);next++;}await query(compactInserts(batch));progress.offset=next;await query('INSERT OR REPLACE INTO knowledge_meta VALUES (?,?)',[progressKey,JSON.stringify(progress)]);if(Date.now()-lastReport>30000){console.log('Uploaded '+next+' of '+statements.length+' records');lastReport=Date.now();}}
const count=(await query('SELECT count(*) AS n FROM knowledge_search WHERE release=?',[release]))[0].results[0].n;if(count!==kb.docs.length)throw new Error('Passage count mismatch');
for(const source of kb.info.sourceFiles){const hash=createHash('sha256');for(let offset=0;;offset+=20){const rows=(await query('SELECT content FROM source_archive WHERE release=? AND name=? ORDER BY part LIMIT 20 OFFSET ?',[release,source.name,offset]))[0].results;for(const row of rows)hash.update(row.content);if(rows.length<20)break;}if(hash.digest('hex')!==source.sha256)throw new Error('Cloud source hash mismatch: '+source.name);console.log('Verified '+source.name);}
const metadata={release,info:{...kb.info,hosting:'cloud',passages:count},writing:{guide:kb.writingGuide,examples:kb.wording}};
await query('INSERT OR REPLACE INTO knowledge_meta VALUES (?,?)',['release:'+release,JSON.stringify(metadata)]);
await query('INSERT OR REPLACE INTO knowledge_meta VALUES (?,?)',['active',JSON.stringify({release,info:metadata.info})]);
await writeFile(path.join(out,'published-release.json'),JSON.stringify({release,info:metadata.info,verifiedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({release,passages:count,sourceFiles:kb.info.sourceFiles.length,verified:true}));
