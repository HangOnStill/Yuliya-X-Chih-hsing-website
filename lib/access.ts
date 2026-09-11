import {env} from 'cloudflare:workers';
import {z} from 'zod';

const emailSchema=z.string().email();
function normalizedEmail(value:string|null){
 const email=value?.trim().toLowerCase();
 return email&&emailSchema.safeParse(email).success?email:null;
}
// Trust only Sites dispatcher headers. The dispatcher must strip/replace
// client-supplied headers and prevent direct Internet access to this Worker.
export function trustedIdentity(headers:Pick<Headers,'get'>){
 const userId=headers.get('oai-authenticated-user-id');
 const email=normalizedEmail(headers.get('oai-authenticated-user-email'));
 if(!userId||userId.length>256||/[\s,]/.test(userId)||!email)return null;
 return {userId,email};
}
export function isArchiveMember(userId:string|null,email:string|null){
 if(!userId||userId.length>256||/[\s,]/.test(userId))return false;
 const normalized=normalizedEmail(email),configured=env.EDITOR_EMAILS;
 if(!normalized||typeof configured!=='string'||!configured.trim())return false;
 const members=configured.split(',').map(normalizedEmail);
 // A malformed/empty entry invalidates the entire configuration. No fallback.
 // PUBLIC_READ is retained in hosting config but cannot authorize archive data.
 return members.every(Boolean)&&members.includes(normalized);
}
export function canEdit(req:Request){
 const user=trustedIdentity(req.headers);
 return !!user&&isArchiveMember(user.userId,user.email);
}
