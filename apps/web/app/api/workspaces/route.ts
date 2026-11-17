import { json, readJson, withUser } from '@/lib/api';
import { workspaceSchema } from '@/lib/validators';
export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await withUser(); if (!auth.ok) return auth.response;
  const {data,error} = await auth.db.from('rod_workspaces').select('id,name,created_at').order('created_at',{ascending:true});
  if(error) return json({error:'Falha ao consultar workspaces.'},500);
  return json({workspaces:data ?? []});
}
export async function POST(request:Request) {
  const auth = await withUser(); if (!auth.ok) return auth.response;
  try {
    const input = workspaceSchema.safeParse(await readJson(request));
    if (!input.success) return json({error:'Nome de workspace inválido.'},400);
    const {data:id,error} = await auth.db.rpc('rod_create_workspace',{p_name:input.data.name});
    if(error || !id) return json({error:'Falha ao criar workspace.'},500);
    const result=await auth.db.from('rod_workspaces').select('id,name,created_at').eq('id',id).single();
    if(result.error) return json({error:'Workspace criado, mas consulta falhou.'},500);
    return json({workspace:result.data},201);
  } catch { return json({error:'JSON inválido.'},400); }
}
