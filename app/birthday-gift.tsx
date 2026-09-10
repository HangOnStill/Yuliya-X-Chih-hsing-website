"use client";
import {EditButton} from "./gift-access";
import {useCallback,useEffect,useRef,useState, type CSSProperties} from 'react';
import {Heart,Mail,Images,Sparkles,ArrowRight,ArrowLeft,Upload,Check,LockKeyhole,Settings2,RefreshCw,Play,BookOpen,ImagePlus} from 'lucide-react';
import {GiftAccess} from './gift-access';
import {SidebarProvider} from '@/components/ui/sidebar';
import GiftSidebar,{GiftSidebarToggle} from './gift-sidebar';
import Nicknames from './nicknames';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Switch} from '@/components/ui/switch';
import {Progress} from '@/components/ui/progress';
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog';
import {Label} from '@/components/ui/label';
import {Toaster,toast} from 'sonner';
import {Photo} from '@/lib/models';
import {request} from '@/lib/wish-drafts';
import {poemSets,Poem} from '@/lib/poems';
import {Choice} from './gift-controls';
import MemoryArchive from './memory-archive';
import Wishes from './wishes';
import './letter-effects.css';
import './v5.css';
import LifePlan from './life-plan';
import FutureLetters from './future-letters';
import AudioNotes from './audio-notes';
import StoryTimeline from './story-timeline';
import Keepsakes from './keepsakes';

