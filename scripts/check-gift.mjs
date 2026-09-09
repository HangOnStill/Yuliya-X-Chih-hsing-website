import {Miniflare} from 'miniflare';
import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
const dir=await mkdtemp(join(tmpdir(),'yc-check-'));
const mf=new Miniflare({modules:true,script:'export default {fetch(){return new Response("test")}}',compatibilityDate:'2026-05-15',d1Databases:['DB'],r2Buckets:['BUCKET'],cf:false});
let checks=0;
async function module(path,name){const out=join(dir,name+'.mjs');await build({entryPoints:[path],outfile:out,bundle:true,platform:'node',format:'esm',logLevel:'silent',plugins:[{name:'isolated-test-bindings',setup(b){b.onResolve({filter:/^cloudflare:workers$/},()=>({path:'cloudflare:workers',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__giftTestEnv;',loader:'js'}));}}]});return import(pathToFileURL(out));}
function req(path,method='GET',data,extra={}){return new Request('https://gift.test'+path,{method,headers:{'oai-authenticated-user-id':'test-viewer','content-type':'application/json',...extra},...(data!==undefined?{body:typeof data==='string'||data instanceof Uint8Array?data:JSON.stringify(data)}:{})});}
async function result(r,expected=200){assert.equal(r.status,expected,await r.clone().text());checks++;return r.json();}
try{
 const DB=await mf.getD1Database('DB'),BUCKET=await mf.getR2Bucket('BUCKET');globalThis.__giftTestEnv={DB,BUCKET};
 for(const f of (await readdir('drizzle')).filter(f=>f.endsWith('.sql')).sort())for(const sql of (await readFile('drizzle/'+f,'utf8')).split('--> statement-breakpoint').filter(s=>s.trim()))await DB.prepare(sql).run();
 const photos=await module('app/api/photos/route.ts','photos'),photo=await module('app/api/photos/[id]/route.ts','photo'),media=await module('app/api/media/[id]/route.ts','media'),wishes=await module('app/api/wishes/route.ts','wishes'),journey=await module('app/api/journey/route.ts','journey'),drafts=await module('lib/wish-drafts.ts','drafts');
 await result(await photos.GET(new Request('https://gift.test/api/photos')),401);
 await result(await wishes.POST(req('/api/wishes','POST',{items:[]},{origin:'https://other.test'})),403);
 const parsed=drafts.splitDrafts('想一起看極光\nA camera CAD 250; https://example.com/gift',[]);assert.equal(parsed.length,3);assert.equal(parsed[1].budget,250);assert.equal(parsed[1].currency,'CAD');assert.equal(parsed[2].url,'https://example.com/gift');checks+=4;
 assert.equal(drafts.splitDrafts('Pottery class',[{title:'pottery class',url:''}])[0].selected,false);checks++;
 const item={...drafts.makeDraft('Learn pottery together'),category:'Learning'};
 await result(await wishes.POST(req('/api/wishes','POST',{items:[item]})),201);
 await result(await wishes.POST(req('/api/wishes','POST',{items:[item]})),201);
 let ws=(await result(await wishes.GET(req('/api/wishes')))).wishes;assert.equal(ws.length,1);checks++;
 await result(await wishes.POST(req('/api/wishes','POST',{items:[{...item,id:crypto.randomUUID(),url:'javascript:alert(1)'}]})),400);
 const updated=(await result(await wishes.PATCH(req('/api/wishes','PATCH',{...ws[0],status:'Done'})))).wish;assert.equal(updated.status,'Done');checks++;
 await result(await wishes.PATCH(req('/api/wishes','PATCH',{...ws[0],status:'Planning'})),409);
 const png=new Uint8Array(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==','base64'));
 await result(await photos.POST(req('/api/photos','POST',new Uint8Array([1,2,3]),{'content-type':'image/png'})),415);
 const saved=(await result(await photos.POST(req('/api/photos','POST',png,{'content-type':'image/png','x-file-name':encodeURIComponent('First memory.png')})),201)).photo;
 assert.equal((await result(await photos.POST(req('/api/photos','POST',png,{'content-type':'image/png'})))).duplicate,true);checks++;
 const context={params:Promise.resolve({id:saved.id})};
 const paired=(await result(await photo.PATCH(req('/api/photos/'+saved.id,'PATCH',{...saved,title:'First meeting',slot:0}),context))).photo;assert.equal(paired.slot,0);checks++;
 await result(await photo.PATCH(req('/api/photos/'+saved.id,'PATCH',{...saved,title:'Old edit',slot:1}),context),409);
 const secondBytes=new Uint8Array([...png,0]);const second=(await result(await photos.POST(req('/api/photos','POST',secondBytes,{'content-type':'image/png'})),201)).photo;
 await result(await photo.PATCH(req('/api/photos/'+second.id,'PATCH',{...second,slot:0}),{params:Promise.resolve({id:second.id})}));
 const rows=(await result(await photos.GET(req('/api/photos')))).photos;assert.equal(rows.find(p=>p.id===saved.id).slot,null);assert.equal(rows.find(p=>p.id===second.id).slot,0);checks+=2;
 const bytes=await media.GET(req('/api/media/'+saved.id,'GET',undefined,{range:'bytes=0-3'}),context);assert.equal(bytes.status,206);assert.equal((await bytes.arrayBuffer()).byteLength,4);checks+=2;
 await result(await journey.POST(req('/api/journey','POST',{index:3,answer:'hospital'})),400);
 const answers=['Vistopia','2026-5-21','marriage','hospital','知足常越','lifetime'];for(let i=0;i<6;i++){const r=await result(await journey.POST(req('/api/journey','POST',{index:i,answer:answers[i]})));assert.equal(r.correct,true);assert.equal(r.unlocked,i+1);checks+=2;}
 assert.equal((await result(await journey.GET(req('/api/journey')))).unlocked,6);checks++;
 await result(await wishes.DELETE(req('/api/wishes','DELETE',{id:updated.id,revision:updated.revision})));
 assert.equal((await result(await wishes.GET(req('/api/wishes')))).wishes.length,0);checks++;
 console.log(`PASS: ${checks} checks covering persisted wishes, photo uploads, duplicate handling, photo-question reassignment, media ranges, quiz continuity, validation, auth and revision conflicts.`);
}finally{await mf.dispose();await rm(dir,{recursive:true,force:true});delete globalThis.__giftTestEnv;}
