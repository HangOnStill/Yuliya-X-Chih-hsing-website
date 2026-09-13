// Server routes only. Never import this module into client components.
import {originalQuestions} from './letter-data';
import {normalized} from './models';
import {db} from './server';
import {decodeEntry,entrySelect} from './v5-server';
import {letterQuestionData,type Entry,type LetterQuestionData} from './v5-models';

export function defaultQuestion(page:number):LetterQuestionData {
 const q=originalQuestions[page];
 return {page,question:q.text,answer:q.answer,successFeedback:q.success,wrongFeedback:q.wrong,emptyFeedback:q.empty};
}
export async function resolvedQuestions(){
 const rows=(await db().prepare(entrySelect+" WHERE kind='letter-question'").all()).results;
 const entries=rows.map(r=>decodeEntry(r)) as Extract<Entry,{kind:'letter-question'}>[];
 return originalQuestions.map((_,page)=>{const entry=entries.find(e=>e.data.page===page);return {data:entry?letterQuestionData.parse(entry.data):defaultQuestion(page),...(entry?{entry}:{})};});
}
export async function publicQuestions(){return (await resolvedQuestions()).map(({data})=>({index:data.page,text:data.question}));}
function dateAnswer(value:string){
 const m=/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/.exec(value.trim());
 if(!m)return null;
 const [y,mo,d]=m.slice(1).map(Number),date=new Date(0);
 date.setUTCFullYear(y,mo-1,d);date.setUTCHours(0,0,0,0);
 return date.getUTCFullYear()===y&&date.getUTCMonth()===mo-1&&date.getUTCDate()===d?`${y}/${mo}/${d}`:null;
}
export function matchesAnswer(input:string,expected:string){
 const date=dateAnswer(expected);
 return date?dateAnswer(input)===date:normalized(input)===normalized(expected);
}
