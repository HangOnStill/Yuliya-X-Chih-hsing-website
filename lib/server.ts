import {env} from 'cloudflare:workers';
import {ZodError} from 'zod';
import {canEdit,publicReading} from './access';
export class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
export function db(){if(!env.DB)throw new HttpError(503,'The archive is temporarily unavailable. Your input has been kept; please try again.');return env.DB;}
export function bucket(){if(!env.BUCKET)throw new HttpError(503,'Photo storage is temporarily unavailable. Please try again.');return env.BUCKET;}
export function sameOrigin(req:Request){if(!['GET','HEAD'].includes(req.method)){const origin=req.headers.get('origin');if((origin&&origin!==new URL(req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Please save from this website.');}}
export function identity(req:Request){const user=req.headers.get('oai-authenticated-user-id');if(!user)throw new HttpError(401,'Sign in with an invited editor account to change this archive.');sameOrigin(req);return user;}
export function authorize(req:Request,publicQuiz=false){
 sameOrigin(req);
 if(publicReading()&&(['GET','HEAD'].includes(req.method)||publicQuiz))return;
 identity(req);
 if(!['GET','HEAD'].includes(req.method)&&!canEdit(req))throw new HttpError(403,'This archive is view-only for your account.');
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
export async function boundedBody(req:Request,max:number){if(Number(req.headers.get('content-length'))>max)throw new HttpError(413,'This file is too large.');const reader=req.body?.getReader();if(!reader)throw new HttpError(400,'No content was received.');const chunks:Uint8Array[]=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new HttpError(413,'This file is too large.');}chunks.push(value);}const out=new Uint8Array(size);let offset=0;for(const c of chunks){out.set(c,offset);offset+=c.length;}return out;}
export async function body(req:Request){try{return JSON.parse(new TextDecoder().decode(await boundedBody(req,128000)));}catch(e){if(e instanceof HttpError)throw e;throw new HttpError(400,'Please check your entry.');}}
export function api(fn:(req:Request,ctx:any)=>Promise<Response>,options:{publicQuiz?:boolean}={}){return async(req:Request,ctx:any)=>{try{authorize(req,options.publicQuiz);return await fn(req,ctx);}catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);if(e instanceof ZodError)return json({error:e.issues[0]?.message||'Please check the fields.'},400);console.error('Archive request failed',e instanceof Error?e.message:'unknown');return json({error:'We could not complete that request. Your input has been kept; please try again.'},503);}};}
export const photoSelect='SELECT id, kind, filename, mime, size, title, note, tags, taken_at AS takenAt, favorite, slot, created_at AS createdAt, revision FROM photos';
export const wishSelect='SELECT id,title,notes,category,status,priority,url,budget,currency,due_date AS dueDate,created_at AS createdAt,updated_at AS updatedAt,revision FROM wishes';
