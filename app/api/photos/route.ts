import {api,db,bucket,json,photoSelect,boundedBody,HttpError} from '@/lib/server';
import {mediaSignature} from '@/lib/v5-server';
import {memoryLimits,memoryTypes,memoryKind,MiB} from '@/lib/memory-upload-policy';
import {storeMemoryStream} from '@/lib/stream-memory-upload';
export const GET=api(async()=>json({photos:(await db().prepare(photoSelect+' ORDER BY created_at DESC').all()).results}));
function validBytes(b:Uint8Array,mime:string){const ascii=(a:number,n:number)=>String.fromCharCode(...b.slice(a,a+n));return (mime==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)||(mime==='image/png'&&b[0]===137&&ascii(1,3)==='PNG')||(mime==='image/gif'&&['GIF87a','GIF89a'].includes(ascii(0,6)))||(mime==='image/webp'&&ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP')||(mime==='video/mp4'&&ascii(4,4)==='ftyp');}
export const POST=api(async req=>{const mime=(req.headers.get('content-type')||'').split(';')[0];const kind=memoryKind(mime);if(!memoryTypes.includes(mime))throw new HttpError(415,'Choose a supported photo, MP4/WebM video, or MP3/M4A/WAV/OGG/WebM audio file.');
 // A separate scope preserves the dedicated surprise-video upload's old limit.
 const library=req.headers.get('x-upload-scope')==='memory-library';
 if(library&&kind!=='photo'){
  let filename='Memory';try{filename=decodeURIComponent(req.headers.get('x-file-name')||'Memory').slice(0,240);}catch{}
  const id=crypto.randomUUID(),key=`media/${id}`;
  const stored=await storeMemoryStream(req,bucket(),key,mime,memoryLimits[kind]);
  let inserted=false,insertAttempted=false;
  try{
   const existing=await db().prepare(photoSelect+' WHERE digest=?').bind(stored.digest).first();
   if(existing){await bucket().delete(key);return json({photo:existing,duplicate:true});}
   insertAttempted=true;
   await db().prepare('INSERT INTO photos(id,kind,filename,mime,size,object_key,digest,title,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,kind,filename,mime,stored.size,key,stored.digest,filename.replace(/\.[^.]+$/,'').slice(0,160)||'Memory',new Date().toISOString()).run();
   inserted=true;
   return json({photo:await db().prepare(photoSelect+' WHERE id=?').bind(id).first(),duplicate:false},201);
  }catch(e){
   // Do not remove bytes after a confirmed insert if a response read fails.
   if(!inserted){
    if(!insertAttempted){await bucket().delete(key);throw e;}
    // Reconcile an ambiguous D1 response before removing a possibly saved object.
    const own=await db().prepare(photoSelect+' WHERE id=?').bind(id).first();
    if(own)return json({photo:own,duplicate:false},201);
    await bucket().delete(key);
    const raced=await db().prepare(photoSelect+' WHERE digest=?').bind(stored.digest).first();
    if(raced)return json({photo:raced,duplicate:true});
   }
   throw e;
  }
 }
 const bytes=await boundedBody(req,kind==='photo'?memoryLimits.photo:24*MiB);if(!(kind==='audio'?mediaSignature(bytes,mime):mime==='video/webm'?mediaSignature(bytes,'audio/webm'):validBytes(bytes,mime)))throw new HttpError(415,'The file contents do not match a supported memory format.');
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
 const exists=await db().prepare(photoSelect+' WHERE digest=?').bind(digest).first();if(exists)return json({photo:exists,duplicate:true});
 let filename='Memory';try{filename=decodeURIComponent(req.headers.get('x-file-name')||'Memory').slice(0,240);}catch{}
 const id=crypto.randomUUID(),key=`media/${id}`,now=new Date().toISOString();await bucket().put(key,bytes,{httpMetadata:{contentType:mime}});
 try{await db().prepare('INSERT INTO photos(id,kind,filename,mime,size,object_key,digest,title,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,kind,filename,mime,bytes.length,key,digest,filename.replace(/\.[^.]+$/,'').slice(0,160)||'Memory',now).run();}
 catch(e){await bucket().delete(key);const raced=await db().prepare(photoSelect+' WHERE digest=?').bind(digest).first();if(raced)return json({photo:raced,duplicate:true});throw e;}
 return json({photo:await db().prepare(photoSelect+' WHERE id=?').bind(id).first(),duplicate:false},201);
});
