import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {Knowledge} from './knowledge.mjs';
import {answerQuestion} from './engine.mjs';

test('private writing sources load separately, mask old facts and honor source exclusions',async()=>{
 const root=await mkdtemp(path.join(os.tmpdir(),'central-writing-fixture-'));
 try{
  const files={'SITE_KNOWLEDGE.json':{pages:[{title:'Diesel',url:'https://dolphincentrifuge.com/diesel/',content:'A centrifuge separates free water from diesel under the specified operating conditions.'}],documents:[]},'CENTRIFUGE_BRAIN.md':'# Brain\nApplication-specific evidence governs the exact machine recommendation.','CENTRIFUGE_SKILLS.md':'# Skills\nSeparate published ratings from an application-specific capacity guarantee.','TECHNICAL_CATALOG.json':{models:[]},'CENTRIFUGE_WIKI.json':{cases:[]},'SANJAY_WRITING_STYLE.md':'Use concise, natural paragraphs.','SANJAY_WORDING_LIBRARY.json':{sources:[{sourceMessageId:'held-message',threadId:'held-thread'}],blocks:[{id:'safe',text:'Please advise the diesel temperature.',tags:['diesel'],eligibility:'safe',factSensitive:false},{id:'masked',text:'The diesel package costs SECRET-OLD-PRICE.',template:'The diesel package costs {{price}}.',tags:['diesel'],eligibility:'requires_bindings',slotCoverageComplete:true},{id:'excluded',text:'SECRET-EXCLUDED diesel',eligibility:'exclude'},{id:'held',text:'SECRET-HELD diesel',eligibility:'safe',factSensitive:false,sourceMessageId:'held-message'},{id:'unsafe',text:'SECRET-UNMASKED diesel',eligibility:'safe',factSensitive:true}]}};
  await Promise.all(Object.entries(files).map(([name,value])=>writeFile(path.join(root,name),typeof value==='string'?value:JSON.stringify(value))));
  const kb=new Knowledge({root,excludeThreads:['held-thread']});await kb.load();
  assert.equal(kb.info.sourceFiles.length,7);
  const ref=kb.writingReference('diesel');assert.equal(ref.guide,files['SANJAY_WRITING_STYLE.md']);assert.equal(ref.examples.length,2);
  assert.match(JSON.stringify(ref),/\{\{price\}\}/);assert.doesNotMatch(JSON.stringify(ref),/SECRET-/);
  assert.ok(kb.docs.every(d=>d.kind!=='writing'));
  assert.doesNotMatch(JSON.stringify(kb.search('diesel')),/Please advise|\{\{price\}\}/);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('drafting and checking receive style separately from citable facts',async()=>{
 const d={id:'fact',title:'Diesel',text:'Free water separates.',kind:'website',url:'https://dolphincentrifuge.com/'};
 const writingReference={guide:'Use concise paragraphs.',examples:[{id:'wording',text:'Please advise the temperature.'}]};
 const knowledge={load:async()=>{},candidates:()=>[d],search:()=>[],writingReference:()=>writingReference,info:{}};
 let calls=0;
 const modelCall=async({input})=>{calls++;if(calls===1)return {needs:['diesel purification'],selectedIds:['fact'],additionalSearches:[]};assert.deepEqual(input.writingReference,writingReference);assert.deepEqual(input.evidence.map(e=>e.id),['fact']);if(calls===3)return {needsCorrection:false,issues:[]};return {customerAnswer:'Free water separates.',sourceIds:['fact'],followUpQuestions:[],staffNote:'',needsStaffFollowUp:false,coverage:[]};};
 const result=await answerQuestion({question:'Can a centrifuge remove free water from diesel?'},{knowledge,modelCall});assert.equal(calls,3);assert.equal(result.writingReference,undefined);assert.deepEqual(result.sources.map(s=>s.id),['fact']);
});
