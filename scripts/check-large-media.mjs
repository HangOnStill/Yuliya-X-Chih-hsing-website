import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

// Generated streams, not committed binaries. Test sinks count bytes rather
// than collecting them, so boundary tests also exercise backpressure.
export async function checkLargeMedia({module,photos,media,photo,backup,DB,BUCKET}){
 let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++;};
 const {storeMemoryStream,memorySignature,PART_BYTES,PREFIX_BYTES}=await module('lib/stream-memory-upload.ts','large-upload');
 const {memoryLimits,MiB}=await module('lib/memory-upload-policy.ts','large-policy');
 const {boundedBody}=await module('lib/server.ts','large-server');
 const mp4=Uint8Array.from([0,0,0,24,...Buffer.from('ftypisom'),0,0,0,0,...Buffer.from('isommp42')]);
 const webm=Uint8Array.from([0x1a,0x45,0xdf,0xa3,0x87,0x42,0x82,0x84,...Buffer.from('webm')]);
 const wav=Uint8Array.from([...Buffer.from('RIFF'),0,0,0,0,...Buffer.from('WAVE')]);
 function generated(size,prefix=mp4){let offset=0,cancelled=false;const stream=new ReadableStream({pull(c){if(offset===size){c.close();return;}const b=new Uint8Array(Math.min(65536,size-offset));if(!offset)b.set(prefix.subarray(0,b.length));offset+=b.length;c.enqueue(b);},cancel(){cancelled=true;}},{highWaterMark:0});return {stream,read:()=>offset,cancelled:()=>cancelled};}
 function request(stream,mime='video/mp4',length,email='bounniecrisis@gmail.com',extra={}){return new Request('https://gift.test/api/photos',{method:'POST',duplex:'half',body:stream,headers:{'content-type':mime,'x-upload-scope':'memory-library','x-file-name':'PHASE3V_TEST_V12_SYNTHETIC',...(length!==undefined?{'content-length':String(length)}:{}),...(email?{'oai-authenticated-user-id':'large-'+email,'oai-authenticated-user-email':email}:{}),...extra}});}
 function sink(){const state={maxPart:0,parts:0,bytes:0,aborted:false,deleted:false,complete:false};return {state,createMultipartUpload:async()=>({uploadPart:async(n,b)=>{state.maxPart=Math.max(state.maxPart,b.byteLength);state.bytes+=b.byteLength;state.parts++;return {partNumber:n,etag:String(n)};},complete:async()=>{state.complete=true;},abort:async()=>{state.aborted=true;}}),delete:async()=>{state.deleted=true;}};}
 for(const kind of ['audio','video'])for(const delta of [-1,0,1]){
  const size=memoryLimits[kind]+delta,g=generated(size,kind==='audio'?wav:mp4),s=sink();
  const action=storeMemoryStream(request(g.stream,kind==='audio'?'audio/wav':'video/mp4'),s,'synthetic',kind==='audio'?'audio/wav':'video/mp4',memoryLimits[kind]);
  if(delta>0){await assert.rejects(action,e=>e.status===413);count++;eq(s.state.aborted,true);eq(s.state.deleted,true);eq(g.cancelled(),true);}
  else{const r=await action;eq(r.size,size);eq(s.state.bytes,size);eq(s.state.complete,true);assert(s.state.maxPart<=PART_BYTES);count++;}
 }
 for(const delta of [-1,0,1]){const size=memoryLimits.photo+delta,g=generated(size);const action=boundedBody(request(g.stream,'image/png'),memoryLimits.photo);if(delta>0){await assert.rejects(action,e=>e.status===413);count++;}else eq((await action).byteLength,size);}
 for(const [mime,limit] of [['audio/wav',memoryLimits.audio],['video/mp4',memoryLimits.video]]){
  const g=generated(10),s=sink();await assert.rejects(storeMemoryStream(request(g.stream,mime,limit+1),s,'early',mime,limit),e=>e.status===413);count++;eq(g.read(),0);eq(s.state.parts,0);
 }
 const g=generated(131071),s=sink(),expected=createHash('sha256');expected.update(mp4);expected.update(new Uint8Array(131071-mp4.length));eq((await storeMemoryStream(request(g.stream),s,'hash','video/mp4',memoryLimits.video)).digest,expected.digest('hex'));
 // Forged small Content-Length is never authoritative for the byte counter.
 await assert.rejects(storeMemoryStream(request(generated(8193).stream,'video/mp4',1),sink(),'false-length','video/mp4',8192),e=>e.status===413);count++;
 eq(memorySignature(mp4,'video/mp4'),true);eq(memorySignature(mp4.subarray(0,13),'video/mp4'),false);
 eq(memorySignature(webm,'video/webm'),true);eq(memorySignature(new Uint8Array([26,69,223,163,5,6,7,8]),'video/webm'),false);
 for(const mime of ['video/mp4','video/webm','audio/wav','audio/mpeg']){const s=sink();await assert.rejects(storeMemoryStream(request(generated(6000,new Uint8Array([1,2,3])).stream,mime),s,'spoof',mime,10000),e=>e.status===415);count++;eq(s.state.parts,0);}
 const broken=new ReadableStream({start(c){c.enqueue(mp4);c.error(new Error('network'));}});await assert.rejects(storeMemoryStream(request(broken),sink(),'broken','video/mp4',10000),e=>e.status===400);count++;
 for(const phase of ['part','complete']){const s=sink(),create=s.createMultipartUpload;s.createMultipartUpload=async()=>{const m=await create();m[phase==='part'?'uploadPart':'complete']=async()=>{throw new Error('synthetic storage failure');};return m;};await assert.rejects(storeMemoryStream(request(generated(6000).stream),s,'storage-failure','video/mp4',10000),/synthetic storage failure/);eq(s.state.aborted,true);eq(s.state.deleted,true);count++;}
 const before=await BUCKET.list();
 for(const [email,extra,status] of [[null,{},401],['outsider@example.test',{},403],['bounniecrisis@gmail.com',{origin:'https://outside.test'},403]]){const r=await photos.POST(request(generated(6000).stream,'video/mp4',undefined,email,extra));eq(r.status,status);}
 eq((await BUCKET.list()).objects.length,before.objects.length);
 let saved;
 for(const email of ['bounniecrisis@gmail.com','changyue960915@gmail.com']){const r=await photos.POST(request(generated(6000).stream,'video/mp4',undefined,email));eq(r.status,saved?200:201);const data=await r.json();eq(data.duplicate,!!saved);if(!saved)saved=data.photo;else eq(data.photo.id,saved.id);}
 const row=await DB.prepare('SELECT object_key,digest FROM photos WHERE id=?').bind(saved.id).first();eq((await BUCKET.head(row.object_key)).size,6000);
 const ctx={params:Promise.resolve({id:saved.id})};
 for(const email of [null,'outsider@example.test'])for(const method of ['GET','HEAD'])for(const range of [undefined,'bytes=0-9','bytes=999999-']){const r=await media[method](new Request('https://gift.test/api/media/'+saved.id,{method,headers:{...(email?{'oai-authenticated-user-id':'outsider','oai-authenticated-user-email':email}:{}),...(range?{range}:{})}}),ctx);eq(r.status,email?403:401);eq(r.headers.get('cache-control'),'private, no-store');}
 const headers={'oai-authenticated-user-id':'large-owner','oai-authenticated-user-email':'bounniecrisis@gmail.com'};
 const exportResponse=await backup.POST(new Request('https://gift.test/api/backup',{method:'POST',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({confirmFullArchive:true})}));eq((await exportResponse.json()).photos.some(p=>p.id===saved.id&&p.size===6000),true);
 // Insert-only failure allows reconciliation reads and must remove R2 bytes.
 const env=globalThis.__giftTestEnv;const real=env.DB;
 env.DB={prepare(sql){if(sql.startsWith('INSERT INTO photos'))return {bind(){return {run:async()=>{throw new Error('synthetic insert failure');}};}};return real.prepare(sql);}};
 try{const r=await photos.POST(request(generated(6001).stream));eq(r.status,503);}finally{env.DB=real;}
 eq((await BUCKET.list()).objects.length,before.objects.length+1);
 env.DB={prepare(){throw new Error('synthetic lookup outage');}};
 try{eq((await photos.POST(request(generated(6002).stream))).status,503);}finally{env.DB=real;}
 eq((await BUCKET.list()).objects.length,before.objects.length+1);
 const del=await photo.DELETE(new Request('https://gift.test/api/photos/'+saved.id+'?revision='+saved.revision,{method:'DELETE',headers}),ctx);eq(del.status,200);eq(await BUCKET.head(row.object_key),null);
 eq(await DB.prepare('SELECT id FROM photos WHERE id=?').bind(saved.id).first(),null);
 console.log(`PASS: ${count} V12 size/signature/hash/privacy/cleanup checks; unknown-length part <=${PART_BYTES}, prefix ${PREFIX_BYTES}, input chunks 65536 bytes.`);
 return count;
}
