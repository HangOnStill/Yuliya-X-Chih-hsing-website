import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

export async function checkClientPrivacy(){
 const directory=await mkdtemp(join(tmpdir(),'yc-client-privacy-'));
 const originalFetch=globalThis.fetch,originalWindow=globalThis.window;
 let checks=0;
 try{
  const output=join(directory,'render.mjs');
  await build({stdin:{contents:`
   import React from 'react';
   import {renderToString} from 'react-dom/server';
   import Gift from './app/birthday-gift';
   import {request} from './lib/wish-drafts';
   import {notifyArchiveDenied,archiveDeniedEvent} from './lib/archive-client';
   export {request,notifyArchiveDenied,archiveDeniedEvent};
   export function render(allowed,signedIn){return renderToString(React.createElement(Gift,{canAccessArchive:allowed,signedIn,signInUrl:'/signin-with-chatgpt',questions:Array.from({length:6},(_,i)=>({title:'Public question '+i,text:'Public static text',success:'Public feedback'}))}));}
  `,resolveDir:process.cwd(),loader:'js'},outfile:output,bundle:true,platform:'node',format:'esm',logLevel:'silent',loader:{'.css':'empty'},banner:{js:"import {createRequire as createTestRequire} from 'node:module'; const require=createTestRequire(import.meta.url);"}});
  const client=await import(pathToFileURL(output));
  let calls=0;
  globalThis.fetch=async()=>{calls++;throw new Error('No private fetch during server render');};
  for(const signedIn of [false,true]){
   const html=client.render(false,signedIn);
   assert(html.includes('Love letter'));assert(html.includes('Our personal archive is private.'));
   assert(!html.includes('/api/media/'));assert(!html.includes('/api/assets/'));
   assert(!html.includes('photo-card'));assert(!html.includes('archive-chapters'));checks++;
  }
  const memberHtml=client.render(true,true);
  assert(!memberHtml.includes('/api/media/'));assert(!memberHtml.includes('/api/assets/'));
  assert.equal(calls,0);checks++;
  // Exercise the actual request helper and denial signal, not a copied guard.
  globalThis.window=new EventTarget();let denied=0;
  window.addEventListener(client.archiveDeniedEvent,()=>denied++);
  for(const status of [401,403]){
   globalThis.fetch=async()=>Response.json({error:'Access denied'},{status});
   await assert.rejects(client.request('/api/photos'),/Access denied/);checks++;
  }
  assert.equal(denied,2);checks++;
  globalThis.fetch=async()=>Response.json({photos:[]});
  assert.deepEqual(await client.request('/api/photos'),{photos:[]});assert.equal(denied,2);checks++;
  client.notifyArchiveDenied(403);assert.equal(denied,3);checks++;
  client.notifyArchiveDenied(500);assert.equal(denied,3);checks++;
  console.log(`PASS: ${checks} client privacy checks (real SSR shell and shared JSON/media denial notification).`);
  return checks;
 }finally{
  globalThis.fetch=originalFetch;
  if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow;
  await rm(directory,{recursive:true,force:true});
 }
}
