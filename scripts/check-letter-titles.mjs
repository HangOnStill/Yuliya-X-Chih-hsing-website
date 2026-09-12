import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
export async function checkTitles({entries,backup,module}){
 let count=0;const ok=(a,b)=>{assert.deepEqual(a,b);count++;};
 const {resolveLetterTitles}=await module('lib/letter-titles.ts','letter-title-resolver');
 const {LetterChapterHeading}=await module('app/letter-chapter-heading.tsx','title-heading');
 const defaults=[['相遇','Cyber Encounter'],['靠近','A Courageous Rendez-vous'],['告白','A Sudden Surprise'],['初見','From Spirit to Flesh'],['家人','A Family Oracle'],['一生','Our Life to Come']];
 resolveLetterTitles().forEach((t,i)=>{ok([t.chineseSubtitle,t.mainTitle],defaults[i]);ok(t.chapter,`MEMORY 0${i+1}`);});
 const members=['bounniecrisis@gmail.com','changyue960915@gmail.com'];
 const req=(email,method='GET',data)=>new Request('https://gift.test/api/entries',{method,headers:{'content-type':'application/json',...(email?{'oai-authenticated-user-id':'title-'+email,'oai-authenticated-user-email':email}:{})},...(data?{body:JSON.stringify(data)}:{})});
 async function call(email,method,data,status=200){const r=await entries[method](req(email,method,data));ok(r.status,status);return r.json();}
 const savedEnv={...globalThis.__giftTestEnv};
 try{
 globalThis.__giftTestEnv.EDITOR_EMAILS=members.join(',');globalThis.__giftTestEnv.PUBLIC_READ='true';
 for(const email of members){
  const input={id:crypto.randomUUID(),kind:'letter-title',data:{page:5,chineseSubtitle:' 未來，同行。 ',mainTitle:'<script>alert(1)</script>'}};
  let saved=(await call(email,'POST',input,201)).entry;
  ok(saved.data.chineseSubtitle,'未來，同行。');
  for(const outsider of [null,'outsider@example.test'])for(const method of ['GET','POST','PATCH','DELETE'])await call(outsider,method,method==='GET'?undefined:saved,outsider?403:401);
  const all=(await call(email,'GET')).entries;
  ok(resolveLetterTitles(all,true)[5].mainTitle,input.data.mainTitle);
  ok(resolveLetterTitles(all,false)[5].mainTitle,defaults[5][1]);
  const html=renderToStaticMarkup(React.createElement(LetterChapterHeading,{title:resolveLetterTitles(all,true)[5]}));
  ok(html.includes('未來，同行。'),true);ok(html.includes('MEMORY 06'),true);
  const guestHtml=renderToStaticMarkup(React.createElement(LetterChapterHeading,{title:resolveLetterTitles(all,false)[5]}));ok(guestHtml.includes('Our Life to Come'),true);ok(guestHtml.includes('未來，同行。'),false);ok(html.includes('<script>'),false);ok(html.includes('&lt;script&gt;'),true);
  await call(email,'POST',{...input,id:crypto.randomUUID()},409);
  const independent=(await call(email,'POST',{...input,id:crypto.randomUUID(),data:{page:0,chineseSubtitle:'',mainTitle:'Independent'}},201)).entry;
  ok(resolveLetterTitles([saved,independent],true)[0].mainTitle,'Independent');ok(resolveLetterTitles([saved,independent],true)[5].mainTitle,input.data.mainTitle);
  const changed=(await call(email,'PATCH',{...saved,data:{...saved.data,mainTitle:'Updated'}})).entry;
  await call(email,'PATCH',saved,409);
  await call(email,'PATCH',{...changed,data:{...changed.data,page:4}},400);
  const full=await backup.POST(new Request('https://gift.test/api/backup',{method:'POST',headers:req(email).headers,body:JSON.stringify({confirmFullArchive:true})}));ok(full.status,200);ok((await full.json()).entries.some(e=>e.id===changed.id&&e.data.mainTitle==='Updated'),true);
  await call(email,'DELETE',changed);await call(email,'DELETE',independent);
  ok(resolveLetterTitles((await call(email,'GET')).entries,true)[5],{page:5,chapter:'MEMORY 06',chineseSubtitle:'一生',mainTitle:'Our Life to Come',overridden:false});
 }
 for(const data of [{page:-1,chineseSubtitle:'a',mainTitle:'a'},{page:6,chineseSubtitle:'a',mainTitle:'a'},{page:1.5,chineseSubtitle:'a',mainTitle:'a'},{page:0,chineseSubtitle:'a',mainTitle:'  '},{page:0,chineseSubtitle:'a'.repeat(81),mainTitle:'a'},{page:0,chineseSubtitle:'a',mainTitle:'a'.repeat(161)},{page:0,chineseSubtitle:null,mainTitle:'a'},{page:0,chineseSubtitle:'a',mainTitle:'a',order:2}])await call(members[0],'POST',{id:crypto.randomUUID(),kind:'letter-title',data},400);
 for(const config of [undefined,'',' ','broken-email']){if(config===undefined)delete globalThis.__giftTestEnv.EDITOR_EMAILS;else globalThis.__giftTestEnv.EDITOR_EMAILS=config;for(const email of members)await call(email,'GET',undefined,403);}
 }finally{globalThis.__giftTestEnv=savedEnv;}
 console.log(`PASS: ${count} Memory title checks.`);return count;
}
