// Private D1 retrieval. No NAS, local filesystem, public bucket or browser key.
const stop=new Set('the a an and or of in for to from on with is are it this that we you our your can could would please about have has be as at by what how which do does will need want thank thanks regards hello hi information request question customer company name dolphin centrifuge centrifuges draft response helpful using supplied only most important'.split(' '));
export function queryTerms(text){return [...new Set((String(text).toLowerCase().replace(/\buco\b/g,'used cooking oil').replace(/\bfuel\b/g,'fuel diesel').match(/[a-z0-9]+/g)||[]).filter(t=>t.length>1&&!stop.has(t)))].slice(0,32);}
export class CloudKnowledge{
 constructor(db){this.db=db;this.release='';this.info=null;this.writing=null;}
 async load(){if(this.release)return;const row=await this.db.prepare("SELECT value FROM knowledge_meta WHERE key='active'").first();if(!row)throw new Error('KNOWLEDGE_UNAVAILABLE');const data=JSON.parse(row.value);this.release=data.release;this.info=data.info;}
 async search(query,{limit=12,kind}={}){
  await this.load();const terms=queryTerms(query);if(!terms.length)return [];
  const match=terms.map(t=>'"'+t+'"').join(' OR ');
  const rows=await this.db.prepare(`SELECT id,title,heading,text,url,kind,date FROM knowledge_search WHERE knowledge_search MATCH ? AND release=? ${kind?'AND kind=?':''} ORDER BY bm25(knowledge_search,0,0,3,2,1) LIMIT ?`).bind(match,this.release,...(kind?[kind]:[]),Math.min(limit*3,60)).all();
  const counts=new Map();return rows.results.filter(d=>{const count=counts.get(d.url)||0;counts.set(d.url,count+1);return count<3;}).slice(0,limit);
 }
 async contactSources(question){if(!/\baddress\b|\bphone\b|\bcontact details\b|\bwhere\b.*\b(?:ship|send|visit|locat)/i.test(question))return [];await this.load();return (await this.db.prepare("SELECT id,title,heading,text,url,kind,date FROM knowledge_search WHERE release=? AND url=? AND heading='Reach Us Directly' LIMIT 1").bind(this.release,'https://dolphincentrifuge.com/contact-for-alfa-laval-centrifuges/').all()).results;}
 async candidates(question,context=''){
  const reads=[this.contactSources(question),this.search(question),this.search(question+' '+context.slice(-5000))];
  if(/remove|separat|clarif|purif|starch|sulfur|ppm/i.test(question+' '+context))reads.push(this.search('dissolved suspended free water sulfur starch sugar separation limitations',{limit:6}));
  if(/test|sample|ship/i.test(question))reads.push(this.search('sample testing lab scale disc centrifuge return shipping quotation',{limit:5,kind:'website'}));
  if(/screen/i.test(question))reads.push(this.search('solid bowl decanter no screen sedimentation',{limit:3,kind:'website'}));
  return [...new Map((await Promise.all(reads)).flat().map(d=>[d.id,d])).values()].slice(0,42);
 }
 async writingReference(query){await this.load();if(!this.writing){const row=await this.db.prepare('SELECT value FROM knowledge_meta WHERE key=?').bind('release:'+this.release).first();this.writing=JSON.parse(row.value).writing;}
  const terms=new Set(queryTerms(query));const examples=this.writing.examples.map(b=>({b,score:[...new Set(queryTerms(b.text))].filter(t=>terms.has(t)).length})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4).map(({b})=>({id:b.id,text:b.text}));return {guide:this.writing.guide,examples};
 }
}
