import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {hasSupabaseConfig} from '@/lib/supabase/env';
import {StudioWorkspace} from '@/components/studio-workspace';
export const dynamic='force-dynamic';
export default async function StudioPage() {
  if(!hasSupabaseConfig()) return <main className="setup-page">
    <div className="eyebrow">ROD NEURO STUDIO / SETUP</div>
    <h1>Infraestrutura pronta para configuração</h1>
    <p>A implantação da Fase 1 está isolada da versão online. Configure um projeto Supabase separado e aplique a migração SQL de homologação.</p>
    <code>NEXT_PUBLIC_SUPABASE_URL</code>
    <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>
    <p>Veja apps/web/README.md. Não adicione chaves a commits.</p>
  </main>;
  const db=await createClient();
  const {data:{user},error}=await db.auth.getUser();
  if(error || !user) redirect('/login');
  return <StudioWorkspace email={user.email||'Usuário'} />;
}
