import { json, readJson, withUser } from '@/lib/api';
import { projectSchema, uuid } from '@/lib/validators';
export const dynamic = 'force-dynamic';

export async function GET(request:Request) {
  const auth = await withUser(); if(!auth.ok) return auth.response;
  const ws = new URL(request.url).searchParams.get('workspace_id');
  if(ws && !uuid.safeParse(ws).success) return json({error:'Workspace inválido.'},400);
  let q = auth.db.from('rod_projects').select('id,workspace_id,title,objective,audience,channel,status,created_at,updated_at').order('updated_at',{ascending:false}).limit(100);
  if(ws) q=q.eq('workspace_id',ws);
  const {data,error}=await q;
  if(error) return json({error:'Falha ao consultar projetos.'},500);
  return json({projects:data??[]});
}
export async function POST(request:Request) {
  const auth = await withUser(); if(!auth.ok) return auth.response;
  try {
    const input=projectSchema.safeParse(await readJson(request));
    if(!input.success) return json({error:'Dados do projeto inválidos.'},400);
    const {data,error}=await auth.db.from('rod_projects').insert({
      ...input.data, created_by:auth.user.id, status:'briefing'
    }).select('id,workspace_id,title,objective,audience,channel,status,created_at,updated_at').single();
    if(error) return json({error:'Sem permissão ou falha ao criar projeto.'},403);
    return json({project:data},201);
  }catch {return json({error:'JSON inválido.'},400);}
}
