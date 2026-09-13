import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
export async function checkQuestions({entries,backup,journey,DB,module}){
 let count=0;const ok=(a,b)=>{assert.deepEqual(a,b);count++;};
 const resolver=await module('lib/letter-questions-server.ts','quiz-resolver'),projection=await module('app/api/journey/public/route.ts','quiz-public'),settings=await module('app/api/journey/settings/route.ts','quiz-settings');
 // Compare the entire canonical source, not a newly copied expectation.
 ok((await readFile('lib/letter-data.ts','utf8')).replace(/\r\n/g,'\n'),execFileSync('git',['show','fa78244206ef848510990b20b777a3f77296394b:lib/letter-data.ts'],{encoding:'utf8'}).replace(/\r\n/g,'\n'));
 const {originalQuestions}=await module('lib/letter-data.ts','quiz-original');
 const defaults=originalQuestions.map((q,page)=>({page,question:q.text,answer:q.answer,successFeedback:q.success,wrongFeedback:q.wrong,emptyFeedback:q.empty}));
 for(let i=0;i<6;i++)ok(resolver.defaultQuestion(i),defaults[i]);
 for(const value of ['2026/05/21','2026/5/21','2026-05-21','2026.05.21'])ok(resolver.matchesAnswer(value,'2026/05/21'),true);
 ok(resolver.matchesAnswer('2026/02/30','2026/02/28'),false);ok(resolver.matchesAnswer(' Hello  WORLD ','hello world'),true);ok(resolver.matchesAnswer('a-b','a/b'),false);
 const members=['bounniecrisis@gmail.com','changyue960915@gmail.com'];
 const req=(email,method='GET',data,path='/api/entries',extra={})=>new Request('https://gift.test'+path,{method,headers:{'content-type':'application/json',...(email?{'oai-authenticated-user-id':'quiz-'+email,'oai-authenticated-user-email':email}:{}),...extra},...(data!==undefined?{body:JSON.stringify(data)}:{})});
 async function call(handler,email,method='GET',data,status=200,path){const r=await handler(req(email,method,data,path));ok(r.status,status);ok(r.headers.get('cache-control'),'private, no-store');return r.json();}
 const before=(await DB.prepare('SELECT * FROM journey ORDER BY user_id').all()).results;
 for(const owner of members){
  const other=members.find(x=>x!==owner);
  for(let page=0;page<6;page++){
   const data={page,question:`PHASE3V_QUIZ_TEST_${page} 漢字 🙂 <script>alert(1)</script>`,answer:page===1?'arbitrary answer':'secret-答案-'+page,successFeedback:'Correct\n🙂',wrongFeedback:'Wrong！',emptyFeedback:'Blank…'};
   let entry=(await call(entries.POST,owner,'POST',{id:crypto.randomUUID(),kind:'letter-question',data},201)).entry;
   ok((await call(settings.GET,other)).questions[page].data,data);
   await call(entries.POST,owner,'POST',{id:crypto.randomUUID(),kind:'letter-question',data},409);
   for(const outsider of [null,'outsider@example.test']){
    for(const method of ['GET','POST','PATCH','DELETE'])await call(entries[method],outsider,method,method==='GET'?undefined:entry,outsider?403:401);
    await call(settings.GET,outsider,'GET',undefined,outsider?403:401);
    const pub=await call(projection.GET,outsider);ok(Object.keys(pub),['questions']);ok(pub.questions[page],{index:page,text:data.question});ok(pub.questions.every(q=>Object.keys(q).sort().join(',')==='index,text'),true);ok(JSON.stringify(pub).includes(data.answer),false);ok(JSON.stringify(pub).includes(entry.id),false);
    for(const [answer,correct,feedback] of [['  ',false,data.emptyFeedback],['no',false,data.wrongFeedback],[data.answer,true,data.successFeedback]]){
     const r=await call(journey.POST,outsider,'POST',{index:page,answer});ok(r,{correct,feedback,unlocked:page+(correct?1:0),temporary:true});ok(JSON.stringify(r).includes(data.answer),false);
    }
   }
   const html=renderToStaticMarkup(React.createElement('p',null,data.question));ok(html.includes('<script>'),false);ok(html.includes('&lt;script&gt;'),true);
   const stale=entry;
   entry=(await call(entries.PATCH,other,'PATCH',{...entry,data:{...data,question:'Edited by partner',successFeedback:'',wrongFeedback:'',emptyFeedback:''}})).entry;
   ok((await call(settings.GET,owner)).questions[page].entry.revision,entry.revision);
   await call(entries.PATCH,owner,'PATCH',stale,409);await call(entries.DELETE,owner,'DELETE',stale,409);
   await call(entries.PATCH,owner,'PATCH',{...entry,data:{...entry.data,page:(page+1)%6}},400);
   const full=await call(backup.POST,owner,'POST',{confirmFullArchive:true});ok(full.entries.some(e=>e.id===entry.id&&e.kind==='letter-question'),true);
   await call(entries.DELETE,owner,'DELETE',entry);
   ok((await call(settings.GET,other)).questions[page],{data:defaults[page]});
   ok((await call(projection.GET,null)).questions[page],{index:page,text:defaults[page].question});
  }
 }
 ok((await DB.prepare('SELECT * FROM journey ORDER BY user_id').all()).results,before);
 const valid=defaults[0];
 for(const data of [{...valid,page:-1},{...valid,page:6},{...valid,page:.5},{...valid,question:' '},{...valid,answer:'\n '},{...valid,question:'x'.repeat(2001)},{...valid,answer:'x'.repeat(501)},...['successFeedback','wrongFeedback','emptyFeedback'].map(k=>({...valid,[k]:'x'.repeat(3001)})),{...valid,title:'duplicate title'}])await call(entries.POST,members[0],'POST',{id:crypto.randomUUID(),kind:'letter-question',data},400);
 const r=await projection.GET(req(null,'GET',undefined,'/api/journey/public',{origin:'https://other.test'}));ok(r.status,403);
 console.log(`PASS: ${count} quiz settings checks.`);return count;
}
