import BirthdayGift from "./birthday-gift";
import {publicQuestions} from "@/lib/letter-questions-server";
import {getChatGPTUser,chatGPTSignInPath} from './chatgpt-auth';
import {isArchiveMember} from '@/lib/access';
export const dynamic='force-dynamic';
export default async function Home(){const user=await getChatGPTUser();return <BirthdayGift canAccessArchive={isArchiveMember(user?.userId||null,user?.email||null)} signInUrl={chatGPTSignInPath('/')} signedIn={!!user} questions={await publicQuestions()}/>;}
