import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {hasSupabaseConfig} from '@/lib/supabase/env';
import {SourcesDirectory} from '@/components/sources-directory';
export const dynamic='force-dynamic';

export default async function ReferencesPage(){
  if(!hasSupabaseConfig())return <main className="setup-page">
    <h1>Biblioteca em preparação</h1>
    <p>Conecte o ambiente de homologação para consultar referências na plataforma integrada.</p>
    <a href="/studio">Voltar</a>
  </main>;
  const db=await createClient();
  const {data:{user},error}=await db.auth.getUser();
  if(error||!user)redirect('/login');
  return <SourcesDirectory/>;
}
