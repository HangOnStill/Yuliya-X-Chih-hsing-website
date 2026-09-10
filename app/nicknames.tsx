"use client";
import {useState} from 'react';
import {Smile,Plus,Search,Pencil,Trash2,BookOpen} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Entry,nicknameData,people} from '@/lib/v5-models';
import {useEntries,saveEntry,deleteEntry} from '@/lib/v5-client';
import {normalized} from '@/lib/models';
import {Choice,Field,Confirm} from './gift-controls';
import {toast} from 'sonner';

type Nickname=Extract<Entry,{kind:'nickname'}>;

export default function Nicknames({active}:{active:boolean}){
 const {entries,error,loading,loaded,refresh}=useEntries(active);
 const [person,setPerson]=useState('All'),[query,setQuery]=useState('');
 const [editing,setEditing]=useState<Nickname|'new'|null>(null),[reading,setReading]=useState<Nickname|null>(null),[removing,setRemoving]=useState<Nickname|null>(null),[busy,setBusy]=useState(false);
 const nicknames=entries.filter((e):e is Nickname=>e.kind==='nickname');
 const shown=nicknames.filter(e=>(person==='All'||e.data.person===person)&&normalized([e.data.name,e.data.origin,e.data.funnyMoment].join(' ')).includes(normalized(query)));
 async function remove(){if(!removing||busy)return;setBusy(true);try{await deleteEntry(removing);setRemoving(null);refresh();toast.success('Nickname removed.');}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}
 return <section>
  <div className="section-top"><div><p className="eyebrow">OUR PRIVATE DICTIONARY · 暱稱小本</p><h2>Only you call me that.</h2><p className="quiet">那些只有彼此懂的稱呼，和一想起來就會笑的瞬間。</p></div><Button onClick={()=>setEditing('new')}><Plus size={17}/>Add a nickname · 新增暱稱</Button></div>
  <div className="nickname-toolbar"><div className="nickname-search"><Search size={17} aria-hidden="true"/><Input aria-label="Search nicknames, origins and funny moments · 搜尋暱稱、緣起與趣事" placeholder="搜尋暱稱、緣起、搞笑瞬間…" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="filter-row" aria-label="Whose nicknames · 誰的暱稱">{['All',...people].map(p=><Button key={p} variant={person===p?'secondary':'ghost'} aria-pressed={person===p} onClick={()=>setPerson(p)}>{p==='All'?'Both of us · 全部':p}<span className="nickname-count">{nicknames.filter(e=>p==='All'||e.data.person===p).length}</span></Button>)}</div></div>
  {error&&<div className="error-banner" role="alert">{error}<Button variant="outline" onClick={refresh}>Retry</Button></div>}
  {loading&&!loaded&&<p role="status" className="quiet">Opening our little dictionary…</p>}
  <div className="nickname-grid">{shown.map(e=><article className="v5-card nickname-card" key={e.id}>
   <div className="nickname-card-top"><span className="nickname-person"><Smile size={14}/>{e.data.person}</span>{e.data.since&&<time dateTime={e.data.since}>{e.data.since}</time>}</div>
   <h3>「{e.data.name}」</h3>
   <div className="nickname-snippet"><p className="eyebrow">HOW IT BEGAN · 緣起</p><p>{e.data.origin||'這個稱呼的故事，等我們慢慢補上。'}</p></div>
   {e.data.funnyMoment&&<div className="nickname-snippet funny-moment"><p className="eyebrow">STILL LAUGHING · 搞笑瞬間</p><p>{e.data.funnyMoment}</p></div>}
   <div className="nickname-actions"><Button variant="outline" onClick={()=>setReading(e)}><BookOpen size={16}/>Read story</Button><Button variant="ghost" size="icon" onClick={()=>setEditing(e)} aria-label={'Edit nickname '+e.data.name}><Pencil size={16}/></Button><Button variant="ghost" size="icon" onClick={()=>setRemoving(e)} aria-label={'Remove nickname '+e.data.name}><Trash2 size={16}/></Button></div>
  </article>)}</div>
  {loaded&&!error&&!shown.length&&<div className="v5-empty"><Smile size={34}/><p>{nicknames.length?'還找不到符合的暱稱，換個人物或關鍵字試試。':'從第一個只有你會叫的名字開始。'}</p>{!nicknames.length&&<Button variant="outline" onClick={()=>setEditing('new')}>Keep our first nickname · 收藏第一個暱稱</Button>}</div>}
  {editing&&<NicknameEditor key={editing==='new'?'new':editing.id} entry={editing==='new'?undefined:editing} initialPerson={person==='Chih-hsing'?'Chih-hsing':'Yuliya'} close={()=>setEditing(null)} saved={refresh}/>}
  <Dialog open={!!reading} onOpenChange={v=>{if(!v)setReading(null);}}><DialogContent className="nickname-read-dialog">{reading&&<><DialogTitle>「{reading.data.name}」</DialogTitle><DialogDescription>A name for {reading.data.person}{reading.data.since?' · Since '+reading.data.since:''}</DialogDescription><div className="nickname-story"><h3>How it began · 緣起</h3><p>{reading.data.origin||'還沒寫下緣起。'}</p><h3>A moment we still laugh about · 搞笑瞬間</h3><p>{reading.data.funnyMoment||'還有許多值得收藏的笑聲。'}</p></div><Button variant="outline" onClick={()=>{setEditing(reading);setReading(null);}}><Pencil size={16}/>Add to our story · 編輯故事</Button></>}</DialogContent></Dialog>
  <Confirm open={!!removing} title="Remove this nickname? · 刪除暱稱？" description="This nickname, its origin and funny moments will be removed from the shared collection." busy={busy} onClose={()=>setRemoving(null)} onConfirm={remove}/>
 </section>;
}

