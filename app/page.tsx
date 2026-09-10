import BirthdayGift from "./birthday-gift";
import {originalQuestions} from "@/lib/letter-data";
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
import {editorIdentity} from '@/lib/access';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <BirthdayGift canEdit={editorIdentity(user?.userId||null,user?.email||null)} signInUrl={chatGPTSignInPath('/')} signedIn={!!user} questions={originalQuestions.map(({title,text,success})=>({title,text,success}))}/>;}
