import {z} from 'zod';
import {dateValue} from './models';
export const people=['Yuliya','Chih-hsing'] as const;
const person=z.enum(people),title=z.string().trim().min(1).max(160),note=z.string().max(12000),id=z.string().uuid();
const date=dateValue.refine(v=>!!v,'Choose a date.');
export const currencies=['CAD','USD','CNY','EUR','GBP'] as const;
const place={place:z.string().max(200).default(''),lat:z.number().finite().min(-90).max(90).nullable().default(null),lng:z.number().finite().min(-180).max(180).nullable().default(null)};
export const memoryData=z.object({title,date,notes:note.default(''),photoIds:z.array(id).max(30).default([]),wishId:id.nullable().default(null),...place}).refine(d=>(d.lat===null)===(d.lng===null),'Add both map coordinates.');
export const milestone=z.object({id,title,date,notes:z.string().max(3000).default(''),done:z.boolean().default(false),cost:z.number().finite().nonnegative().max(100000000).nullable().default(null),wishId:id.nullable().default(null)});
export const planData=z.object({title,startDate:date,targetDate:date,fromCity:z.string().max(160),toCity:z.string().max(160),availableFrom:dateValue,availableTo:dateValue,currency:z.enum(currencies),budget:z.number().finite().nonnegative().max(100000000),saved:z.number().finite().nonnegative().max(100000000),monthlySaving:z.number().finite().nonnegative().max(100000000),notes:note,milestones:z.array(milestone).max(150)}).refine(d=>d.targetDate>=d.startDate,'The reunion date must follow the starting date.').refine(d=>!d.availableFrom||!d.availableTo||d.availableTo>=d.availableFrom,'Check the available travel window.');
export const capsuleData=z.object({title,body:note,person,occasion:z.enum(['Birthday','Anniversary','Just because']),unlockAt:z.string().datetime(),stage:z.enum(['draft','sealed'])});
export const nicknameData=z.object({name:z.string().trim().min(1,'Give this nickname a name.').max(100),person,since:dateValue.default(''),origin:z.string().max(4000).default(''),funnyMoment:z.string().max(6000).default('')});
export const entryInput=z.discriminatedUnion('kind',[
 z.object({id,kind:z.literal('memory'),data:memoryData}),
 z.object({id,kind:z.literal('perspective'),data:z.object({photoId:id,person,text:z.string().max(2000)})}),
 z.object({id,kind:z.literal('interest'),data:z.object({wishId:id,person,selected:z.boolean()})}),
 z.object({id,kind:z.literal('plan'),data:planData}),
 z.object({id,kind:z.literal('capsule'),data:capsuleData}),
 z.object({id,kind:z.literal('nickname'),data:nicknameData})
]);
export type EntryInput=z.infer<typeof entryInput>;
export type Entry=EntryInput&{createdAt:string;updatedAt:string;revision:number;locked?:boolean};
export type MemoryEntry=Extract<Entry,{kind:'memory'}>;
export type PlanData=z.infer<typeof planData>;
export type Asset={id:string;parentType:'photo'|'capsule'|'poem';parentId:string;purpose:'voice'|'attachment'|'original';person:string;filename:string;mime:string;size:number;createdAt:string};
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
