export const originalPoems = [
    { lines: ['金風玉露一相逢', '便勝卻人間無數'], source: '秦觀《鵲橋仙》' },
    { lines: ['山有木兮木有枝', '心悅君兮君不知'], source: '《越人歌》' },
    { lines: ['願得一心人', '白頭不相離'], source: '《白頭吟》' },
    { lines: ['身無彩鳳雙飛翼', '心有靈犀一點通'], source: '李商隱《無題》' },
    { lines: ['結髮為夫妻', '恩愛兩不疑'], source: '《留別妻》' },
    { lines: ['在天願作比翼鳥', '在地願為連理枝'], source: '白居易《長恨歌》' }
  ];

export type Poem={lines:string[];source:string;url?:string};
const wiki=(name:string)=>'https://zh.wikisource.org/wiki/'+name;
export const poemSets:{id:string;label:string;description:string;poems:Poem[]}[]=[
 {id:'original',label:'Original · 原版',description:'The six verses from the original birthday letter.',poems:originalPoems},
 {id:'classic',label:'A · 古雅相守',description:'Six short passages from the Book of Songs; quiet, direct, and warm.',poems:[
  {lines:['邂逅相遇','適我願兮'],source:'《詩經・野有蔓草》',url:wiki('詩經/野有蔓草')},
  {lines:['子惠思我','褰裳涉溱'],source:'《詩經・褰裳》',url:wiki('詩經/褰裳')},
  {lines:['今夕何夕','見此良人'],source:'《詩經・綢繆》',url:wiki('詩經/綢繆')},
  {lines:['既見君子','云胡不喜'],source:'《詩經・風雨》',url:wiki('詩經/風雨')},
  {lines:['之子于歸','宜其室家'],source:'《詩經・桃夭》',url:wiki('詩經/桃夭')},
  {lines:['宜言飲酒','與子偕老'],source:'《詩經・女曰雞鳴》',url:wiki('詩經/女曰雞鳴')}]},
 {id:'ardent',label:'B · 綿長熱烈',description:'A chance meeting becomes an unmistakable promise.',poems:[
  {...originalPoems[0],url:wiki('鵲橋仙_(秦觀)')},
  {...originalPoems[1],url:wiki('越人歌')},
  {lines:['我欲與君相知','長命無絕衰'],source:'漢樂府《上邪》',url:wiki('上邪')},
  {...originalPoems[3],url:wiki('無題_(昨夜星辰昨夜風)')},
  {lines:['我有嘉賓','鼓瑟吹笙'],source:'《詩經・鹿鳴》',url:wiki('詩經/鹿鳴')},
  {lines:['三願如同梁上燕','歲歲長相見'],source:'馮延巳《長命女》',url:'https://poems.mahacinasthana.com/gushi/chang-ming-nv-chun-ri-yan/'}]},
 {id:'tender',label:'C · 靈動親密',description:'A shared moon, a shy glance, a keepsake, and two hearts answering each other.',poems:[
  {lines:['海上生明月','天涯共此時'],source:'張九齡《望月懷遠》',url:wiki('望月懷遠')},
  {lines:['和羞走','倚門回首','卻把青梅嗅'],source:'李清照《點絳唇》',url:'https://fanti.dugushici.com/ancient_proses/70480'},
  originalPoems[2],
  {lines:['今宵剩把銀釭照','猶恐相逢是夢中'],source:'晏幾道《鷓鴣天》',url:'https://fanti.dugushici.com/ancient_proses/48724'},
  {lines:['投我以木桃','報之以瓊瑤'],source:'《詩經・木瓜》',url:wiki('詩經/木瓜')},
  {lines:['只願君心似我心','定不負相思意'],source:'李之儀《卜算子》',url:'https://m.gushiwen.cn/mingju/juv_c3ecb42ab3d7.aspx'}]}
];
