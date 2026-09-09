import BirthdayGift from "./birthday-gift";
import {originalQuestions} from "@/lib/letter-data";
export default function Home(){return <BirthdayGift questions={originalQuestions.map(({title,text,success})=>({title,text,success}))}/>;}
