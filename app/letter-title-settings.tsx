"use client";
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Entry,letterTitleData} from '@/lib/v5-models';
import {resolveLetterTitles} from '@/lib/letter-titles';
import {saveEntry,deleteEntry} from '@/lib/v5-client';
import {Field,Confirm} from './gift-controls';
type TitleEntry=Extract<Entry,{kind:'letter-title'}>;
export function LetterTitleSettings({entries,error,refresh}:{entries:Entry[];error:string;refresh:()=>unknown}){
 return <section className="letter-title-settings"><h3>Memory titles</h3><p>Private chapter titles · 自訂標題只供我們閱讀。中文副題可留空。</p>{error?<p role="alert">{error}</p>:resolveLetterTitles(entries,true).map(t=>{const entry=entries.find((e):e is TitleEntry=>e.kind==='letter-title'&&e.data.page===t.page);return <TitleEditor key={t.page} page={t.page} entry={entry} refresh={refresh}/>;})}</section>;
}
function TitleEditor({page,entry,refresh}:{page:number;entry?:TitleEntry;refresh:()=>unknown}){
 const initial=resolveLetterTitles(entry?[entry]:[],true)[page];
 // Retain the revision captured when editing began; remote refresh cannot silently overwrite a draft.
 const [base,setBase]=useState(entry),[id,setId]=useState(()=>entry?.id||crypto.randomUUID());
 const [data,setData]=useState({page,chineseSubtitle:initial.chineseSubtitle,mainTitle:initial.mainTitle});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[confirm,setConfirm]=useState(false);
 const changedElsewhere=(entry?.revision!==base?.revision||entry?.id!==base?.id);
 function reload(){const title=resolveLetterTitles(entry?[entry]:[],true)[page];setBase(entry);setId(entry?.id||crypto.randomUUID());setData({page,chineseSubtitle:title.chineseSubtitle,mainTitle:title.mainTitle});setError('');}
 async function save(){const v=letterTitleData.safeParse(data);if(!v.success){setError(v.error.issues[0].message);return;}setBusy(true);try{const saved=await saveEntry({id,kind:'letter-title',data:v.data},base) as TitleEntry;setBase(saved);setData(saved.data);setError('');refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function reset(){if(!base)return;setBusy(true);try{await deleteEntry(base);const title=resolveLetterTitles()[page];setBase(undefined);setId(crypto.randomUUID());setData({page,chineseSubtitle:title.chineseSubtitle,mainTitle:title.mainTitle});setConfirm(false);setError('');refresh();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <div className="letter-title-card"><h4>{initial.chapter}</h4><p className="small-meta">{base?'Private override':'Built-in default'}</p><fieldset disabled={busy}><Field id={`title-zh-${page}`} label="Chinese subtitle"><Input id={`title-zh-${page}`} value={data.chineseSubtitle} maxLength={80} onChange={e=>setData({...data,chineseSubtitle:e.target.value})}/></Field><Field id={`title-main-${page}`} label="Main title"><Input id={`title-main-${page}`} value={data.mainTitle} maxLength={160} required onChange={e=>setData({...data,mainTitle:e.target.value})}/></Field></fieldset>{error&&<p role="alert">{error}</p>}{changedElsewhere&&<p>Saved version changed. <Button variant="outline" onClick={reload} disabled={busy}>Load latest (discard draft)</Button></p>}<div className="dialog-actions"><Button disabled={busy} onClick={save}>Save</Button><Button variant="outline" disabled={busy||!base} onClick={()=>setConfirm(true)}>Reset to default</Button></div><Confirm open={confirm} busy={busy} title="Reset this chapter title?" description="The private override will be removed and the original title will return." onClose={()=>setConfirm(false)} onConfirm={reset}/></div>;
}
