'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/client';

export function LoginForm() {
  const router=useRouter();
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [error,setError]=useState('');
  const [waiting,setWaiting]=useState(false);

  async function onSubmit(event:React.FormEvent) {
    event.preventDefault(); setWaiting(true);setError('');
    try {
      const db=createClient();
      const result=mode==='login'?
        await db.auth.signInWithPassword({email,password}):
        await db.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/auth/callback'}});
      if(result.error) {setError(result.error.message);return;}
      if(mode==='signup' && !result.data.session) {
        setError('Verifique o e-mail para confirmar o cadastro antes de entrar.'); return;
      }
      router.replace('/studio');router.refresh();
    }catch {setError('Não foi possível conectar ao serviço de autenticação.');}
    finally {setWaiting(false);}
  }
  return <form className="auth-form" onSubmit={onSubmit}>
    <label>E-mail<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></label>
    <label>Senha<input type="password" required minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} value={password} onChange={e=>setPassword(e.target.value)} /></label>
    <button className="action" disabled={waiting} type="submit">{waiting?'Aguarde...':mode==='login'?'Entrar':'Criar conta'}</button>
    {error&&<p className="error" role="status">{error}</p>}
    <button type="button" className="text-action" onClick={()=>{setMode(mode==='login'?'signup':'login');setError('');}}>
      {mode==='login'?'Criar conta (se autorizado)':'Já tenho uma conta'}
    </button>
  </form>;
}
