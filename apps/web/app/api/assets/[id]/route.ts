import { json, withUser } from '@/lib/api';
import { uuid } from '@/lib/validators';
export const dynamic='force-dynamic';
type Ctx={params:Promise<{id:string}>};

export async function GET(_request:Request,{params}:Ctx) {
  const {id}=await params;
  if(!uuid.safeParse(id).success) return json({error:'Arquivo inválido.'},400);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const {data,error}=await auth.db.from('rod_assets').select('storage_key,original_name').eq('id',id).maybeSingle();
  if(error || !data) return json({error:'Arquivo não encontrado.'},404);
  const link=await auth.db.storage.from('rod-private').createSignedUrl(data.storage_key,60);
  if(link.error || !link.data?.signedUrl) return json({error:'Falha ao gerar acesso temporário.'},500);
  return json({url:link.data.signedUrl,expires_in:60,filename:data.original_name});
}
