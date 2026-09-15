// Server-only. Native incremental SHA-256; never buffer the complete upload.
import {createHash} from 'node:crypto';
import {HttpError} from './server';
import {mediaSignature} from './v5-server';
export const PREFIX_BYTES=4096;
export const PART_BYTES=5*1024*1024;

export function memorySignature(b:Uint8Array,mime:string){
 const ascii=(start:number,n:number)=>String.fromCharCode(...b.subarray(start,start+n));
 if(['video/mp4','audio/mp4','audio/x-m4a'].includes(mime)){
  if(b.length<16||ascii(4,4)!=='ftyp')return false;
  const size=new DataView(b.buffer,b.byteOffset,b.byteLength).getUint32(0);
  return size>=16&&size<=b.length&&size<=PREFIX_BYTES&&size%4===0;
 }
 if(mime==='video/webm'||mime==='audio/webm'){
  if(b.length<5||ascii(0,4)!=='\x1a\x45\xdf\xa3')return false;
  function vint(pos:number,id=false){
   const first=b[pos];if(!first)return null;let n=1,mask=128;while(!(first&mask)){mask>>=1;n++;}
   if(n>(id?4:8)||pos+n>b.length)return null;
   let value=id?first:first&(mask-1);for(let j=1;j<n;j++)value=value*256+b[pos+j];
   return Number.isSafeInteger(value)?{value,n}:null;
  }
  const header=vint(4);if(!header)return false;const end=4+header.n+header.value;
  if(end>b.length||end>PREFIX_BYTES)return false;
  let pos=4+header.n,webm=false;
  while(pos<end){const id=vint(pos,true);if(!id)return false;pos+=id.n;const size=vint(pos);if(!size)return false;pos+=size.n;if(pos+size.value>end)return false;if(id.value===0x4282)webm=ascii(pos,size.value)==='webm';pos+=size.value;}
  return webm&&pos===end;
 }
 return mediaSignature(b,mime);
}

// Caller must authorize before invoking. No metadata is inserted by this helper.
// Completed bytes remain private until the caller inserts D1 metadata; its catch
// path owns cleanup after successful return. Incomplete multipart uploads abort.
export async function storeMemoryStream(req:Request,store:R2Bucket,key:string,mime:string,limit:number){
 const header=req.headers.get('content-length');
 const declared=header!==null&&/^\d+$/.test(header)?Number(header):null;
 if(declared!==null&&(!Number.isSafeInteger(declared)||declared>limit))throw new HttpError(413,'This file exceeds the upload limit.');
 if(!req.body)throw new HttpError(400,'No file was received.');
 const reader=req.body.getReader(),hash=createHash('sha256');
 let size=0,completed=false,multipart:R2MultipartUpload|undefined;
 async function read(){
  let result:ReadableStreamReadResult<Uint8Array>;
  try{result=await reader.read();}catch{throw new HttpError(400,'The upload was interrupted. Please retry this file.');}
  if(!result.done){size+=result.value.byteLength;if(size>limit)throw new HttpError(413,'This file exceeds the upload limit.');hash.update(result.value);}
  return result;
 }
 try{
  const prefix=new Uint8Array(PREFIX_BYTES);let used=0,tail:Uint8Array|undefined,eof=false;
  while(used<PREFIX_BYTES){const r=await read();if(r.done){eof=true;break;}const n=Math.min(PREFIX_BYTES-used,r.value.length);prefix.set(r.value.subarray(0,n),used);used+=n;if(n<r.value.length)tail=r.value.subarray(n);}
  if(!memorySignature(prefix.subarray(0,used),mime))throw new HttpError(415,'The file signature does not match the selected media format.');
  async function* chunks(){yield prefix.subarray(0,used);if(tail)yield tail;while(!eof){const r=await read();if(r.done){eof=true;break;}yield r.value;}}
  // R2 requires a stream of known length. Use it when supplied by the request.
  if(declared!==null&&typeof FixedLengthStream!=='undefined'){
   const stream=new FixedLengthStream(declared),writer=stream.writable.getWriter();
   let failure:unknown;
   const pump=(async()=>{try{for await(const chunk of chunks())await writer.write(chunk);if(size!==declared)throw new HttpError(400,'The upload was incomplete. Please retry this file.');await writer.close();}catch(e){failure=e;await writer.abort(e).catch(()=>{});throw e;}})();
   const put=store.put(key,stream.readable,{httpMetadata:{contentType:mime}}).catch(async e=>{await reader.cancel().catch(()=>{});await writer.abort(e).catch(()=>{});throw e;});
   const results=await Promise.allSettled([pump,put]);
   if(failure)throw failure;
   for(const r of results)if(r.status==='rejected')throw r.reason;
  }else{
   // Missing/unknown length cannot safely use an unbounded tee or full buffer.
   // One 5 MiB part, sequential uploadPart calls, and <=30 retained ETags.
   multipart=await store.createMultipartUpload(key,{httpMetadata:{contentType:mime}});
   const parts:R2UploadedPart[]=[];let part=new Uint8Array(PART_BYTES),filled=0;
   for await(const chunk of chunks()){
    let offset=0;while(offset<chunk.length){const n=Math.min(PART_BYTES-filled,chunk.length-offset);part.set(chunk.subarray(offset,offset+n),filled);filled+=n;offset+=n;if(filled===PART_BYTES){parts.push(await multipart.uploadPart(parts.length+1,part));part=new Uint8Array(PART_BYTES);filled=0;}}
   }
   if(declared!==null&&size!==declared)throw new HttpError(400,'The upload was incomplete. Please retry this file.');
   if(filled)parts.push(await multipart.uploadPart(parts.length+1,part.subarray(0,filled)));
   await multipart.complete(parts);
  }
  completed=true;
  return {size,digest:hash.digest('hex')};
 }catch(e){
  await reader.cancel().catch(()=>{});
  if(multipart&&!completed)await multipart.abort().catch(()=>{});
  // Handles a put/complete whose response failed after the object was written.
  await store.delete(key);
  throw e;
 }finally{reader.releaseLock();}
}
