import {z} from 'zod';
import {canEdit} from '@/lib/access';
import {api,db,json,body,identity,HttpError,sameOrigin,apiError} from '@/lib/server';
import {resolvedQuestions,matchesAnswer} from '@/lib/letter-questions-server';
import {normalized} from '@/lib/models';
async function progress(user:string){return (await db().prepare('SELECT unlocked FROM journey WHERE user_id=?').bind(user).first<{unlocked:number}>())?.unlocked||0;}
export const GET=api(async req=>json({unlocked:await progress(identity(req)),temporary:false}));
// Public validation returns only the attempt's feedback, never configuration.
// Nonmembers never query or mutate the journey table.
export async function POST(req:Request){try{
 if(req.method!=='POST')throw new HttpError(405,'Method not allowed.');sameOrigin(req);
 const v=z.object({index:z.number().int().min(0).max(5),answer:z.string().max(500)}).parse(await body(req));
 const persistent=canEdit(req),user=persistent?identity(req):null,unlocked=user?await progress(user):v.index;
 if(v.index>unlocked)throw new HttpError(400,'Open the earlier memory first.');
 const resolved=(await resolvedQuestions())[v.index],q=resolved.data,answer=normalized(v.answer),correct=!!answer&&matchesAnswer(v.answer,q.answer);
 if(correct&&user){
  // A concurrently edited question or reset must not be re-unlocked by an old attempt.
  const guard=resolved.entry?'EXISTS(SELECT 1 FROM entries WHERE id=? AND revision=?)':"NOT EXISTS(SELECT 1 FROM entries WHERE dedupe_key=?)";
  const versionArgs=resolved.entry?[resolved.entry.id,resolved.entry.revision]:[`letter-question:${v.index}`];
  const r=await db().prepare(`INSERT INTO journey(user_id,unlocked) SELECT ?,? WHERE ${guard} AND COALESCE((SELECT unlocked FROM journey WHERE user_id=?),0)>=? ON CONFLICT(user_id) DO UPDATE SET unlocked=MAX(journey.unlocked,excluded.unlocked)`).bind(user,v.index+1,...versionArgs,user,v.index).run();
  if(!r.meta.changes)throw new HttpError(409,'The quiz changed while checking. Refresh and answer the updated question.');
 }
 return json({correct,feedback:correct?q.successFeedback:answer?q.wrongFeedback:q.emptyFeedback,unlocked:user?await progress(user):correct?v.index+1:unlocked,temporary:!persistent});
}catch(e){return apiError(e);}}
