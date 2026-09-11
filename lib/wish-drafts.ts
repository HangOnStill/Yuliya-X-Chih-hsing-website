import {notifyArchiveDenied} from './archive-client';
import {WishInput,duplicateKey,safeUrl} from './models';
export type Draft = WishInput & {selected:boolean;duplicate?:string;ai?:boolean};
export function makeDraft(text=''):Draft{return {id:crypto.randomUUID(),title:text,notes:'',category:'Other',status:'Dreaming',priority:'Someday',url:'',budget:null,currency:'',dueDate:'',selected:true};}
export function splitDrafts(text:string,existing:{title:string;url:string}[]=[]):Draft[]{
 const parts=text.normalize('NFKC').split(/\n+|[;；]+|[。！？]+(?=\s*[^\s])/u).map(s=>s.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/,'').trim()).filter(Boolean);
 if(parts.length>30)throw new Error('Please review up to 30 wishes at a time.');
 return parts.map((part,index)=>{const item=makeDraft();const link=part.match(/https?:\/\/[^\s<>，。；、]+/i)?.[0]?.replace(/[),.!?]+$/,'')||'';if(link&&safeUrl.safeParse(link).success)item.url=link;
 const without=link?part.replace(link,'').trim():part;item.title=(without||(item.url?new URL(item.url).hostname:part)).slice(0,160);item.notes=part.length>160?part:'';
 const amount=part.match(/\b(CAD|USD|CNY|EUR|GBP)\s*([\d,]+(?:\.\d{1,2})?)\b/i)||part.match(/\b([\d,]+(?:\.\d{1,2})?)\s*(CAD|USD|CNY|EUR|GBP)\b/i);
 if(amount){const firstIsCode=/^[A-Z]{3}$/i.test(amount[1]);item.currency=(firstIsCode?amount[1]:amount[2]).toUpperCase() as WishInput['currency'];item.budget=Number((firstIsCode?amount[2]:amount[1]).replaceAll(',',''));}
 const same=[...existing,...parts.slice(0,index).map(title=>({title,url:''}))].find(w=>duplicateKey(w)===duplicateKey(item));if(same){item.duplicate=same.title;item.selected=false;}return item;});
}
export async function request<T=any>(url:string,options?:RequestInit):Promise<T>{let r:Response;try{r=await fetch(url,{...options,headers:{...(options?.body instanceof Blob?{}:{'Content-Type':'application/json'}),...options?.headers},cache:'no-store'});}catch{throw new Error('Could not connect. Your input is still here; please try again.');}notifyArchiveDenied(r.status);const result:any=await r.json().catch(()=>({error:'The archive is temporarily unavailable.'}));if(!r.ok)throw new Error(result.error||'Please try again.');return result as T;}
