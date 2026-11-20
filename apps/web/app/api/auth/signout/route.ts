import {verifyMutationOrigin} from '@/lib/request-security';
import {json,withUser} from '@/lib/api';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  if(!verifyMutationOrigin(request)) return json({error:'Origem da requisição não permitida.'},403);
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const {error}=await auth.db.auth.signOut();
  if(error) return json({error:'Não foi possível encerrar a sessão.'},500);
  return json({ok:true});
}
