import {env} from 'cloudflare:workers';

// Sites validates identity headers before forwarding requests to this worker.
export function publicReading(){return env.PUBLIC_READ==='true';}
export function editorIdentity(userId:string|null,email:string|null){
  if(!userId)return false;
  const editors=(env.EDITOR_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  if(editors.length)return !!email&&editors.includes(email.trim().toLowerCase());
  return !publicReading();
}
export function canEdit(req:Request){return editorIdentity(req.headers.get('oai-authenticated-user-id'),req.headers.get('oai-authenticated-user-email'));}
