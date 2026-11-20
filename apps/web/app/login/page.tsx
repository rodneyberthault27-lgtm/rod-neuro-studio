import { LoginForm } from '@/components/login-form';
export default function LoginPage(){
  return <main className="auth-page"><section className="auth-shell">
    <div className="eyebrow">ROD / PRIVATE WORKSPACE</div>
    <h1>Da intenção criativa à decisão validada.</h1>
    <p>Entre para organizar projetos, briefings e arquivos na plataforma integrada.</p>
    <LoginForm/>
    <small>Sem acesso a informações do Claude Artifact nesta versão.</small>
  </section></main>;
}