type Question={title:string;text:string;success:string};
type Preferences={poetry:boolean;envelope:boolean;sets:string[];sidebarOpen:boolean};
const defaultPrefs:Preferences={poetry:true,envelope:true,sets:Array(6).fill('original'),sidebarOpen:false};
const themes=['相遇','靠近','告白','初見','家人','一生'];
export default function BirthdayGift({questions,canEdit=false,signInUrl,signedIn=false}:{questions:Question[];canEdit?:boolean;signInUrl:string;signedIn?:boolean}){
 const [tab,setTab]=useState('letter'),[photos,setPhotos]=useState<Photo[]>([]),[photoError,setPhotoError]=useState(''),[photoLoading,setPhotoLoading]=useState(true);
 const [unlocked,setUnlocked]=useState(0),[journeyError,setJourneyError]=useState(''),[opened,setOpened]=useState(false),[index,setIndex]=useState(0),[answer,setAnswer]=useState(''),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState(''),[correct,setCorrect]=useState(false);
 const [prefs,setPrefs]=useState(defaultPrefs),[settings,setSettings]=useState(false),[poemVisible,setPoemVisible]=useState(false),[envelope,setEnvelope]=useState(false),[flap,setFlap]=useState(false),[cinema,setCinema]=useState(false),[videoBusy,setVideoBusy]=useState(false);
 const journeyRef=useRef<HTMLElement>(null);
 const answerRef=useRef<HTMLInputElement>(null),videoUpload=useRef<HTMLInputElement>(null);
 const [recordPoem,setRecordPoem]=useState(0);
 const [ready,setReady]=useState(false),[reducedMotion,setReducedMotion]=useState(false);
 const photo=photos.find(p=>p.kind==='photo'&&p.slot===index),video=photos.find(p=>p.kind==='video');
 const poem=(poemSets.find(s=>s.id===prefs.sets[index])||poemSets[0]).poems[index];
 const refreshPhotos=useCallback(async()=>{try{const r=await request('/api/photos');setPhotos(r.photos);setPhotoError('');}catch(e){setPhotoError((e as Error).message);}finally{setPhotoLoading(false);}},[]);
 const refreshJourney=useCallback(async()=>{try{const r=await request('/api/journey');if(!r.temporary){setUnlocked(r.unlocked);setIndex(i=>Math.min(i,r.unlocked,5));}setJourneyError('');}catch(e){setJourneyError((e as Error).message);}},[]);
 useEffect(()=>{refreshPhotos();refreshJourney();try{const p=JSON.parse(localStorage.getItem('yc-display-preferences')||'null');if(p&&Array.isArray(p.sets)&&p.sets.length===6&&p.sets.every((s:string)=>poemSets.some(x=>x.id===s)))setPrefs({poetry:p.poetry!==false,envelope:p.envelope!==false,sets:p.sets,sidebarOpen:false});}catch{}setReducedMotion(matchMedia('(prefers-reduced-motion: reduce)').matches);setReady(true);const focus=()=>{refreshPhotos();refreshJourney();};window.addEventListener('focus',focus);window.addEventListener('yc-archive-change',focus);return()=>{window.removeEventListener('focus',focus);window.removeEventListener('yc-archive-change',focus);};},[refreshPhotos,refreshJourney]);
 useEffect(()=>{if(ready)try{localStorage.setItem('yc-display-preferences',JSON.stringify(prefs));}catch{}},[prefs,ready]);
 useEffect(()=>{if(!envelope)return;const f=setTimeout(()=>setFlap(true),reducedMotion?0:150);const end=setTimeout(()=>{setEnvelope(false);setOpened(true);setIndex(Math.min(unlocked,5));},reducedMotion?100:2050);return()=>{clearTimeout(f);clearTimeout(end);};},[envelope,reducedMotion,unlocked]);
 useEffect(()=>{setAnswer('');setFeedback('');setCorrect(false);setPoemVisible(false);},[index]);
 useEffect(()=>{if(opened&&tab==='letter'&&!envelope)answerRef.current?.focus({preventScroll:true});},[opened,tab,envelope,index]);
 function navigate(value:string){setTab(value);history.replaceState(null,'','#'+value);setPoemVisible(false);window.scrollTo({top:0,behavior:'instant'});}
 useEffect(()=>{if(opened&&tab==='letter'&&!envelope){const t=setTimeout(()=>journeyRef.current?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'}),80);return()=>clearTimeout(t);}},[opened,envelope,index,reducedMotion]);
 function openLetter(){if(opened){setTimeout(()=>journeyRef.current?.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'start'}),80);return;}if(prefs.envelope&&!reducedMotion){setFlap(false);setEnvelope(true);}else{setOpened(true);setIndex(Math.min(unlocked,5));}}
 async function checkAnswer(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);try{const r=await request('/api/journey',{method:'POST',body:JSON.stringify({index,answer})});setFeedback(r.feedback);setCorrect(r.correct);setUnlocked(r.unlocked);setJourneyError('');if(r.correct&&prefs.poetry)setPoemVisible(true);if(!r.correct)answerRef.current?.select();}catch(e){setFeedback((e as Error).message);setCorrect(false);}finally{setBusy(false);}}
 async function uploadVideo(file?:File){if(!file)return;if(file.type!=='video/mp4'||file.size>24*1024*1024){toast.error('Choose an MP4 up to 24 MB.');return;}setVideoBusy(true);try{await request('/api/photos',{method:'POST',body:file,headers:{'Content-Type':file.type,'X-File-Name':encodeURIComponent(file.name)}});await refreshPhotos();toast.success('Your surprise video is ready.');}catch(e){toast.error((e as Error).message);}finally{setVideoBusy(false);if(videoUpload.current)videoUpload.current.value='';}}
 const solved=index<unlocked;
 return <GiftAccess.Provider value={canEdit}><SidebarProvider open={prefs.sidebarOpen} onOpenChange={sidebarOpen=>setPrefs(p=>({...p,sidebarOpen}))} className="v5-app" style={{"--sidebar-width":"15rem"} as CSSProperties}><GiftSidebar tab={tab} navigate={navigate} settings={()=>setSettings(true)}/><div className="gift-app">
  <a className="skip-link" href="#main">Skip to content</a>
  <Toaster position="bottom-center" richColors/>
  <header className="masthead"><div className="nav-start"><GiftSidebarToggle/><button className="monogram" onClick={()=>navigate('letter')} aria-label="Back to our love letter">Y<span aria-hidden="true">♥</span>C</button></div><span className="masthead-note">Six memories · one love letter</span><Button variant="outline" onClick={()=>{navigate('letter');openLetter();}}>Open letter</Button></header>
  {!canEdit&&<div className="guest-note"><span>Enjoy our letter and memories. Editing is reserved for us.</span>{!signedIn&&<a href={signInUrl} target="_top">Sign in to edit</a>}</div>}
  {tab==='letter'&&<div className="ambient-hearts" aria-hidden="true">{Array.from({length:14},(_,i)=><span key={i} className="ambient-heart" style={{left:`${(i*37+7)%100}%`,"--size":`${8+(i*7)%17}px`,"--duration":`${13+(i*11)%16}s`,"--delay":`${-(i*5)%22}s`} as CSSProperties}>♥</span>)}</div>}
  <main id="main" className="gift-shell">
   <div className="view-stack">
    <section hidden={tab!=='letter'} className="tab-panel letter-tab">
     <section className="v3-hero" aria-label="Birthday love letter"><div className="hero-orbit orbit-one" aria-hidden="true"/><div className="hero-orbit orbit-two" aria-hidden="true"/><div className="v3-hero-card"><p className="eyebrow">A BIRTHDAY LETTER IN SIX MEMORIES</p><h1>Yuliya <span className="heart-glyph" aria-label="loves">♥</span> Chih-hsing</h1><p className="hero-subtitle">Some stories begin with coincidence.<br/>The best ones keep choosing each other.</p><div className="hero-divider" aria-hidden="true"><span>♥</span></div><Button size="lg" className="primary-action" onClick={openLetter}>Open our love letter</Button><p className="hero-whisper">Six photographs. Six questions. One last surprise.</p></div></section>
     {opened&&<section ref={journeyRef} id="journey" className="letter-journey" aria-label="Our six memories">
      <div className="section-top"><div><p className="eyebrow">OUR LOVE LETTER</p><h2>One photograph, one memory, one little lock</h2></div><div className="effect-switch"><Label htmlFor="poetry-switch">Poetry · 墨</Label><Switch id="poetry-switch" checked={prefs.poetry} onCheckedChange={v=>{setPrefs(p=>({...p,poetry:v}));if(!v)setPoemVisible(false);}}/></div></div>
      {journeyError&&<div className="error-banner" role="alert">{journeyError}<Button variant="outline" onClick={refreshJourney}>Retry</Button></div>}
      <div className="chapter-nav" aria-label="Memory chapters">{questions.map((q,i)=><button key={q.title} disabled={i>unlocked||busy} onClick={()=>setIndex(i)} aria-current={i===index?'step':undefined} aria-label={`${q.title}${i>unlocked?' · locked':''}`} className={i===index?'current':i<unlocked?'done':''}><span>{i<unlocked?<Check size={16}/>:String(i+1).padStart(2,'0')}</span><small lang="zh-Hant">{themes[i]}</small></button>)}</div><Progress className="journey-progress" value={unlocked/6*100} aria-label={`${unlocked} of 6 memories unlocked`}/>
      <article className="journey-spread" key={index}><div className="journey-photo-side"><div className="journey-photo">{photo?<img src={'/api/media/'+photo.id} alt={photo.title} decoding="async"/>:<div className="unfilled-memory"><span className="large-number">0{index+1}</span><ImagePlus size={25}/><p>A place for this memory</p><Button variant="outline" onClick={()=>navigate('memories')}>Choose a photograph</Button></div>}<span className="photo-counter">0{index+1} / 06</span>{poemVisible&&<div className="poetry-overlay" role="region" aria-label="Unlocked poem"><Poetry poem={poem}/><Button variant="outline" className="poetry-dismiss" onClick={()=>setPoemVisible(false)}>收卷 · Return to photo</Button></div>}</div><p className="photo-caption">{photo?.note||photo?.title||questions[index].title.replace(/^\d\. /,'')}</p></div>
       <div className="question-side"><p className="eyebrow">MEMORY 0{index+1} <span lang="zh-Hant">／{themes[index]}</span></p><h3>{questions[index].title.replace(/^\d\. /,'')}</h3><p className="question-text">{questions[index].text}</p>{!solved?<form onSubmit={checkAnswer}><Label htmlFor="answer">Your answer</Label><div className="answer-row"><Input ref={answerRef} id="answer" value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback('');}} placeholder={index===1?'YYYY/MM/DD':'Type it here…'} autoComplete="off" maxLength={500} disabled={busy}/><Button type="submit" disabled={busy}>{busy?'Checking…':'Unlock'}<LockKeyhole size={15}/></Button></div></form>:<div className="unlocked-label"><Check size={19}/> This memory is yours.</div>}
       <div className={'answer-feedback '+(correct||solved?'success':'')} aria-live="polite">{feedback||(solved?questions[index].success:'')}</div>
       {solved&&<div className="question-next"><Button size="lg" onClick={()=>{setPoemVisible(false);if(index===5)setCinema(true);else setIndex(index+1);}}>{index===5?'Open the final surprise':'Turn the page'}<ArrowRight/></Button><Button variant="ghost" onClick={()=>setPoemVisible(v=>!v)}><BookOpen size={16}/>Read the poem</Button></div>}
       </div></article><p className="under-letter">Six answers. Countless memories still to come.</p>
     </section>}
     {photoError&&!opened&&<p className="small-meta">Your letter is ready. Open Memories to connect the photographs.</p>}
    </section>
    <section hidden={tab!=='memories'} className="tab-panel"><MemoryArchive photos={photos.filter(p=>p.kind==='photo')} loading={photoLoading} error={photoError} refresh={refreshPhotos}/></section>
    <section hidden={tab!=='wishes'} className="tab-panel"><Wishes active={tab==='wishes'} photos={photos} onMemorySaved={()=>{refreshPhotos();navigate('memories');}}/></section>
    <section hidden={tab!=='nicknames'} className="tab-panel"><Nicknames active={tab==='nicknames'}/></section>
    <section hidden={tab!=='plan'} className="tab-panel"><LifePlan active={tab==='plan'}/></section>
    <section hidden={tab!=='capsules'} className="tab-panel"><FutureLetters active={tab==='capsules'}/></section>
    <section hidden={tab!=='timeline'} className="tab-panel"><StoryTimeline active={tab==='timeline'} photos={photos} refreshPhotos={refreshPhotos}/></section>
    <section hidden={tab!=='keepsakes'} className="tab-panel"><Keepsakes active={tab==='keepsakes'} photos={photos}/></section>
   </div>
  </main>
  <footer className="gift-footer"><span>Yuliya <Heart size={12}/> Chih-hsing</span><span>To be continued, together.</span></footer>
  <Dialog open={envelope} onOpenChange={v=>{if(!v){setEnvelope(false);setOpened(true);}}}><DialogContent className="envelope-dialog"><DialogTitle className="sr-only">Opening our love letter</DialogTitle><DialogDescription className="sr-only">A letter opens to reveal your first memory.</DialogDescription><div className="envelope-scene" aria-hidden="true"><div className={'envelope '+(flap?'open':'')}><div className="letter-sheet"><div className="letter-monogram">Y ♥ C</div><p>Six memories,<br/>kept just for us.</p></div><div className="envelope-back"/><div className="envelope-front front-left"/><div className="envelope-front front-right"/><div className="envelope-front front-bottom"/><div className="envelope-flap"/><div className="wax-seal">♥</div></div></div><Button variant="ghost" onClick={()=>{setEnvelope(false);setOpened(true);}}>Open now</Button></DialogContent></Dialog>
  <Dialog open={settings} onOpenChange={setSettings}><DialogContent className="settings-dialog"><DialogTitle>Make the letter your own</DialogTitle><DialogDescription>Choose a whole poetry set, or mix one verse for each memory. These display choices are remembered on this device.</DialogDescription><div className="settings-switches"><div className="effect-switch"><Label htmlFor="envelope-setting">Envelope opening</Label><Switch id="envelope-setting" checked={prefs.envelope} onCheckedChange={v=>setPrefs(p=>({...p,envelope:v}))}/></div><div className="effect-switch"><Label htmlFor="poem-setting">Poetry animation</Label><Switch id="poem-setting" checked={prefs.poetry} onCheckedChange={v=>setPrefs(p=>({...p,poetry:v}))}/></div></div><Choice label="Apply a full set" value={prefs.sets.every(s=>s===prefs.sets[0])?prefs.sets[0]:'mixed'} options={[{value:'mixed',label:'Mix & match · 自選'},...poemSets.map(s=>({value:s.id,label:s.label}))]} onChange={v=>{if(v!=='mixed')setPrefs(p=>({...p,sets:Array(6).fill(v)}));}}/>
   <div className="poem-picker">{questions.map((q,i)=>{const current=poemSets.find(s=>s.id===prefs.sets[i])||poemSets[0];return <div className="poem-choice" key={i}><Choice label={`0${i+1} · ${themes[i]}`} value={prefs.sets[i]} options={poemSets.map(s=>({value:s.id,label:s.label}))} onChange={v=>setPrefs(p=>({...p,sets:p.sets.map((s,n)=>n===i?v:s)}))}/><p lang="zh-Hant">{current.poems[i].lines.join('，')}。</p><small>{current.poems[i].source}</small></div>;})}</div>
   <details className="poem-recordings"><summary>Read a poem aloud · 詩詞朗讀</summary><Choice label="Poem to record" value={String(recordPoem)} options={themes.map((label,i)=>({value:String(i),label:`0${i+1} · ${label}`}))} onChange={v=>setRecordPoem(Number(v))}/><AudioNotes key={'poem-'+recordPoem} parentType="poem" parentId={String(recordPoem)}/></details>
   <div className="video-setting"><h3>Final surprise</h3><p className="quiet">{video?'A video is ready. Uploading another makes it the final surprise.':'Add the video that plays after the sixth answer.'}</p><input ref={videoUpload} type="file" accept="video/mp4" className="sr-only" onChange={e=>uploadVideo(e.target.files?.[0])}/><EditButton variant="outline" disabled={videoBusy} onClick={()=>videoUpload.current?.click()}><Upload size={16}/>{videoBusy?'Uploading…':video?'Replace surprise video':'Add surprise video'}</EditButton><small>MP4 · up to 24 MB</small></div>
  </DialogContent></Dialog>
  <Dialog open={cinema} onOpenChange={setCinema}><DialogContent className="cinema-dialog"><div className="cinema-curtain curtain-left" aria-hidden="true"/><div className="cinema-curtain curtain-right" aria-hidden="true"/><DialogTitle>For all our tomorrows.</DialogTitle><DialogDescription>You are the best thing that has happened in my life.</DialogDescription>{video?<video controls playsInline preload="metadata" src={'/api/media/'+video.id} onError={()=>toast.error('This video could not play. Try an MP4 encoded with H.264.')}/>:<div className="cinema-empty"><Heart size={48}/><p>Your final video has not been added yet.</p><EditButton onClick={()=>{setCinema(false);setSettings(true);}}>Add the surprise video</EditButton></div>}<Button variant="outline" onClick={()=>{setCinema(false);navigate('wishes');}}>What shall we dream of next?<Sparkles size={17}/></Button></DialogContent></Dialog>
 </div></SidebarProvider></GiftAccess.Provider>;
}
function Poetry({poem}:{poem:Poem}){return <div className="poetry-content" lang="zh-Hant"><div className="poetry-lines">{poem.lines.map((line,n)=><p key={line} className="poetry-line">{[...line].map((c,i)=><span key={i} style={{'--delay':`${n*.25+i*.075}s`} as CSSProperties}>{c}</span>)}</p>)}</div><p className="poetry-source">{poem.source}</p></div>;}
