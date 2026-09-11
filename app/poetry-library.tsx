"use client";
import {useState} from 'react';
import {BookHeart,Plus,Pencil,Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {Entry,savedPoemData,letterPoemData} from '@/lib/v5-models';
import {saveEntry,deleteEntry} from '@/lib/v5-client';
import {Choice,Field,Confirm} from './gift-controls';
import {EditButton} from './gift-access';
import {toast} from 'sonner';

type SavedPoem=Extract<Entry,{kind:'poem'}>;
type LetterPoem=Extract<Entry,{kind:'letter-poem'}>;
type ArchiveProps={entries:Entry[];error:string;refresh:()=>unknown};
const blank={title:'',author:'',text:'',yuliyaComment:'',chihComment:''};

export default function PoetryLibrary({entries,error,refresh}:ArchiveProps){
 const [query,setQuery]=useState(''),[editing,setEditing]=useState<SavedPoem|'new'|null>(null),[removing,setRemoving]=useState<SavedPoem|null>(null),[busy,setBusy]=useState(false);
 const poems=entries.filter((e):e is SavedPoem=>e.kind==='poem');
 const shown=poems.filter(e=>[e.data.title,e.data.author,e.data.text,e.data.yuliyaComment,e.data.chihComment].join('\n').toLowerCase().includes(query.trim().toLowerCase()));
 async function remove(){if(!removing)return;setBusy(true);try{await deleteEntry(removing);setRemoving(null);refresh();toast.success('Poem removed from our collection.');}catch(e){toast.error((e as Error).message);}finally{setBusy(false);}}
 return <section><div className="section-top"><div><p className="eyebrow">OUR POETRY · 詩詞庫</p><h2>Words we keep together.</h2><p className="quiet">收藏喜歡的詩詞，也留下我們各自讀到的心情。</p></div><EditButton onClick={()=>setEditing('new')}><Plus size={17}/>收藏詩詞</EditButton></div>
 <Input aria-label="搜尋詩詞、作者與評論" placeholder="搜尋詩詞、作者與評論…" value={query} onChange={e=>setQuery(e.target.value)}/>
 {error&&<p role="alert" className="field-error">{error}<Button variant="ghost" onClick={()=>refresh()}>Retry</Button></p>}
 <div className="nickname-grid poetry-library-grid">{shown.map(e=><article key={e.id} className="v5-card"><h3>{e.data.title}</h3><p className="quiet">{e.data.author||'作者未註明'}</p><p className="saved-poem-text">{e.data.text}</p><div className="form-pair poem-comments"><div><h4>Yuliya 的評論</h4><p>{e.data.yuliyaComment||'等你寫下讀後的心情。'}</p></div><div><h4>Chih-hsing 的評論</h4><p>{e.data.chihComment||'等你寫下讀後的心情。'}</p></div></div><div className="dialog-actions"><EditButton variant="outline" onClick={()=>setEditing(e)}><Pencil size={16}/>編輯詩詞與評論</EditButton><EditButton variant="ghost" size="icon" aria-label={'刪除詩詞 '+e.data.title} onClick={()=>setRemoving(e)}><Trash2 size={16}/></EditButton></div></article>)}</div>
 {!shown.length&&!error&&<div className="v5-empty"><BookHeart/><p>{poems.length?'沒有找到符合的詩詞。':'把第一首喜歡的詩，放進我們的收藏。'}</p></div>}
 {editing&&<PoemEditor entry={editing==='new'?undefined:editing} close={()=>setEditing(null)} saved={refresh}/>}
 <Confirm open={!!removing} busy={busy} title="刪除這首收藏？" description="詩詞與兩人的評論將被刪除；已放進情書的副本會保留。" onClose={()=>setRemoving(null)} onConfirm={remove}/>
 </section>;
}
function PoemEditor({entry,close,saved}:{entry?:SavedPoem;close:()=>void;saved:()=>unknown}){
 const [id]=useState(()=>entry?.id||crypto.randomUUID()),[data,setData]=useState(entry?.data||blank),[busy,setBusy]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false),[discard,setDiscard]=useState(false);
 function change(p:Partial<typeof data>){setData(d=>({...d,...p}));setDirty(true);}
 function leave(){if(busy)return;if(dirty)setDiscard(true);else close();}
 async function save(e:React.FormEvent){e.preventDefault();const parsed=savedPoemData.safeParse(data);if(!parsed.success){setError(parsed.error.issues[0].message);return;}setBusy(true);try{await saveEntry({id,kind:'poem',data:parsed.data},entry);saved();close();toast.success('詩詞與評論已收藏。');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <><Dialog open onOpenChange={v=>{if(!v)leave();}}><DialogContent className="nickname-edit-dialog"><DialogTitle>{entry?'編輯詩詞與評論':'收藏一首詩'}</DialogTitle><DialogDescription>只有我們兩人可以閱讀；評論分別記錄，兩人均可編輯。</DialogDescription><form onSubmit={save} className="nickname-form"><fieldset disabled={busy} className="nickname-form"><PoemFields data={data} change={change} prefix="library"/><div className="form-pair"><Field id="poem-yuliya" label="Yuliya 的評論"><Textarea id="poem-yuliya" value={data.yuliyaComment} maxLength={4000} rows={4} onChange={e=>change({yuliyaComment:e.target.value})}/></Field><Field id="poem-chih" label="Chih-hsing 的評論"><Textarea id="poem-chih" value={data.chihComment} maxLength={4000} rows={4} onChange={e=>change({chihComment:e.target.value})}/></Field></div></fieldset>{error&&<p role="alert" className="field-error">{error}</p>}<div className="dialog-actions"><Button type="button" variant="outline" disabled={busy} onClick={leave}>取消</Button><EditButton type="submit" disabled={busy}>{busy?'儲存中…':'收藏'}</EditButton></div></form></DialogContent></Dialog><Confirm open={discard} busy={false} title="放棄尚未儲存的文字？" description="已收藏的版本不會改變。" onClose={()=>setDiscard(false)} onConfirm={close}/></>;
}
function PoemFields({data,change,prefix}:{data:{title:string;author:string;text:string};change:(v:Partial<{title:string;author:string;text:string}>)=>void;prefix:string}){
 return <><Field id={prefix+'-title'} label="詩題"><Input id={prefix+'-title'} required maxLength={160} value={data.title} onChange={e=>change({title:e.target.value})}/></Field><Field id={prefix+'-author'} label="作者／出處（選填）"><Input id={prefix+'-author'} maxLength={200} value={data.author} onChange={e=>change({author:e.target.value})}/></Field><Field id={prefix+'-text'} label="詩詞正文 · 每行一句"><Textarea id={prefix+'-text'} required maxLength={8000} rows={6} value={data.text} onChange={e=>change({text:e.target.value})}/></Field></>;
}
export function LetterPoemSettings({entries,error,refresh}:ArchiveProps){
 const [slot,setSlot]=useState(0);
 const existing=entries.find((e):e is LetterPoem=>e.kind==='letter-poem'&&e.data.slot===slot);
 return <section className="letter-poem-settings"><h3>情書上的自訂詩詞</h3><p className="quiet">每一頁可以選用收藏或直接寫新詩。儲存的副本只供我們閱讀；不會隨收藏的修改或刪除而改變。</p><Choice label="情書頁次" value={String(slot)} options={Array.from({length:6},(_,i)=>({value:String(i),label:`第 ${i+1} 頁`}))} onChange={v=>setSlot(Number(v))}/>{error?<p role="alert" className="field-error">{error}</p>:<LetterPoemEditor key={`${slot}-${existing?.id||'new'}-${existing?.revision||0}`} slot={slot} existing={existing} poems={entries.filter((e):e is SavedPoem=>e.kind==='poem')} refresh={refresh}/>}</section>;
}
function LetterPoemEditor({slot,existing,poems,refresh}:{slot:number;existing?:LetterPoem;poems:SavedPoem[];refresh:()=>unknown}){
 const [id]=useState(()=>existing?.id||crypto.randomUUID()),[data,setData]=useState(existing?.data||{slot,title:'',author:'',text:''}),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function save(){const parsed=letterPoemData.safeParse(data);if(!parsed.success){setError(parsed.error.issues[0].message);return;}setBusy(true);try{await saveEntry({id,kind:'letter-poem',data:parsed.data},existing);refresh();toast.success('已放進這一頁情書。');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 async function reset(){if(!existing)return;setBusy(true);try{await deleteEntry(existing);refresh();toast.success('已恢復原有詩詞選集。');}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
 return <div className="nickname-form"><Choice label="從收藏填入，或直接在下方輸入" value="custom" disabled={busy} options={[{value:'custom',label:'自行輸入／修改'},...poems.map(p=>({value:p.id,label:p.data.title}))]} onChange={v=>{const p=poems.find(p=>p.id===v);if(p)setData({slot,title:p.data.title,author:p.data.author,text:p.data.text});}}/><fieldset disabled={busy} className="nickname-form"><PoemFields data={data} prefix={'letter-poem-'+slot} change={v=>setData(d=>({...d,...v}))}/></fieldset>{error&&<p role="alert" className="field-error">{error}</p>}<div className="dialog-actions"><EditButton type="button" disabled={busy} onClick={save}>儲存到第 {slot+1} 頁</EditButton>{existing&&<EditButton type="button" disabled={busy} variant="outline" onClick={reset}>恢復選集詩詞</EditButton>}</div><p className="small-meta">新寫的詩也可另到詩詞庫收藏。此處覆蓋這一頁的選集設定。</p></div>;
}
