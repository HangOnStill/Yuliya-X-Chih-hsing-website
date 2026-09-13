"use client";
import {useCallback,useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {letterQuestionData,type LetterQuestionData,type Entry} from '@/lib/v5-models';
import {saveEntry,deleteEntry} from '@/lib/v5-client';
import {request} from '@/lib/wish-drafts';
import {Field,Confirm} from './gift-controls';

type QuestionEntry=Extract<Entry,{kind:'letter-question'}>;
type Resolved={data:LetterQuestionData;entry?:QuestionEntry};
const fields=[['question','Question',2000],['answer','Correct answer',500],['successFeedback','Correct feedback',3000],['wrongFeedback','Wrong feedback',3000],['emptyFeedback','Blank feedback',3000]] as const;
export function LetterQuestionSettings(){
 const [rows,setRows]=useState<Resolved[]>([]),[error,setError]=useState('');
 const refresh=useCallback(async()=>{try{const r=await request('/api/journey/settings');setRows(r.questions);setError('');}catch(e){setError((e as Error).message);}},[]);
 useEffect(()=>{void refresh();const update=()=>void refresh();window.addEventListener('focus',update);window.addEventListener('yc-archive-change',update);return()=>{window.removeEventListener('focus',update);window.removeEventListener('yc-archive-change',update);};},[refresh]);
 return <section className="letter-question-settings"><h3>Quiz questions</h3><p>儲存或重設後，兩人的進度會從這一題重新開始；較早已完成的題目保留。</p><p>Questions and feedback appear in the public Love Letter quiz. The configured answer is used server-side and is not included in the public quiz configuration.</p>{error&&<p role="alert">{error} <Button variant="outline" onClick={refresh}>Retry</Button></p>}{!rows.length&&!error&&<p role="status">Loading quiz settings…</p>}{rows.map(row=><QuestionEditor key={row.data.page} row={row} refresh={refresh}/>)}</section>;
}
function QuestionEditor({row,refresh}:{row:Resolved;refresh:()=>Promise<void>}){
 const [base,setBase]=useState(row),[data,setData]=useState(row.data),[id,setId]=useState(()=>row.entry?.id||crypto.randomUUID());
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[confirm,setConfirm]=useState(false);
 const changedElsewhere=row.entry?.id!==base.entry?.id||row.entry?.revision!==base.entry?.revision;
 const dirty=JSON.stringify(data)!==JSON.stringify(base.data);
 function loadLatest(){setBase(row);setData(row.data);setId(row.entry?.id||crypto.randomUUID());setError('');}
 async function save(){const parsed=letterQuestionData.safeParse(data);if(!parsed.success){setError(parsed.error.issues[0].message);return;}setBusy(true);try{const entry=await saveEntry({id,kind:'letter-question',data:parsed.data},base.entry) as QuestionEntry;setBase({data:entry.data,entry});setData(entry.data);setError('');await refresh();}catch(e){setError((e as Error).message);await refresh();}finally{setBusy(false);}}
 async function reset(){if(!base.entry)return;setBusy(true);try{await deleteEntry(base.entry);const r=await request('/api/journey/settings');const latest=r.questions.find((q:Resolved)=>q.data.page===data.page) as Resolved;setBase(latest);setData(latest.data);setId(latest.entry?.id||crypto.randomUUID());setConfirm(false);setError('');await refresh();}catch(e){setError((e as Error).message);await refresh();}finally{setBusy(false);}}
 return <details className="letter-title-card quiz-question-card"><summary>MEMORY {String(data.page+1).padStart(2,'0')} · {dirty?'Unsaved changes':base.entry?'Custom question':'Built-in default'}</summary><fieldset disabled={busy}>{fields.map(([key,label,max])=><Field key={key} id={`quiz-${data.page}-${key}`} label={label}><Textarea id={`quiz-${data.page}-${key}`} rows={key==='answer'?2:3} autoComplete="off" spellCheck={key!=='answer'} value={data[key]} maxLength={max} required={key==='question'||key==='answer'} onChange={e=>setData({...data,[key]:e.target.value})}/></Field>)}</fieldset>{error&&<p role="alert">{error}</p>}{changedElsewhere&&<p role="status">The saved question changed elsewhere. Your draft is kept.</p>}{(changedElsewhere||dirty||error)&&<Button variant="outline" disabled={busy} onClick={loadLatest}>Load latest (discard draft)</Button>}<div className="dialog-actions"><Button disabled={busy||changedElsewhere} onClick={save}>{busy?'Saving…':'Save'}</Button><Button variant="outline" disabled={busy||!base.entry} onClick={()=>setConfirm(true)}>Reset to default</Button></div><Confirm open={confirm} busy={busy} title="Reset this quiz question?" description="Remove this override and discard its draft. The exact built-in question, answer, and feedback will return. This question and the later questions will need answering again. Earlier completed questions are kept." onClose={()=>setConfirm(false)} onConfirm={reset}/></details>;
}
