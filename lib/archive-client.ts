// A denial revokes this mounted page's capability until a fresh server render.
// This is cleanup only; the server independently authorizes every request.
export const archiveDeniedEvent='yc-archive-access-denied';
export function notifyArchiveDenied(status:number){
 if((status===401||status===403)&&typeof window!=='undefined')window.dispatchEvent(new Event(archiveDeniedEvent));
}
