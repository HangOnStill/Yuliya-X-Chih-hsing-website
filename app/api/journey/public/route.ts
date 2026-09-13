import {json,apiError,HttpError} from '@/lib/server';
import {publicQuestions} from '@/lib/letter-questions-server';
export const dynamic='force-dynamic';
export async function GET(req:Request){try{
 const origin=req.headers.get('origin');
 if((origin&&origin!==new URL(req.url).origin)||req.headers.get('sec-fetch-site')==='cross-site')throw new HttpError(403,'Open the quiz on this website.');
 return json({questions:await publicQuestions()});
}catch(e){return apiError(e);}}
