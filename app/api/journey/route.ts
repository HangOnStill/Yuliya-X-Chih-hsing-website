import {z} from 'zod';
import {canEdit} from '@/lib/access';
import {api,db,json,body,identity,HttpError,sameOrigin,apiError} from '@/lib/server';
import {originalQuestions} from '@/lib/letter-data';
import {normalized} from '@/lib/models';
async function progress(user:string){return (await db().prepare('SELECT unlocked FROM journey WHERE user_id=?').bind(user).first<{unlocked:number}>())?.unlocked||0;}
export const GET=api(async req=>json({unlocked:await progress(identity(req)),temporary:false}));
// Only this POST is public: static quiz feedback, never archive enumeration.
// Nonmembers never query or mutate the journey table.
export async function POST(req:Request){try{if(req.method!=='POST')throw new HttpError(405,'Method not allowed.');sameOrigin(req);const v=z.object({index:z.number().int().min(0).max(5),answer:z.string().max(500)}).parse(await body(req));const persistent=canEdit(req),user=persistent?identity(req):null,unlocked=user?await progress(user):v.index;if(v.index>unlocked)throw new HttpError(400,'Open the earlier memory first.');const q=originalQuestions[v.index];let answer=normalized(v.answer);if(v.index===1)answer=answer.replace(/[.\-]/g,'/').replace(/\/(\d)(?=\/|$)/g,'/0$1');const correct=answer===normalized(q.answer);if(correct&&user)await db().prepare('INSERT INTO journey(user_id,unlocked) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET unlocked=MAX(journey.unlocked,excluded.unlocked)').bind(user,v.index+1).run();return json({correct,feedback:correct?q.success:answer?q.wrong:q.empty,unlocked:correct?Math.max(unlocked,v.index+1):unlocked,temporary:!persistent});}catch(e){return apiError(e);}}
