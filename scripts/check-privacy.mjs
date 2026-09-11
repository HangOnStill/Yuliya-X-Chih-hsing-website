import assert from 'node:assert/strict';

// Runs only inside check-gift's ephemeral Miniflare instance.
export async function checkPrivacy(f){
 const {DB,BUCKET,photos,photo,media,wishes,entries,assets,asset,journey,backup}=f;
 const env=globalThis.__giftTestEnv;
 const members=['bounniecrisis@gmail.com','changyue960915@gmail.com'];
 const configured=members.join(',');
 let checks=0;
 const ctx=id=>({params:Promise.resolve({id})});
 function request(path,method='GET',email=members[0],data,extra={}){
  return new Request('https://gift.test'+path,{method,headers:{...(email?{'oai-authenticated-user-id':email===members[1]?'partner-id':'owner-id','oai-authenticated-user-email':email}:{}),'content-type':'application/json',...extra},...(data===undefined?{}:{body:data instanceof Uint8Array?data:JSON.stringify(data)})});
 }
 async function expect(response,status){assert.equal(response.status,status,await response.clone().text());assert.equal(response.headers.get('cache-control'),'private, no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');checks++;return response;}
 async function json(response,status=200){return (await expect(response,status)).json();}
 const routes=[
  ['/api/photos','GET',photos.GET],['/api/photos','POST',photos.POST],
  ['/api/photos/'+f.photoId,'PATCH',photo.PATCH,f.photoId],['/api/photos/'+f.photoId,'DELETE',photo.DELETE,f.photoId],
  ['/api/media/'+f.photoId,'GET',media.GET,f.photoId],['/api/media/'+f.photoId,'HEAD',media.HEAD,f.photoId],
  ['/api/wishes','GET',wishes.GET],['/api/wishes','POST',wishes.POST],['/api/wishes','PATCH',wishes.PATCH],['/api/wishes','DELETE',wishes.DELETE],
  ['/api/entries','GET',entries.GET],['/api/entries','POST',entries.POST],['/api/entries','PATCH',entries.PATCH],['/api/entries','DELETE',entries.DELETE],
  ['/api/assets','GET',assets.GET],['/api/assets','POST',assets.POST],
  ['/api/assets/'+f.voiceId,'GET',asset.GET,f.voiceId],['/api/assets/'+f.voiceId,'HEAD',asset.HEAD,f.voiceId],['/api/assets/'+f.voiceId,'DELETE',asset.DELETE,f.voiceId],
  ['/api/journey','GET',journey.GET],['/api/backup','POST',backup.POST]
 ];
 // Poison bindings prove denial occurs BEFORE any D1/R2 operation, rather
 // than inferring safety from unchanged row counts after a request.
 let storageTouches=0;
 const poison=new Proxy({}, {get(){storageTouches++;throw new Error('Unauthorized storage access');}});
 async function deniedMatrix(email,status,extra={}){
  for(const [path,method,handler,id] of routes){
   const r=await expect(await handler(request(path+'?email='+members[0],method,email,['GET','HEAD'].includes(method)?undefined:{confirmFullArchive:true,email:members[0]},extra),ctx(id)),status);
   assert.equal(r.headers.get('content-range'),null);assert.equal(r.headers.get('content-length'),null);
   const body=await r.text();assert(!body.includes(f.photoId));assert(!body.includes(f.lockedId));
  }
 }
 try{
  env.DB=poison;env.BUCKET=poison;env.EDITOR_EMAILS=configured;
  for(const flag of ['true','false',undefined,'TRUE']){
   env.PUBLIC_READ=flag;
   await deniedMatrix(null,401);
   await deniedMatrix('outsider@example.test',403,{'cookie':'email='+members[0],'x-person':'Yuliya'});
  }
  await deniedMatrix(members[0],401,{'oai-authenticated-user-email':''});
  await deniedMatrix(members[0],401,{'oai-authenticated-user-id':''});
  await deniedMatrix(members[0],401,{'oai-authenticated-user-id':'first,second'});
  await deniedMatrix(members[0],401,{'oai-authenticated-user-email':members.join(',')});
  const invalid=[undefined,'','   ','not-an-email',members[0]+',invalid',members[0]+',',','+members[0],members.join(';')];
  for(const list of invalid){
   env.EDITOR_EMAILS=list;
   for(const flag of ['true','false']){
    env.PUBLIC_READ=flag;
    for(const email of members)await deniedMatrix(email,403);
    // Public quiz needs neither the allowlist nor a database, even for a
    // signed-in account whose archive membership is currently disabled.
    for(const email of [null,...members]){
     const answer=await json(await journey.POST(request('/api/journey','POST',email,{index:0,answer:'Vistopia'})));
     assert.equal(answer.correct,true);assert.equal(answer.temporary,true);
    }
   }
  }
  env.EDITOR_EMAILS=configured;
  for(const email of [null,'outsider@example.test'])for(const id of [f.voiceId,f.originalId,f.lockedAssetId,f.draftAssetId]){
   for(const method of ['GET','HEAD'])for(const range of [undefined,'bytes=0-3','bytes=999999999-']){
    const r=await expect(await asset[method](request('/api/assets/'+id,method,email,undefined,range?{range}:{}),ctx(id)),email?403:401);
    assert.equal(r.headers.get('content-range'),null);assert.equal(r.headers.get('content-length'),null);
   }
  }
  for(const email of [null,'outsider@example.test'])for(const method of ['GET','HEAD'])for(const range of ['bytes=0-3','bytes=999999999-']){
   const r=await expect(await media[method](request('/api/media/'+f.photoId,method,email,undefined,{range}),ctx(f.photoId)),email?403:401);
   assert.equal(r.headers.get('content-range'),null);assert.equal(r.headers.get('content-length'),null);
  }
  assert.equal(storageTouches,0);checks++;
 }finally{env.DB=DB;env.BUCKET=BUCKET;env.EDITOR_EMAILS=configured;env.PUBLIC_READ='true';}

 // Actual binary GET/HEAD/range and logical reads by BOTH configured users.
 for(const email of members){
  for(const [path,handler] of [['/api/photos',photos.GET],['/api/wishes',wishes.GET],['/api/entries',entries.GET],['/api/assets',assets.GET],['/api/journey',journey.GET]])await json(await handler(request(path,'GET',email)));
  for(const [id,route,handler] of [[f.photoId,'media',media],[f.voiceId,'assets',asset],[f.originalId,'assets',asset],[f.draftAssetId,'assets',asset]]){
   for(const method of ['GET','HEAD'])for(const range of [undefined,'bytes=0-3','bytes=999999999-']){
    const r=await expect(await handler[method](request('/api/'+route+'/'+id,method,email,undefined,range?{range}:{}),ctx(id)),range==='bytes=999999999-'?416:range?206:200);
    if(method==='HEAD')assert.equal((await r.arrayBuffer()).byteLength,0);
    else if(range==='bytes=0-3')assert.equal((await r.arrayBuffer()).byteLength,4);
    else if(!range)assert((await r.arrayBuffer()).byteLength>0);
   }
  }
  const listed=(await json(await entries.GET(request('/api/entries','GET',email)))).entries;
  assert.equal(listed.find(e=>e.id===f.lockedId).data.body,'');assert.equal(listed.find(e=>e.id===f.lockedId).locked,true);
  assert(listed.find(e=>e.id===f.openId).data.body);assert(listed.find(e=>e.id===f.draftId).data.body);checks++;
  assert.equal((await json(await assets.GET(request('/api/assets?parentId='+f.lockedId,'GET',email)))).assets.length,0);
  for(const method of ['GET','HEAD'])await expect(await asset[method](request('/api/assets/'+f.lockedAssetId,method,email,undefined,{'x-client-time':'2100-01-01'}),ctx(f.lockedAssetId)),423);

  // Each member creates/edits/deletes intended records and uploads media.
  const bytes=new Uint8Array([...f.png,email===members[0]?21:22]);
  let p=(await json(await photos.POST(request('/api/photos','POST',email,bytes,{'content-type':'image/png','x-file-name':'synthetic.png'})),201)).photo;
  p=(await json(await photo.PATCH(request('/api/photos/'+p.id,'PATCH',email,{...p,title:'Private synthetic photo'}),ctx(p.id)))).photo;
  const w={id:crypto.randomUUID(),title:'Synthetic wish',notes:'Test only',category:'Other',status:'Dreaming',priority:'Someday',url:'',budget:null,currency:'',dueDate:''};
  let ws=await json(await wishes.POST(request('/api/wishes','POST',email,{items:[w]})),201);
  let wish=ws.wishes.find(x=>x.id===w.id);
  wish=(await json(await wishes.PATCH(request('/api/wishes','PATCH',email,{...wish,notes:'Edited test wish'})))).wish;
  const plan=listed.find(e=>e.kind==='plan').data;
  const fixtureEntries=[
   {kind:'memory',data:{title:'Synthetic memory',date:'2026-09-11',notes:'Private reflection',photoIds:[p.id],wishId:w.id,place:'',lat:null,lng:null},completeWish:true,wishRevision:wish.revision},
   {kind:'perspective',data:{photoId:p.id,person:'Yuliya',text:'Synthetic perspective'}},
   {kind:'interest',data:{wishId:w.id,person:'Chih-hsing',selected:true}},
   {kind:'nickname',data:{name:'Synthetic nickname',person:'Yuliya',since:'',origin:'Private origin',funnyMoment:'Private funny moment'}},
   {kind:'plan',data:{...plan,title:'Synthetic plan'}},
   {kind:'capsule',data:{title:'Synthetic letter',body:'Private test body',person:'Yuliya',occasion:'Birthday',unlockAt:'2099-09-11T00:00:00.000Z',stage:'draft'}}
  ];
  for(const input of fixtureEntries){
   let e=(await json(await entries.POST(request('/api/entries','POST',email,{id:crypto.randomUUID(),...input})),201)).entry;
   if(e.kind==='capsule'){
    const letterAsset=(await json(await assets.POST(request('/api/assets','POST',email,f.png,{'content-type':'image/png','x-parent-type':'capsule','x-parent-id':e.id,'x-asset-purpose':'attachment'})),201)).asset;
    await expect(await asset.GET(request('/api/assets/'+letterAsset.id,'GET',email),ctx(letterAsset.id)),200);
    await json(await asset.DELETE(request('/api/assets/'+letterAsset.id,'DELETE',email),ctx(letterAsset.id)));
   }
   e=(await json(await entries.PATCH(request('/api/entries','PATCH',email,e)))).entry;
   await json(await entries.DELETE(request('/api/entries','DELETE',email,{id:e.id,revision:e.revision})));
  }
  const a=(await json(await assets.POST(request('/api/assets','POST',email,f.audioBytes,{'content-type':'audio/webm','x-parent-type':'photo','x-parent-id':p.id,'x-asset-purpose':'voice'})),201)).asset;
  await expect(await asset.GET(request('/api/assets/'+a.id,'GET',email),ctx(a.id)),200);
  await json(await asset.DELETE(request('/api/assets/'+a.id,'DELETE',email),ctx(a.id)));
  // Video bytes follow the same membership/range path as photographs.
  const mp4=new Uint8Array([0,0,0,24,...Buffer.from('ftypisom'),email===members[0]?31:32]);
  const v=(await json(await photos.POST(request('/api/photos','POST',email,mp4,{'content-type':'video/mp4'})),201)).photo;
  const video=await expect(await media.GET(request('/api/media/'+v.id,'GET',email),ctx(v.id)),200);
  assert.equal(video.headers.get('content-type'),'video/mp4');assert.deepEqual(new Uint8Array(await video.arrayBuffer()),mp4);
  await json(await photo.DELETE(request('/api/photos/'+v.id+'?revision='+v.revision,'DELETE',email),ctx(v.id)));
  await json(await photo.DELETE(request('/api/photos/'+p.id+'?revision='+p.revision,'DELETE',email),ctx(p.id)));
  wish=(await json(await wishes.GET(request('/api/wishes','GET',email)))).wishes.find(x=>x.id===w.id);
  assert.equal(wish.status,'Done');
  await json(await wishes.DELETE(request('/api/wishes','DELETE',email,{id:w.id,revision:wish.revision})));

  // Private poetry survives independent comments, conflicts and full export.
  let poem=(await json(await entries.POST(request('/api/entries','POST',email,{id:crypto.randomUUID(),kind:'poem',data:{title:'Private poem',author:'Us',text:'First line\n<script>literal text</script>',yuliyaComment:'Y perspective',chihComment:'C perspective'}})),201)).entry;
  const stale=structuredClone(poem);
  poem=(await json(await entries.PATCH(request('/api/entries','PATCH',email,{...poem,data:{...poem.data,yuliyaComment:'Y revised'}})))).entry;
  assert.equal(poem.data.chihComment,'C perspective');checks++;
  await expect(await entries.PATCH(request('/api/entries','PATCH',email,stale)),409);
  const letter=(await json(await entries.POST(request('/api/entries','POST',email,{id:crypto.randomUUID(),kind:'letter-poem',data:{slot:5,title:poem.data.title,author:poem.data.author,text:poem.data.text}})),201)).entry;
  await expect(await entries.POST(request('/api/entries','POST',email,{...letter,id:crypto.randomUUID()})),409);
  await expect(await entries.POST(request('/api/entries','POST',email,{...letter,id:crypto.randomUUID(),data:{...letter.data,slot:6}})),400);
  await expect(await entries.POST(request('/api/entries','POST',email,{...poem,id:crypto.randomUUID(),data:{...poem.data,text:'   '}})),400);
  for(const denied of [null,'outsider@example.test'])await expect(await entries.GET(request('/api/entries','GET',denied)),denied?403:401);
  await expect(await backup.POST(request('/api/backup','POST',email,{})),400);
  const full=await json(await backup.POST(request('/api/backup','POST',email,{confirmFullArchive:true})));
  assert(full.entries.find(e=>e.id===f.lockedId).data.body);checks++;
  assert.deepEqual(full.entries.find(e=>e.id===poem.id).data,poem.data);
  assert.deepEqual(full.entries.find(e=>e.id===letter.id).data,letter.data);checks++;
  await json(await entries.DELETE(request('/api/entries','DELETE',email,{id:poem.id,revision:poem.revision})));
  const retained=(await json(await entries.GET(request('/api/entries','GET',email)))).entries.find(e=>e.id===letter.id);
  assert.equal(retained.data.text,poem.data.text);checks++;
  await json(await entries.PATCH(request('/api/entries','PATCH',email,{...retained,data:{...retained.data,text:'New direct poem'}})));
  await json(await entries.DELETE(request('/api/entries','DELETE',email,{id:letter.id,revision:letter.revision+1})));

  const url='/api/assets/'+f.lockedAssetId+'?export='+full.exportToken;
  await expect(await asset.GET(request(url,'GET',email),ctx(f.lockedAssetId)),200);
  for(const denied of [null,'outsider@example.test'])await expect(await asset.GET(request(url,'GET',denied),ctx(f.lockedAssetId)),denied?403:401);
  await expect(await asset.GET(request(url,'GET',members.find(x=>x!==email)),ctx(f.lockedAssetId)),423);
  await DB.prepare('UPDATE export_tickets SET expires_at=? WHERE id=?').bind('2000-01-01',full.exportToken).run();
  await expect(await asset.GET(request(url,'GET',email),ctx(f.lockedAssetId)),423);
 }
 // Normalize whitespace/case, while rejecting partial malformed lists above.
 env.EDITOR_EMAILS=' BOUNNIECRISIS@gmail.com , CHANGYUE960915@gmail.com ';
 await json(await photos.GET(request('/api/photos','GET','BOUNNIECRISIS@GMAIL.COM')));
 env.EDITOR_EMAILS=configured;
 await expect(await wishes.POST(request('/api/wishes','POST',members[0],{}, {origin:'https://outside.test'})),403);
 await expect(await journey.POST(request('/api/journey','POST',null,{index:0,answer:'Vistopia'}, {origin:'https://outside.test'})),403);
 await expect(await journey.POST(request('/api/journey','GET',null)),405);
 console.log(`PASS: ${checks} privacy regression cases (including no-storage-touch denials, both members' reads/writes, ranges, videos, letter locks and fresh export tickets).`);
 return checks;
}
