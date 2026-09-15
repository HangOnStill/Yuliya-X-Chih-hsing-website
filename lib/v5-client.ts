"use client";
import {useCallback,useEffect,useState} from 'react';
import {request} from './wish-drafts';
import {Entry,EntryInput,Asset} from './v5-models';
import {memoryLimits,memoryKind,MiB} from './memory-upload-policy';
import {notifyArchiveDenied} from './archive-client';
async function sendMemory(file:Blob,mime:string,filename:string){
 let response:Response;
 try{response=await fetch('/api/photos',{method:'POST',body:file,credentials:'same-origin',cache:'no-store',headers:{'Content-Type':mime,'X-File-Name':encodeURIComponent(filename),'X-Upload-Scope':'memory-library'}});}catch{throw new Error('The network connection was interrupted. Retry this file; saved memories are safe.');}
 notifyArchiveDenied(response.status);
 if(response.status===401||response.status===403)throw new Error('Archive access is unavailable. Sign in with an authorized account before retrying.');
 const data=await response.json().catch(()=>null) as {photo?:import('./models').Photo;duplicate?:boolean;error?:string}|null;
 if(!response.ok){
  if(!data)throw new Error(response.status===413?'The hosting service rejected this file size. Try a smaller file.':'The hosting service rejected the upload. Please retry later.');
  throw new Error(data.error||'This file could not be stored. Please retry.');
 }
 if(!data?.photo)throw new Error('The upload response was interrupted. Retry to check whether this file was saved.');
 return {...data,photo:data.photo};
}
export function announceChange(){window.dispatchEvent(new Event('yc-archive-change'));}
export function useEntries(active=true){const [entries,setEntries]=useState<Entry[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false),[loaded,setLoaded]=useState(false);const refresh=useCallback(async()=>{setLoading(true);try{const r=await request('/api/entries');setEntries(r.entries);setError('');}catch(e){setError((e as Error).message);}finally{setLoading(false);setLoaded(true);}},[]);useEffect(()=>{if(!active)return;refresh();const update=()=>{if(document.visibilityState==='visible')refresh();};window.addEventListener('yc-archive-change',update);window.addEventListener('focus',update);return()=>{window.removeEventListener('yc-archive-change',update);window.removeEventListener('focus',update);};},[active,refresh]);return {entries,error,loading,loaded,refresh};}
export async function saveEntry(v:EntryInput,existing?:Entry,extra?:Record<string,unknown>){const r=await request('/api/entries',{method:existing?'PATCH':'POST',body:JSON.stringify({...v,...(existing?{revision:existing.revision}:{}),...extra})});announceChange();return r.entry as Entry;}
export async function deleteEntry(v:Entry){await request('/api/entries',{method:'DELETE',body:JSON.stringify({id:v.id,revision:v.revision})});announceChange();}
export function useAssets(parentId:string){const [assets,setAssets]=useState<Asset[]>([]),[error,setError]=useState('');const refresh=useCallback(async()=>{try{const r=await request('/api/assets?parentId='+encodeURIComponent(parentId));setAssets(r.assets);setError('');}catch(e){setError((e as Error).message);}},[parentId]);useEffect(()=>{refresh();},[refresh]);return {assets,error,refresh};}
export async function uploadAsset(file:Blob,filename:string,parentType:Asset['parentType'],parentId:string,purpose:Asset['purpose'],person='Yuliya'){const r=await request('/api/assets',{method:'POST',body:file,headers:{'Content-Type':file.type,'X-File-Name':encodeURIComponent(filename),'X-Parent-Type':parentType,'X-Parent-Id':parentId,'X-Asset-Purpose':purpose,'X-Person':person}});announceChange();return r.asset as Asset;}
export const photoAccept='image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif';
export const memoryAccept=photoAccept+',video/mp4,video/webm,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/ogg,audio/webm,.mp4,.webm,.mp3,.m4a,.wav,.ogg';
export async function uploadMemory(file:File){
 if(file.type.startsWith('image/')||isHeic(file))return uploadPhoto(file);
 const mime=file.type||({mp4:'video/mp4',webm:'video/webm',mp3:'audio/mpeg',m4a:'audio/mp4',wav:'audio/wav',ogg:'audio/ogg'} as Record<string,string>)[file.name.split('.').pop()?.toLowerCase()||''];
 if(!mime||!['video/mp4','video/webm','audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg','audio/webm'].includes(mime))throw new Error('Choose a supported photo, audio, or video file.');
 const kind=memoryKind(mime),limit=memoryLimits[kind];
 if(file.size>limit)throw new Error(`Choose ${kind} up to ${limit/MiB} MB.`);
 const r=await sendMemory(file,mime,file.name);announceChange();return r;
}
export function isHeic(file:File){return /\.(heic|heif)$/i.test(file.name)||['image/heic','image/heif'].includes(file.type);}
export async function preparePhoto(file:File,displayLimit=12*MiB):Promise<File>{if(file.size>24*1024*1024)throw new Error('Choose a HEIC source up to 24 MB.');if(!isHeic(file)){if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type))throw new Error('Choose JPG, PNG, WebP, GIF, or HEIC.');if(file.size>displayLimit)throw new Error(`This photograph is over ${displayLimit/MiB} MB.`);return file;}let blob:Blob;try{const {default:convert}=await import('heic2any');const result=await convert({blob:file,toType:'image/jpeg',quality:.9});blob=Array.isArray(result)?result[0]:result;}catch{throw new Error('This HEIC variant could not be converted. Export it as JPEG in Photos, then try again.');}if(blob.size>displayLimit)throw new Error(`The converted photo exceeds ${displayLimit/MiB} MB. Export a smaller JPEG in Photos.`);return new File([blob],file.name.replace(/\.(heic|heif)$/i,'')+'.jpg',{type:'image/jpeg'});}
export async function uploadPhoto(file:File){const prepared=await preparePhoto(file,memoryLimits.photo);const r=await sendMemory(prepared,prepared.type,prepared.name);if(isHeic(file)){try{await uploadAsset(new Blob([file],{type:/heif$/i.test(file.name)?'image/heif':'image/heic'}),file.name,'photo',r.photo.id,'original');}catch(e){throw new Error('The JPEG was saved, but the HEIC original was not. Retry this upload to finish saving the original. '+(e as Error).message);}}announceChange();return r;}
export function downloadBlob(blob:Blob,name:string){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
