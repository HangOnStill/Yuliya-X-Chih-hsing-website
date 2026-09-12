import {LetterTitles} from '@/lib/letter-titles';
export function LetterChapterHeading({title}:{title:LetterTitles[number]}){
 return <><p className="eyebrow">{title.chapter} {title.chineseSubtitle&&<span lang="zh-Hant">／{title.chineseSubtitle}</span>}</p><h3>{title.mainTitle}</h3></>;
}
