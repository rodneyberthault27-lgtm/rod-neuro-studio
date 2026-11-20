'use client';
import {useCallback,useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {demoProject,demoBriefing} from '@/lib/demo';
import {ResearchWorkbench} from '@/components/research-workbench';

type Workspace={id:string;name:string;created_at:string};
type Project={id:string;workspace_id:string;title:string;objective:string;audience:string;channel:string;status:string;created_at:string;updated_at:string};
type Document={id:string;kind:string;revision:number;review_state:string;payload:Record<string,unknown>;created_at:string};
type Asset={id:string;original_name:string;mime_type:string;byte_size:number;created_at:string};
const modules=['Diagnóstico','Attention Lab','Behavior Lab','Estudos','Neuro Map 3D','Creative Lab','Validation Lab'];

async function request<T>(url:string,options?:RequestInit):Promise<T> {
  const resp=await fetch(url,{cache:'no-store',credentials:'same-origin',...options});
  const data=await resp.json().catch(()=>({error:'Falha ao ler resposta.'}));
  if(!resp.ok) throw new Error(data.error || 'Falha na operação.');
  return data as T;
}
function sendJson(value:unknown):RequestInit {
  return {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(value)};
}
export function StudioWorkspace({email}:{email:string}) {
  const router=useRouter();
  const [workspaces,setWorkspaces]=useState<Workspace[]>([]);
  const [workspaceId,setWorkspaceId]=useState('');
  const [projects,setProjects]=useState<Project[]>([]);
  const [projectId,setProjectId]=useState('');
  const [documents,setDocuments]=useState<Document[]>([]);
  const [assets,setAssets]=useState<Asset[]>([]);
  const [newWorkspace,setNewWorkspace]=useState('Meu estúdio');
  const [newProject,setNewProject]=useState({title:'',objective:'',audience:'',channel:''});
  const [editing,setEditing]=useState<Project|null>(null);
  const [text,setText]=useState('');
  const [kind,setKind]=useState<'briefing'|'analysis'|'creative_version'|'experiment'|'learning'>('briefing');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const selected=projects.find(p=>p.id===projectId) || null;

  const refreshProjects=useCallback(async (ws:string)=>{
    const data=await request<{projects:Project[]}>('/api/projects?workspace_id='+encodeURIComponent(ws));
    setProjects(data.projects);
    setProjectId(old=>data.projects.some(p=>p.id===old)?old:(data.projects[0]?.id??''));
  },[]);
  const refreshFiles=useCallback(async (id:string)=>{
    const [d,a]=await Promise.all([
      request<{documents:Document[]}>('/api/projects/'+id+'/documents'),
      request<{assets:Asset[]}>('/api/projects/'+id+'/assets')
    ]);
    setDocuments(d.documents);setAssets(a.assets);
  },[]);

  useEffect(()=>{
    let alive=true;
    request<{workspaces:Workspace[]}>('/api/workspaces')
      .then(data=>{if(alive){setWorkspaces(data.workspaces);setWorkspaceId(data.workspaces[0]?.id||'');}})
      .catch(err=>{if(alive)setMessage(err.message);});
    return ()=>{alive=false;};
  },[]);
  useEffect(()=>{
    if(!workspaceId){setProjects([]);setProjectId('');return;}
    refreshProjects(workspaceId).catch(e=>setMessage(e.message));
  },[workspaceId,refreshProjects]);
  useEffect(()=>{
    if(!projectId){setDocuments([]);setAssets([]);return;}
    refreshFiles(projectId).catch(e=>setMessage(e.message));
  },[projectId,refreshFiles]);
  useEffect(()=>{
    setEditing(selected?{...selected}:null);setText('');
  },[selected?.id,selected?.updated_at]);

  async function mutate(action:()=>Promise<void>){
    setBusy(true);setMessage('');
    try{await action();setMessage('Alterações salvas.');}
    catch(e){setMessage(e instanceof Error?e.message:'Falha na operação.');}
    finally{setBusy(false);}
  }
  function createWorkspace(event:React.FormEvent) {
    event.preventDefault();
    void mutate(async()=>{
      const data=await request<{workspace:Workspace}>('/api/workspaces',sendJson({name:newWorkspace}));
      setWorkspaces(old=>[...old,data.workspace]);setWorkspaceId(data.workspace.id);
    });
  }
  function createProject(event:React.FormEvent){
    event.preventDefault();if(!workspaceId)return;
    void mutate(async()=>{
      const data=await request<{project:Project}>('/api/projects',sendJson({workspace_id:workspaceId,...newProject}));
      await refreshProjects(workspaceId);
      setProjectId(data.project.id);
      setNewProject({title:'',objective:'',audience:'',channel:''});
    });
  }
  function createDemo(){
    if(!workspaceId)return;
    void mutate(async()=>{
      const {project}=await request<{project:Project}>('/api/projects',
        sendJson({workspace_id:workspaceId,...demoProject}));
      await refreshProjects(workspaceId);
      setProjectId(project.id);
      try{
        await request('/api/projects/'+project.id+'/documents',sendJson(demoBriefing));
      }catch(e){
        const reason=e instanceof Error?e.message:'Erro ao criar briefing.';
        throw new Error('Projeto demonstrativo criado, mas o briefing não foi salvo: '+reason);
      }
      await refreshFiles(project.id);
    });
  }
  function saveProject(event:React.FormEvent){
    event.preventDefault();if(!editing || !projectId)return;
    void mutate(async()=>{
      const data=await request<{project:Project}>('/api/projects/'+projectId,{
        method:'PATCH',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({title:editing.title,objective:editing.objective,audience:editing.audience,channel:editing.channel})
      });
      setProjects(old=>old.map(p=>p.id===projectId?data.project:p));
    });
  }
  function saveDocument(event:React.FormEvent){
    event.preventDefault();if(!selected || !text.trim())return;
    void mutate(async()=>{
      await request('/api/projects/'+selected.id+'/documents',sendJson({
        kind,payload:{text:text.trim(),source:'manual',note:'Rascunho sem validação científica'}
      }));
      setText('');await refreshFiles(selected.id);
    });
  }
  function uploadFile(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(!selected)return;
    const input=event.currentTarget.elements.namedItem('asset') as HTMLInputElement | null;
    const file=input?.files?.[0];if(!file)return;
    const form=new FormData();form.set('file',file);
    void mutate(async()=>{
      await request('/api/projects/'+selected.id+'/assets',{method:'POST',body:form});
      if(input)input.value='';
      await refreshFiles(selected.id);
    });
  }
  async function openAsset(id:string) {
    try{
      setMessage('');
      const data=await request<{url:string}>('/api/assets/'+id);
      const a=document.createElement('a');
      a.href=data.url;a.target='_blank';a.rel='noopener noreferrer';
      document.body.appendChild(a);a.click();a.remove();
    }catch(e){setMessage(e instanceof Error?e.message:'Falha ao abrir arquivo.');}
  }
  async function signOut(){
    setBusy(true);
    try{await request('/api/auth/signout',{method:'POST'});router.replace('/login');router.refresh();}
    catch(e){setMessage(e instanceof Error?e.message:'Falha ao sair.');}
    finally{setBusy(false);}
  }
  return <div className="studio">
    <aside className="sidebar">
      <div className="logo"><img src="/rod-symbol.svg" alt="Símbolo ROD"/><span>ROD<br/>NEURO STUDIO</span></div>
      <div className="eyebrow">PROJETOS</div>
      <nav className="project-nav" aria-label="Projetos do workspace">
        {projects.map(project=><button type="button" key={project.id}
          className={project.id===projectId?'selected':''}
          onClick={()=>setProjectId(project.id)}>{project.title}</button>)}
        {!projects.length&&<span className="subtle">Nenhum projeto neste espaço.</span>}
      </nav>
      <a className="ref-nav-link" href="/referencias">Biblioteca de fontes / 30 favoritos</a>
      <div className="sidebar-bottom">
        <span>{email}</span>
        <button className="text-action" type="button" disabled={busy} onClick={()=>void signOut()}>Sair da conta</button>
      </div>
    </aside>

    <main className="main">
      <div className="topline">
        <div><div className="eyebrow">ROD / PLATAFORMA INTEGRADA</div><h1>Seu espaço de criação.</h1>
          <span className="subtle">Projetos persistentes, com histórico e ativos protegidos.</span></div>
        {workspaces.length>0&&<label className="eyebrow">ESPAÇO DE TRABALHO
          <select aria-label="Selecionar workspace" value={workspaceId} onChange={e=>setWorkspaceId(e.target.value)}>
            {workspaces.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>}
      </div>
      {message&&<p className={message==='Alterações salvas.'?'success':'error'} role="status">{message}</p>}
      {!workspaces.length&&<section className="panel">
        <div className="eyebrow">PASSO 01 / SUA ÁREA PRIVADA</div>
        <h2>Criar workspace</h2>
        <p>Um espaço de trabalho permite guardar projetos e arquivos sem misturá-los com outras contas.</p>
        <form className="form-grid" onSubmit={createWorkspace}>
          <label className="span2">Nome<input value={newWorkspace} onChange={e=>setNewWorkspace(e.target.value)} minLength={2} maxLength={120} required /></label>
          <div className="buttons"><button className="action" disabled={busy}>Criar espaço privado</button></div>
        </form>
      </section>}
      {!!workspaceId&&<>
        <section className="panel">
          <div className="eyebrow">PASSO 02 / NOVA CAMPANHA</div>
          <h2>Criar projeto</h2>
          <form className="form-grid" onSubmit={createProject}>
            <label>Título<input value={newProject.title} onChange={e=>setNewProject({...newProject,title:e.target.value})} minLength={2} maxLength={180} required placeholder="Campanha de lançamento" /></label>
            <label>Canal<input value={newProject.channel} maxLength={120} onChange={e=>setNewProject({...newProject,channel:e.target.value})} placeholder="WhatsApp, Instagram, e-mail..." /></label>
            <label>Público<textarea value={newProject.audience} maxLength={1000} onChange={e=>setNewProject({...newProject,audience:e.target.value})} placeholder="Quem deve tomar a decisão?" /></label>
            <label>Comportamento desejado<textarea value={newProject.objective} maxLength={2000} onChange={e=>setNewProject({...newProject,objective:e.target.value})} placeholder="O que você quer que aconteça?" /></label>
            <div className="buttons span2">
              <button className="action" disabled={busy}>Criar projeto</button>
              <button className="action secondary" type="button" disabled={busy} onClick={createDemo}>
                Criar exemplo com briefing
              </button>
            </div>
          </form>
        </section>
        {selected&&<ResearchWorkbench project={selected} busy={busy} onSave={draft=>{
          void mutate(async()=>{
            await request('/api/projects/'+selected.id+'/documents',sendJson(draft));
            await refreshFiles(selected.id);
          });
        }}/>}
        {selected&&<div className="columns">
          <div>
            <section className="panel">
              <div className="eyebrow">PROJETO / {selected.status.toUpperCase()}</div>
              <h2>{selected.title}</h2>
              <p>Defina o objetivo observável antes de aplicar hipóteses de neuromarketing.</p>
              {editing&&<form className="form-grid" onSubmit={saveProject}>
                <label>Título<input required value={editing.title} minLength={2} maxLength={180} onChange={e=>setEditing({...editing,title:e.target.value})}/></label>
                <label>Canal<input value={editing.channel} maxLength={120} onChange={e=>setEditing({...editing,channel:e.target.value})}/></label>
                <label>Público<textarea value={editing.audience} maxLength={1000} onChange={e=>setEditing({...editing,audience:e.target.value})}/></label>
                <label>Objetivo<textarea value={editing.objective} maxLength={2000} onChange={e=>setEditing({...editing,objective:e.target.value})}/></label>
                <div className="buttons span2"><button className="action secondary" disabled={busy}>Salvar alterações</button></div>
              </form>}
            </section>
            <section className="panel">
              <div className="eyebrow">BASE DO PROJETO</div>
              <h2>Documentos e versões</h2>
              <p>O texto fica associado ao projeto e mantém histórico de criação. Nenhum documento é tratado automaticamente como diagnóstico validado.</p>
              <form className="note-form" onSubmit={saveDocument}>
                <label>Tipo do documento<select value={kind} onChange={e=>setKind(e.target.value as typeof kind)}>
                  <option value="briefing">Briefing</option>
                  <option value="analysis">Nota de análise</option>
                  <option value="creative_version">Versão criativa</option>
                  <option value="experiment">Plano de teste</option>
                  <option value="learning">Aprendizado</option>
                </select></label>
                <label>Conteúdo<textarea minLength={1} required value={text} onChange={e=>setText(e.target.value)} placeholder="Registre briefing, hipótese ou direção criativa." maxLength={35000}/></label>
                <div className="buttons"><button className="action" disabled={busy || !text.trim()}>Salvar documento</button></div>
              </form>
              <div className="line-list" style={{marginTop:25}}>
                {documents.map(doc=><div className="line-item" key={doc.id}>
                  <div><strong>{doc.kind.replace(/_/g,' ')}</strong><div className="mini-meta">Rascunho · {new Date(doc.created_at).toLocaleDateString('pt-BR')}</div>
                    <small>{typeof doc.payload.text==='string'?doc.payload.text.slice(0,160):'Documento estruturado'}</small></div>
                </div>)}
                {!documents.length&&<div className="empty">Ainda não há documentos salvos.</div>}
              </div>
            </section>
          </div>
          <div>
            <section className="panel">
              <div className="eyebrow">BIBLIOTECA DE ATIVOS</div>
              <h2>Arquivos privados</h2>
              <p>PNG, JPG, WebP ou PDF. Máximo de 10 MB. Sem acesso público permanente.</p>
              <form onSubmit={uploadFile}>
                <input type="file" name="asset" required accept=".png,.jpg,.jpeg,.webp,.pdf,image/png,image/jpeg,image/webp,application/pdf"/>
                <div className="buttons"><button className="action secondary" disabled={busy}>Enviar arquivo</button></div>
              </form>
              <div className="line-list" style={{marginTop:22}}>
                {assets.map(asset=><div className="line-item" key={asset.id}>
                  <span>{asset.original_name}<small className="subtle"> · {Math.round(asset.byte_size/1024)} KB</small></span>
                  <button type="button" className="text-action" onClick={()=>void openAsset(asset.id)}>Abrir</button>
                </div>)}
                {!assets.length&&<div className="empty">Nenhum arquivo anexado.</div>}
              </div>
            </section>
            <section className="panel">
              <div className="eyebrow">MÉTODO ROD / 7 MÓDULOS</div>
              <h2>Motor científico</h2>
              <p>Os laboratórios serão conectados ao projeto nas próximas fases. O modo atual não executa IA nem simula medições.</p>
              <div className="modules">{modules.map(m=><div key={m} className="module">{m}<small>Integração pendente</small></div>)}</div>
            </section>
          </div>
        </div>}
      </>}
    </main>
  </div>;
}
