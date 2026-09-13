import test from 'node:test';
import assert from 'node:assert/strict';
import {answerQuestion} from './engine.mjs';
const d={id:'unrelated',title:'General source',text:'General service information',kind:'website',url:'https://dolphincentrifuge.com/'};
const knowledge={load:async()=>{},candidates:()=>[d],search:()=>[],info:{}};
for(const supported of [true,false])test(supported?'context-only scheduling acknowledgments do not require an unrelated citation':'a citation-free answer cannot pass with an unsupported new rating',async()=>{
 let calls=0;
 const modelCall=async({input})=>{
  calls++;
  if(calls===1)return {needs:['call confirmation'],selectedIds:['unrelated'],additionalSearches:[]};
  if(calls===2)return {customerAnswer:supported?'That time works. I look forward to speaking with you.':'This machine is rated for 80 GPM.',followUpQuestions:[],staffNote:'',needsStaffFollowUp:false,sourceIds:[],coverage:[]};
  if(calls===3)return {needsCorrection:false,issues:[]};
  assert.equal(input.evidence,undefined);
  return {supportedByContext:supported,issues:supported?[]:['No 80 GPM rating appears in the supplied context.']};
 };
 const work=answerQuestion({question:'Confirm the agreed call.',context:'Customer proposed Tuesday at 2pm; Dolphin confirmed that time works.'},{knowledge,modelCall});
 if(supported)assert.deepEqual((await work).sources,[]);else await assert.rejects(work,/supporting evidence/);
 assert.equal(calls,4);
});
