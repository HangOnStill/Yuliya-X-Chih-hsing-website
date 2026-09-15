import {Miniflare} from 'miniflare';
import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

// Run the actual helper inside workerd, with native crypto, FixedLengthStream
// and R2. The generator and verifier never materialize the complete object.
export async function checkLargeRuntime(){
 const dir=await mkdtemp(join(tmpdir(),'yc-large-runtime-'));let mf;
 try{
  const out=join(dir,'worker.mjs');
  await build({stdin:{contents:`
   import {storeMemoryStream} from './lib/stream-memory-upload';
   export default {async fetch(req,env){
    const url=new URL(req.url),size=Number(url.searchParams.get('size')),unknown=url.searchParams.has('unknown');
    let offset=0,maxChunk=0;const prefix=new Uint8Array([0,0,0,24,102,116,121,112,105,115,111,109,0,0,0,0,105,115,111,109,109,112,52,50]);
    const body=new ReadableStream({pull(c){if(offset===size){c.close();return;}const b=new Uint8Array(Math.min(65536,size-offset));if(!offset)b.set(prefix);offset+=b.length;maxChunk=Math.max(maxChunk,b.length);c.enqueue(b);}},{highWaterMark:0});
    const input=new Request('https://test/upload',{method:'POST',headers:unknown?{}:{'content-length':String(size)},body});
    const key='synthetic-'+crypto.randomUUID();
    const bucket=unknown?{delete:k=>env.BUCKET.delete(k),async createMultipartUpload(k,o){const m=await env.BUCKET.createMultipartUpload(k,o);console.log('Multipart created');return {async uploadPart(n,b){console.log('Part start',n,b.length);const r=await m.uploadPart(n,b);console.log('Part done',n);return r;},async complete(parts){console.log('Complete start');const r=await m.complete(parts);console.log('Complete done');return r;},abort:()=>m.abort()};}}:env.BUCKET;
    try{const result=await storeMemoryStream(input,bucket,key,'video/mp4',100*1024*1024);
     const head=await env.BUCKET.head(key),range=await env.BUCKET.get(key,{range:{offset:size-16,length:16}});
     return Response.json({...result,stored:head.size,tail:[...new Uint8Array(await range.arrayBuffer())],maxChunk,native:typeof FixedLengthStream});
    }catch(e){return Response.json({error:e.message,status:e.status}, {status:e.status||500});}
    finally{await env.BUCKET.delete(key);}
   }};`,resolveDir:process.cwd(),loader:'ts'},outfile:out,bundle:true,format:'esm',platform:'neutral',external:['cloudflare:workers','node:crypto'],logLevel:'silent'});
  mf=new Miniflare({modules:true,script:await readFile(out,'utf8'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],r2Buckets:['BUCKET'],cf:false});
  let checks=0;
  for(const [size,unknown] of [[65536,false],[100*1024*1024,false],[6*1024*1024+1,true]]){
   console.log('Checking native R2 stream:',size,'bytes; unknown length:',unknown);
   const response=await mf.dispatchFetch('https://test/?size='+size+(unknown?'&unknown=1':''));const result=await response.json();
   assert.equal(response.status,200,JSON.stringify(result));assert.equal(result.size,size);assert.equal(result.stored,size);assert.equal(result.maxChunk,65536);assert.equal(result.native,'function');assert.deepEqual(result.tail,Array(16).fill(0));assert.match(result.digest,/^[a-f0-9]{64}$/);checks+=7;
  }
  const bucket=await mf.getR2Bucket('BUCKET');assert.equal((await bucket.list()).objects.length,0);checks++;
  console.log('PASS: '+checks+' native Workers/R2 checks, including 100 MiB fixed-length streaming; generated chunks <=64 KiB. This is local runtime evidence, not a Sites size probe.');
  return checks;
 }finally{await mf?.dispose();await rm(dir,{recursive:true,force:true});}
}
