import assert from 'node:assert/strict';
export async function checkRefreshMedia({entries,photos,photo,media,backup,DB,module}){
 let count=0;const ok=(a,b)=>{assert.deepEqual(a,b);count++;};
 const req=(method='GET',body,email='bounniecrisis@gmail.com',headers={})=>new Request('https://gift.test/api/photos',{method,headers:{'content-type':'application/json',...(email?{'oai-authenticated-user-id':'refresh-'+email,'oai-authenticated-user-email':email}:{}),...headers},...(body!==undefined?{body:body instanceof Uint8Array?body:JSON.stringify(body)}:{})});
 async function call(handler,request,status=200,ctx){const r=await handler(request,ctx);ok(r.status,status);return r.json();}
 await DB.prepare('INSERT OR REPLACE INTO journey(user_id,unlocked) VALUES(?,?)').bind('refresh-owner',6).run();
 await DB.prepare('INSERT OR REPLACE INTO journey(user_id,unlocked) VALUES(?,?)').bind('refresh-partner',2).run();
 const progress=async()=>[(await DB.prepare('SELECT unlocked FROM journey WHERE user_id=?').bind('refresh-owner').first()).unlocked,(await DB.prepare('SELECT unlocked FROM journey WHERE user_id=?').bind('refresh-partner').first()).unlocked];
 const data={page:3,question:'Updated question',answer:'answer',successFeedback:'',wrongFeedback:'',emptyFeedback:''};
 let saved=(await call(entries.POST,req('POST',{id:crypto.randomUUID(),kind:'letter-question',data}),201)).entry;
 ok(await progress(),[3,2]);
 await DB.prepare('UPDATE journey SET unlocked=6 WHERE user_id=?').bind('refresh-owner').run();
 const old=saved;saved=(await call(entries.PATCH,req('PATCH',{...saved,data:{...data,answer:'new answer'}},'changyue960915@gmail.com'))).entry;
 ok(await progress(),[3,2]);
 await DB.prepare('UPDATE journey SET unlocked=6 WHERE user_id=?').bind('refresh-owner').run();
 await call(entries.PATCH,req('PATCH',old),409);ok(await progress(),[6,2]);
 await call(entries.DELETE,req('DELETE',old),409);ok(await progress(),[6,2]);
 await call(entries.DELETE,req('DELETE',saved));ok(await progress(),[3,2]);
 const bytesByMime=[['audio/mpeg',new Uint8Array([73,68,51,0,0,0,0,0])],['audio/wav',new Uint8Array([...Buffer.from('RIFF'),0,0,0,0,...Buffer.from('WAVE'),0])],['audio/ogg',new Uint8Array([...Buffer.from('OggS'),0,0,0,0])],['audio/mp4',new Uint8Array([0,0,0,24,...Buffer.from('ftypM4A '),0])],['audio/webm',new Uint8Array([26,69,223,163,1,2,3,4])],['video/webm',new Uint8Array([26,69,223,163,5,6,7,8])],['video/mp4',new Uint8Array([0,0,0,24,...Buffer.from('ftypmp42'),1,2])]];
 for(const [mime,bytes] of bytesByMime){
  const p=(await call(photos.POST,req('POST',bytes,undefined,{'content-type':mime,'x-file-name':'PHASE3V_TEST_media'}),201)).photo;
  ok(p.kind,mime.startsWith('audio')?'audio':'video');ok(p.slot,null);
  const ctx={params:Promise.resolve({id:p.id})};
  for(const email of ['bounniecrisis@gmail.com','changyue960915@gmail.com']){
   const r=await media.GET(req('GET',undefined,email),ctx);ok(r.status,200);ok(new Uint8Array(await r.arrayBuffer()),bytes);ok(r.headers.get('cache-control'),'private, no-store');
   const head=await media.HEAD(req('HEAD',undefined,email),ctx);ok((await head.arrayBuffer()).byteLength,0);
   const range=await media.GET(req('GET',undefined,email,{range:'bytes=0-3'}),ctx);ok(range.status,206);ok((await range.arrayBuffer()).byteLength,4);
   ok((await media.GET(req('GET',undefined,email,{range:'bytes=9999999-'}),ctx)).status,416);
  }
  for(const email of [null,'outsider@example.test'])for(const method of ['GET','HEAD'])ok((await media[method](req(method,undefined,email),ctx)).status,email?403:401);
  await call(photo.PATCH,req('PATCH',{...p,slot:0}),400,ctx);
  const full=await call(backup.POST,req('POST',{confirmFullArchive:true}));ok(full.photos.some(x=>x.id===p.id&&x.kind===p.kind),true);
 }
 await call(photos.POST,req('POST',new Uint8Array([1,2,3]),undefined,{'content-type':'audio/mpeg'}),415);
 const {builtinPoetry}=await module('lib/builtin-poetry.ts','builtin-poetry');const {poemSets}=await module('lib/poems.ts','poem-sets');
 const unique=new Set(poemSets.flatMap(s=>s.poems).map(p=>p.source+'\n'+p.lines.join('\n')));ok(builtinPoetry.length,unique.size);
 for(const p of poemSets.flatMap(s=>s.poems))ok(builtinPoetry.some(b=>b.author===p.source&&b.text===p.lines.join('\n')),true);
 console.log(`PASS: ${count} progress reset, media library, and ${builtinPoetry.length} built-in poem checks.`);return count;
}
