import assert from 'node:assert/strict';
import {unzipSync} from 'fflate';

export async function checkLargeBackup({module}){
 const original={fetch:globalThis.fetch,window:globalThis.window,localStorage:globalThis.localStorage};let count=0;
 try{
  const {exportBackup}=await module('lib/keepsake-export.ts','large-backup');
  globalThis.localStorage={getItem:()=>null};
  for(const size of [1024,100*1024*1024]){
   let written=0,maxWrite=0,closed=false,aborted=false,offset=0;const parts=[];
   globalThis.window={showSaveFilePicker:async()=>({createWritable:async()=>({write:async b=>{written+=b.length;maxWrite=Math.max(maxWrite,b.length);if(size===1024)parts.push(b.slice());},close:async()=>{closed=true;},abort:async()=>{aborted=true;}})})};
   globalThis.fetch=async url=>String(url)==='/api/backup'?Response.json({exportToken:'synthetic-ticket',photos:[{id:'test',filename:'synthetic.mp4',size}],assets:[],entries:[]}):new Response(new ReadableStream({pull(c){if(offset===size){c.close();return;}const b=new Uint8Array(Math.min(65536,size-offset));offset+=b.length;c.enqueue(b);}},{highWaterMark:0}));
   await exportBackup(()=>{},new AbortController().signal);
   assert.equal(closed,true);assert.equal(aborted,false);assert(written>size);assert(maxWrite<=65536);count+=4;
   if(size===1024){const all=new Uint8Array(written);let p=0;for(const b of parts){all.set(b,p);p+=b.length;}const files=unzipSync(all);assert.equal(files['media/test-synthetic.mp4'].length,1024);assert(!new TextDecoder().decode(files['manifest.json']).includes('synthetic-ticket'));count+=2;}
  }
  for(const failure of ['incomplete','denied','cancelled']){
   let aborted=false,closed=false;const controller=new AbortController();
   globalThis.window=new EventTarget();window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async()=>{},close:async()=>{closed=true;},abort:async()=>{aborted=true;}})});
   globalThis.fetch=async url=>String(url)==='/api/backup'?Response.json({photos:[{id:'test',filename:'test.mp4',size:1024}],assets:[]}):failure==='denied'?new Response('',{status:403}):new Response(new Uint8Array(5));
   if(failure==='cancelled')controller.abort();
   await assert.rejects(exportBackup(()=>{},controller.signal));assert.equal(aborted,true);assert.equal(closed,false);count+=3;
  }
  let mediaRequests=0;globalThis.window={};globalThis.fetch=async url=>{if(String(url)!=='/api/backup')mediaRequests++;return Response.json({photos:[{id:'large',filename:'large.mp4',size:257*1024*1024}],assets:[]});};
  await assert.rejects(exportBackup(()=>{},new AbortController().signal),/too large/);assert.equal(mediaRequests,0);count+=2;
  console.log(`PASS: ${count} ZIP checks, including a generated 100 MiB backup with <=64 KiB sink writes, content verification, cancellation and privacy denial.`);return count;
 }finally{for(const [key,value] of Object.entries(original)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
}
