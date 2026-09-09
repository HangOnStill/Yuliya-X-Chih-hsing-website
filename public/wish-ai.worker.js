// Pinned browser-side multilingual semantic model. Draft text stays on the device.
let extractor,categoryVectors;
const labels=['Travel','Food','Experiences','Things','Learning','Everyday','Other'];
const descriptions=[
 'A wish to travel together, visit a city, go on holiday, see mountains, a beach or the northern lights. 一起旅行、度假、去城市、看極光、海邊、爬山。',
 'A wish to try a restaurant, eat delicious food, bake, cook a meal or drink coffee together. 想吃美食、餐廳、做飯、烘焙、喝咖啡。',
 'A wish to go to a concert, movie, exhibition, show or have a special date or creative experience. 演唱會、看電影、展覽、約會、陶藝、一起體驗。',
 'A wish to buy or receive an object such as a camera, book, clothing, jewelry, game, furniture or gift. 想買相機、書籍、衣服、首飾、遊戲、家具、禮物。',
 'A wish to learn a skill, study a language, take a course, practice dancing or music. 學習技能、語言、課程、跳舞、音樂。',
 'A wish for daily life together, a cozy home, walking, reading, keeping plants or a quiet shared routine. 一起生活、散步、閱讀、養花、平凡日常、陪伴。',
 'A personal wish, dream or goal that is not a trip, purchase, meal, learning activity or shared daily routine. 其他心願、夢想、目標。'
];
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
async function embeddings(texts){const out=[];for(let i=0;i<texts.length;i+=6){const t=await extractor(texts.slice(i,i+6),{pooling:'mean',normalize:true});out.push(...t.tolist());}return out;}
self.onmessage=async({data})=>{
 try{
  if(!extractor){self.postMessage({type:'status',message:'Downloading the language model for the first use…'});
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
   env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
   extractor=await pipeline('feature-extraction','Xenova/paraphrase-multilingual-MiniLM-L12-v2',{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress'&&p.progress)self.postMessage({type:'status',message:`Downloading ${p.file?.endsWith('.onnx')?'language model':'language files'} · ${Math.round(p.progress)}%`});}});
  }
  self.postMessage({type:'status',message:'Reading the meaning of your wishes…'});
  if(!categoryVectors)categoryVectors=await embeddings(descriptions);
  const items=data.items.slice(0,30),existing=data.existing.slice(0,150);
  const vectors=await embeddings([...items.map(x=>x.title),...existing.map(x=>x.title)]);
  const result=items.map((item,i)=>{const scored=categoryVectors.map((v,j)=>({label:labels[j],score:dot(vectors[i],v)})).sort((a,b)=>b.score-a.score);let similar=null,best=.84;
   for(let j=0;j<vectors.length;j++){if(j===i||(j<items.length&&j>i))continue;const score=dot(vectors[i],vectors[j]);if(score>best){best=score;similar=j<items.length?items[j].title:existing[j-items.length].title;}}
   return {id:item.id,category:scored[0].score<.22?'Other':scored[0].label,similar};});
  self.postMessage({type:'result',result});
 }catch(error){self.postMessage({type:'error',message:'AI could not load on this device or network. Your wishes are ready for manual review. You can retry AI later.'});}
};
