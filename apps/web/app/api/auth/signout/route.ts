import {json,withUser} from '@/lib/api';
export const dynamic='force-dynamic';
export async function POST() {
  const auth=await withUser(); if(!auth.ok) return auth.response;
  const {error}=await auth.db.auth.signOut();
  if(error) return json({error:'Não foi possível encerrar a sessão.'},500);
  return json({ok:true});
}
