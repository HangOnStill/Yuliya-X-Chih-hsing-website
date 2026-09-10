import {api,db,bucket,json,HttpError} from '@/lib/server';
export const GET=api(async(req,ctx)=>{
 const {id}=await ctx.params;
 const p=await db().prepare('SELECT object_key,mime,size FROM photos WHERE id=?').bind(id).first<{object_key:string;mime:string;size:number}>();
 if(!p)throw new HttpError(404,'Photo not found.');
 const header=req.headers.get('range');let range:{offset:number;length:number}|undefined;
 if(header){const m=/^bytes=(\d*)-(\d*)$/.exec(header);let start=NaN,end=NaN;
  if(m&&(m[1]||m[2])){if(m[1]){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),p.size-1):p.size-1;}else{start=Math.max(0,p.size-Number(m[2]));end=p.size-1;}}
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=p.size||end<start)return new Response(null,{status:416,headers:{'Content-Range':`bytes */${p.size}`}});
  range={offset:start,length:end-start+1};
 }
 const o=await bucket().get(p.object_key,range?{range}:undefined);
 if(!o)return json({error:'Photo not found.'},404);
 const h=new Headers({'Content-Type':p.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','ETag':o.httpEtag});
 if(range){h.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${o.size}`);h.set('Content-Length',String(range.length));}else h.set('Content-Length',String(o.size));
 return new Response(o.body,{status:range?206:200,headers:h});
});
