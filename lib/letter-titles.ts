import type {Entry} from './v5-models';
export const defaultLetterTitles=Object.freeze([
 {chineseSubtitle:'相遇',mainTitle:'Cyber Encounter'},
 {chineseSubtitle:'靠近',mainTitle:'A Courageous Rendez-vous'},
 {chineseSubtitle:'告白',mainTitle:'A Sudden Surprise'},
 {chineseSubtitle:'初見',mainTitle:'From Spirit to Flesh'},
 {chineseSubtitle:'家人',mainTitle:'A Family Oracle'},
 {chineseSubtitle:'一生',mainTitle:'Our Life to Come'},
].map(t=>Object.freeze(t)));
export function resolveLetterTitles(entries:Entry[]=[],canAccessArchive=false){
 return defaultLetterTitles.map((fallback,page)=>{
  const override=canAccessArchive?entries.find(e=>e.kind==='letter-title'&&e.data.page===page):undefined;
  const value=override?.kind==='letter-title'?override.data:fallback;
  return {page,chapter:`MEMORY ${String(page+1).padStart(2,'0')}`,chineseSubtitle:value.chineseSubtitle,mainTitle:value.mainTitle,overridden:!!override};
 });
}
export type LetterTitles=ReturnType<typeof resolveLetterTitles>;
