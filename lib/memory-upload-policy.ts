export const MiB = 1024 * 1024;
export const memoryLimits = {photo: 20 * MiB, audio: 60 * MiB, video: 150 * MiB} as const;
export const memoryTypes = ['image/jpeg','image/png','image/gif','image/webp','video/mp4','video/webm','audio/mpeg','audio/mp4','audio/x-m4a','audio/wav','audio/x-wav','audio/ogg','audio/webm'];
export function memoryKind(mime:string):keyof typeof memoryLimits {
 return mime.startsWith('audio/')?'audio':mime.startsWith('video/')?'video':'photo';
}
