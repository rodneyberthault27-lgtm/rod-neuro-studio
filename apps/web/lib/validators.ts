import { z } from 'zod';

export const uuid = z.uuid();
const short = z.string().trim().min(2).max(180);
export const workspaceSchema = z.object({ name: z.string().trim().min(2).max(120) }).strict();
export const projectSchema = z.object({
  workspace_id: uuid,
  title: short,
  objective: z.string().trim().max(2000).default(''),
  audience: z.string().trim().max(1000).default(''),
  channel: z.string().trim().max(120).default('')
}).strict();
export const patchProjectSchema = projectSchema.omit({workspace_id:true}).partial().refine(
  data => Object.keys(data).length > 0, {message:'Nenhum campo para atualizar.'}
);
export const documentSchema = z.object({
  kind: z.enum(['briefing','analysis','creative_version','experiment','learning']),
  payload: z.record(z.string(),z.unknown()).refine(v => JSON.stringify(v).length<=40000,{
    message:'Documento acima de 40 KB.'
  })
}).strict();

export const assetMimeTypes = new Map([
  ['image/png','.png'],['image/jpeg','.jpg'],
  ['image/webp','.webp'],['application/pdf','.pdf']
]);
export const maxAssetBytes = 10 * 1024 * 1024;
export function detectAllowedMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n)) return 'image/png';
  if (bytes.length >= 3 && bytes[0]===255 && bytes[1]===216 && bytes[2]===255) return 'image/jpeg';
  if (bytes.length >= 12 && new TextDecoder().decode(bytes.slice(0,4))==='RIFF' &&
      new TextDecoder().decode(bytes.slice(8,12))==='WEBP') return 'image/webp';
  if (bytes.length >= 5 && new TextDecoder().decode(bytes.slice(0,5))==='%PDF-') return 'application/pdf';
  return null;
}
