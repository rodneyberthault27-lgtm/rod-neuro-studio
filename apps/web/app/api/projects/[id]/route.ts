import { json, readJson, readProject, withUser } from '@/lib/api';
import { patchProjectSchema, uuid } from '@/lib/validators';
export const dynamic = 'force-dynamic';
type Ctx = {params:Promise<{id:string}>};

export async function GET(_request:Request,{params}:Ctx) {
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Projeto inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const {data,error}=await readProject(auth.db,id);
  if(error || !data) return json({error:'Projeto não encontrado.'},404);
  return json({project:data});
}
export async function PATCH(request:Request,{params}:Ctx) {
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Projeto inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  try {
    const input=patchProjectSchema.safeParse(await readJson(request));
    if(!input.success) return json({error:'Alterações inválidas.'},400);
    const {data,error}=await auth.db.from('rod_projects').update(input.data).eq('id',id)
      .select('id,workspace_id,title,objective,audience,channel,status,created_at,updated_at').maybeSingle();
    if(error || !data) return json({error:'Projeto não encontrado ou sem permissão.'},403);
    return json({project:data});
  }catch{return json({error:'JSON inválido.'},400);}
}
