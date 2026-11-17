import { json, readJson, readProject, withUser } from '@/lib/api';
import { documentSchema, uuid } from '@/lib/validators';
export const dynamic = 'force-dynamic';
type Ctx={params:Promise<{id:string}>};

export async function GET(_request:Request,{params}:Ctx) {
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Projeto inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const project=await readProject(auth.db,id);
  if(project.error || !project.data) return json({error:'Projeto não encontrado.'},404);
  const {data,error}=await auth.db.from('rod_documents').select('id,kind,revision,review_state,payload,created_at')
    .eq('project_id',id).order('created_at',{ascending:false}).limit(100);
  if(error) return json({error:'Falha ao consultar documentos.'},500);
  return json({documents:data??[]});
}

export async function POST(request:Request,{params}:Ctx) {
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Projeto inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const project=await readProject(auth.db,id);
  if(project.error || !project.data) return json({error:'Projeto não encontrado.'},404);
  try {
    const input=documentSchema.safeParse(await readJson(request));
    if(!input.success) return json({error:'Documento inválido.'},400);
    const {data,error}=await auth.db.from('rod_documents').insert({
      workspace_id:project.data.workspace_id,project_id:id,created_by:auth.user.id,
      kind:input.data.kind,payload:input.data.payload,review_state:'draft'
    }).select('id,kind,revision,review_state,payload,created_at').single();
    if(error) return json({error:'Sem permissão ou falha ao gravar documento.'},403);
    return json({document:data},201);
  }catch{return json({error:'JSON inválido.'},400);}
}
