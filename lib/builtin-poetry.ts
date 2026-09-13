import {poemSets} from './poems';
// Preserve the supplied excerpts exactly; repeated selections appear once.
export const builtinPoetry=[...new Map(poemSets.flatMap(set=>set.poems).map(poem=>[poem.source+'\n'+poem.lines.join('\n'),poem])).values()].map((poem,index)=>({id:'builtin-poem-'+index,title:poem.source,author:poem.source,text:poem.lines.join('\n'),yuliyaComment:'',chihComment:''}));
