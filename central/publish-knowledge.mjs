// One-time/versioned private cloud publication; never writes data into this repo.
import {writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {Knowledge} from './knowledge.mjs';
const account='b421c569a13f32171251c80aa3c491a0',database='fc438771-53ef-4ea6-b9d2-a1927fe9ba68';
const endpoint=`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`;
const quote=v=>"'"+String(v??'').replaceAll("'","''")+"'";
async function query(sql,params=[]){const r=await fetch(endpoint,{method:'POST',headers:{authorization:'Bearer '+process.env.CLOUDFLARE_API_TOKEN,'content-type':'application/json'},body:JSON.stringify({sql,params}),signal:AbortSignal.timeout(90000)});const j=await r.json();if(!r.ok||!j.success||j.result?.some(x=>x.success===false))throw new Error('Private database operation failed ('+r.status+'): '+JSON.stringify(j.errors?.map(e=>({code:e.code,message:e.message}))));return j.result;}
const out=path.join(process.env.LOCALAPPDATA,'Dolphin','Central','cloud-publish');await mkdir(out,{recursive:true});
const kb=new Knowledge({captureSources:true});console.log('Reading private knowledge source files');await kb.load();
const release=createHash('sha256').update(JSON.stringify(kb.info.sourceFiles)).digest('hex').slice(0,20);
await query(`CREATE TABLE IF NOT EXISTS knowledge_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL); CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_search USING fts5(release UNINDEXED,id UNINDEXED,title,heading,text,url UNINDEXED,kind UNINDEXED,date UNINDEXED,tokenize='porter unicode61'); CREATE TABLE IF NOT EXISTS source_archive (release TEXT,name TEXT,part INTEGER,content TEXT,PRIMARY KEY(release,name,part));`);
const prior=(await query(`SELECT value FROM knowledge_meta WHERE key='active'`))[0].results;
if(prior.length&&JSON.parse(prior[0].value).release===release){console.log('This exact release is already active');process.exit(0);}
// Resume only this unfinished release. The previously active release is untouched.
await query(`DELETE FROM knowledge_search WHERE release=${quote(release)}; DELETE FROM source_archive WHERE release=${quote(release)};`);
let batch=[],bytes=0;
async function flush(){if(batch.length){await query(batch.join(';'));batch=[];bytes=0;}}
async function add(sql){if(bytes+sql.length>70000)await flush();batch.push(sql);bytes+=sql.length;}
for(let i=0;i<kb.docs.length;i++){const d=kb.docs[i];await add(`INSERT INTO knowledge_search (release,id,title,heading,text,url,kind,date) VALUES (${[release,d.id,d.title,d.heading,d.text,d.url,d.kind,d.date].map(quote).join(',')})`);if(i&&i%2000===0)console.log('Indexed '+i+' passages');}await flush();
for(const [index,source] of kb.info.sourceFiles.entries()){const text=kb.sourceContents[index];for(let at=0,part=0;at<text.length;part++){let end=Math.min(at+24000,text.length);if(end<text.length&&/[\uD800-\uDBFF]/.test(text[end-1]))end--;await add(`INSERT INTO source_archive VALUES (${quote(release)},${quote(source.name)},${part},${quote(text.slice(at,end))})`);at=end;}await flush();console.log('Archived '+source.name);}
const count=(await query(`SELECT count(*) AS n FROM knowledge_search WHERE release=${quote(release)}`))[0].results[0].n;if(count!==kb.docs.length)throw new Error('Passage count mismatch');
for(const source of kb.info.sourceFiles){const hash=createHash('sha256');for(let offset=0;;offset+=20){const rows=(await query(`SELECT content FROM source_archive WHERE release=${quote(release)} AND name=${quote(source.name)} ORDER BY part LIMIT 20 OFFSET ${offset}`))[0].results;for(const row of rows)hash.update(row.content);if(rows.length<20)break;}if(hash.digest('hex')!==source.sha256)throw new Error('Cloud source hash mismatch: '+source.name);}
const metadata={release,info:{...kb.info,hosting:'cloud',passages:count},writing:{guide:kb.writingGuide,examples:kb.wording}};
await query('INSERT OR REPLACE INTO knowledge_meta VALUES (?,?)',['release:'+release,JSON.stringify(metadata)]);
await query('INSERT OR REPLACE INTO knowledge_meta VALUES (?,?)',['active',JSON.stringify({release,info:metadata.info})]);
await writeFile(path.join(out,'published-release.json'),JSON.stringify({release,info:metadata.info,verifiedAt:new Date().toISOString()},null,2));console.log(JSON.stringify({release,passages:count,sourceFiles:kb.info.sourceFiles.length,verified:true}));
