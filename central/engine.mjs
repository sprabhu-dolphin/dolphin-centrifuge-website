import {Knowledge} from './knowledge.mjs';
import {callModel} from './model.mjs';
import {answerQuestion as answerCore} from './answer-core.mjs';
const knowledge=new Knowledge();
export function answerQuestion(job,options={}){return answerCore(job,{knowledge,modelCall:callModel,...options});}