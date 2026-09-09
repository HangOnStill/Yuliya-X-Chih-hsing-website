import {z} from 'zod';
import {api,db,json,body,identity,HttpError} from '@/lib/server';
import {originalQuestions} from '@/lib/letter-data';
import {normalized} from '@/lib/models';
async function progress(user:string){return (await db().prepare('SELECT unlocked FROM journey WHERE user_id=?').bind(user).first<{unlocked:number}>())?.unlocked||0;}
export const GET=api(async req=>json({unlocked:await progress(identity(req))}));
export const POST=api(async req=>{const v=z.object({index:z.number().int().min(0).max(5),answer:z.string().max(500)}).parse(await body(req));const user=identity(req),unlocked=await progress(user);if(v.index>unlocked)throw new HttpError(400,'Open the earlier memory first.');const q=originalQuestions[v.index];let answer=normalized(v.answer);if(v.index===1)answer=answer.replace(/[.\-]/g,'/').replace(/\/(\d)(?=\/|$)/g,'/0$1');const correct=answer===normalized(q.answer);if(correct)await db().prepare('INSERT INTO journey(user_id,unlocked) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET unlocked=MAX(journey.unlocked,excluded.unlocked)').bind(user,v.index+1).run();return json({correct,feedback:correct?q.success:answer?q.wrong:q.empty,unlocked:correct?Math.max(unlocked,v.index+1):unlocked});});