function NicknameEditor({entry,initialPerson,close,saved}:{entry?:Nickname;initialPerson:typeof people[number];close:()=>void;saved:()=>void}){
 const [id]=useState(()=>entry?.id||crypto.randomUUID());
 const [data,setData]=useState<Nickname['data']>(entry?.data||{name:'',person:initialPerson,since:'',origin:'',funnyMoment:''});
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false),[discard,setDiscard]=useState(false);
 function change(p:Partial<Nickname['data']>){setData(v=>({...v,...p}));setDirty(true);}
 function leave(){if(busy)return;if(dirty)setDiscard(true);else close();}
 async function save(e:React.FormEvent){e.preventDefault();if(busy)return;const result=nicknameData.safeParse(data);if(!result.success){setError(result.error.issues[0].message);return;}setBusy(true);try{await saveEntry({id,kind:'nickname',data:result.data},entry);saved();toast.success('A little piece of us, saved. · 暱稱已收藏');close();}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <><Dialog open onOpenChange={v=>{if(!v)leave();}}><DialogContent className="nickname-edit-dialog"><DialogTitle>{entry?'A little more to the story · 編輯暱稱':'A name only we know · 新增暱稱'}</DialogTitle><DialogDescription>Keep the name, how it began, and the moment that still makes you smile.</DialogDescription><form className="nickname-form" onSubmit={save}>
  <Field label="Nickname · 暱稱" id="nickname-name"><Input id="nickname-name" value={data.name} maxLength={100} required autoFocus disabled={busy} onChange={e=>change({name:e.target.value})}/></Field>
  <div className="form-pair"><Choice id="nickname-person" label="A name for · 這是誰的暱稱" value={data.person} options={people} disabled={busy} onChange={v=>change({person:v as typeof people[number]})}/><Field label="Since · 開始使用的日期（選填）" id="nickname-since"><Input id="nickname-since" type="date" value={data.since} disabled={busy} onChange={e=>change({since:e.target.value})}/></Field></div>
  <Field label="How it began · 暱稱緣起" id="nickname-origin"><Textarea id="nickname-origin" rows={4} maxLength={4000} value={data.origin} disabled={busy} placeholder="第一次這樣叫對方，是在什麼時候、因為什麼？" onChange={e=>change({origin:e.target.value})}/></Field>
  <Field label="Still laughing · 搞笑瞬間" id="nickname-funny"><Textarea id="nickname-funny" rows={6} maxLength={6000} value={data.funnyMoment} disabled={busy} placeholder="把那句對白、那個表情，或後來的新笑話記下來。" onChange={e=>change({funnyMoment:e.target.value})}/></Field>
  {error&&<p className="field-error" role="alert">{error}</p>}
  <div className="dialog-actions"><Button type="button" variant="outline" disabled={busy} onClick={leave}>Cancel · 取消</Button><Button type="submit" disabled={busy}>{busy?'Saving…':'Keep this nickname · 收藏暱稱'}</Button></div>
 </form></DialogContent></Dialog><Confirm open={discard} title="Leave without saving? · 放棄這次修改？" description="Your unsaved words will be discarded. Any previously saved version stays in the collection." busy={false} confirmLabel="Discard edits" cancelLabel="Keep writing" onClose={()=>setDiscard(false)} onConfirm={close}/></>;
}
