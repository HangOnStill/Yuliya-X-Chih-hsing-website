import {api,json} from '@/lib/server';
import {resolvedQuestions} from '@/lib/letter-questions-server';
export const dynamic='force-dynamic';
export const GET=api(async()=>json({questions:await resolvedQuestions()}));
