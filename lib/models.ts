import { z } from "zod";
export const categories = ["Travel", "Food", "Experiences", "Things", "Learning", "Everyday", "Other"] as const;
export const statuses = ["Dreaming", "Planning", "Done"] as const;
export const priorities = ["Someday", "Soon", "Top wish"] as const;
export const dateValue = z.string().refine(v => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v), "Use a valid date.");
export const safeUrl = z.string().max(2048).refine(v => {if(!v)return true;try {const u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}}, "Use an http or https link.");
export const wishInput = z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(160),notes:z.string().max(3000).default(''),category:z.enum(categories).default('Other'),status:z.enum(statuses).default('Dreaming'),priority:z.enum(priorities).default('Someday'),url:safeUrl.default(''),budget:z.number().finite().nonnegative().max(100000000).nullable().default(null),currency:z.enum(['CAD','USD','CNY','EUR','GBP','']).default(''),dueDate:dateValue.default('')});
export type WishInput = z.infer<typeof wishInput>;
export type Wish = WishInput & {createdAt:string; updatedAt:string; revision:number};
export type Photo = {id:string;kind:'photo'|'video';filename:string;mime:string;size:number;title:string;note:string;tags:string;takenAt:string;favorite:number;slot:number|null;createdAt:string;revision:number};
export const photoEdit = z.object({title:z.string().trim().min(1).max(160),note:z.string().max(3000),tags:z.string().max(300),takenAt:dateValue,favorite:z.number().int().min(0).max(1),slot:z.number().int().min(0).max(5).nullable(),revision:z.number().int().nonnegative()});
export function normalized(value:string){return value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase();}
export function duplicateKey(wish:{title:string;url:string}){return wish.url?wish.url.replace(/\/$/,''):normalized(wish.title);}
