import {verifyMutationOrigin} from '@/lib/request-security';
import { randomUUID } from 'node:crypto';
import { json, readProject, withUser } from '@/lib/api';
import { assetMimeTypes, detectAllowedMime, maxAssetBytes, uuid } from '@/lib/validators';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
type Ctx={params:Promise<{id:string}>};

export async function GET(_request:Request,{params}:Ctx) {
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Projeto inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const project=await readProject(auth.db,id);
  if(project.error || !project.data) return json({error:'Projeto não encontrado.'},404);
  const {data,error}=await auth.db.from('rod_assets').select('id,original_name,mime_type,byte_size,created_at')
    .eq('project_id',id).order('created_at',{ascending:false}).limit(100);
  if(error) return json({error:'Falha ao consultar arquivos.'},500);
  return json({assets:data??[]});
}

export async function POST(request:Request,{params}:Ctx) {
  if(!verifyMutationOrigin(request)) return json({error:'Origem da requisição não permitida.'},403);
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Projeto inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const project=await readProject(auth.db,id);
  if(project.error || !project.data) return json({error:'Projeto não encontrado.'},404);
  const length=Number(request.headers.get('content-length') || 0);
  if(length > maxAssetBytes+200000) return json({error:'Arquivo maior que 10 MB.'},413);
  let file:File;
  try {
    const form=await request.formData();
    const input=form.get('file');
    if(!(input instanceof File)) return json({error:'Arquivo ausente.'},400);
    file=input;
  } catch { return json({error:'Formulário inválido.'},400); }
  if(file.size<1 || file.size>maxAssetBytes) return json({error:'Arquivo precisa ter até 10 MB.'},413);
  const suffix=assetMimeTypes.get(file.type);
  if(!suffix) return json({error:'Formato não permitido.'},415);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if(detectAllowedMime(bytes)!==file.type) return json({error:'Conteúdo não corresponde ao formato informado.'},415);
  const assetId=randomUUID();
  const key = [project.data.workspace_id,id,assetId+suffix].join('/');
  const upload=await auth.db.storage.from('rod-private').upload(key,bytes,{
    contentType:file.type,cacheControl:'0',upsert:false
  });
  if(upload.error) return json({error:'Falha ao armazenar arquivo privado.'},403);
  const {data,error}=await auth.db.from('rod_assets').insert({
    id:assetId,workspace_id:project.data.workspace_id,project_id:id,
    storage_key:key,original_name:file.name.slice(0,180) || 'arquivo'+suffix,
    mime_type:file.type,byte_size:file.size,created_by:auth.user.id
  }).select('id,original_name,mime_type,byte_size,created_at').single();
  if(error) {
    // Compensating action across Storage/Postgres (not an atomic transaction).
    await auth.db.storage.from('rod-private').remove([key]);
    return json({error:'Metadados não foram gravados; upload revertido quando possível.'},500);
  }
  return json({asset:data},201);
}
