import {api,db,bucket,json,photoSelect,boundedBody,HttpError} from '@/lib/server';
export const GET=api(async()=>json({photos:(await db().prepare(photoSelect+' ORDER BY created_at DESC').all()).results}));
function validBytes(b:Uint8Array,mime:string){const ascii=(a:number,n:number)=>String.fromCharCode(...b.slice(a,a+n));return (mime==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)||(mime==='image/png'&&b[0]===137&&ascii(1,3)==='PNG')||(mime==='image/gif'&&['GIF87a','GIF89a'].includes(ascii(0,6)))||(mime==='image/webp'&&ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP')||(mime==='video/mp4'&&ascii(4,4)==='ftyp');}
export const POST=api(async req=>{const mime=(req.headers.get('content-type')||'').split(';')[0];const kind=mime==='video/mp4'?'video':'photo';if(!['image/jpeg','image/png','image/gif','image/webp','video/mp4'].includes(mime))throw new HttpError(415,'Please choose a JPG, PNG, WebP, GIF, or MP4 file. Export HEIC photos as JPEG first.');
 const bytes=await boundedBody(req,(kind==='video'?24:12)*1024*1024);if(!validBytes(bytes,mime))throw new HttpError(415,'The file contents do not match a supported photo or video.');
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
 const exists=await db().prepare(photoSelect+' WHERE digest=?').bind(digest).first();if(exists)return json({photo:exists,duplicate:true});
 let filename='Memory';try{filename=decodeURIComponent(req.headers.get('x-file-name')||'Memory').slice(0,240);}catch{}
 const id=crypto.randomUUID(),key=`media/${id}`,now=new Date().toISOString();await bucket().put(key,bytes,{httpMetadata:{contentType:mime}});
 try{await db().prepare('INSERT INTO photos(id,kind,filename,mime,size,object_key,digest,title,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,kind,filename,mime,bytes.length,key,digest,filename.replace(/\.[^.]+$/,'').slice(0,160)||'Memory',now).run();}
 catch(e){await bucket().delete(key);const raced=await db().prepare(photoSelect+' WHERE digest=?').bind(digest).first();if(raced)return json({photo:raced,duplicate:true});throw e;}
 return json({photo:await db().prepare(photoSelect+' WHERE id=?').bind(id).first(),duplicate:false},201);
});
