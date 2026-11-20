'use client';
import {useState} from 'react';
import {emotionGoals,behavioralBarriers,uxChecklist,buildResearchDraft,type ResearchKind} from '@/lib/research-workbench';
type Project={title:string;audience:string;objective:string;channel:string};
type Draft=ReturnType<typeof buildResearchDraft>;
export function ResearchWorkbench({project,busy,onSave}:{project:Project;busy:boolean;onSave:(value:Draft)=>void}){
 const [mode,setMode]=useState<ResearchKind>('emotion');
 const [emotion,setEmotion]=useState<string>(emotionGoals[0]);
 const [barrier,setBarrier]=useState<string>(behavioralBarriers[0]);
 const [idea,setIdea]=useState('');
 const [behavior,setBehavior]=useState('');
 const [issues,setIssues]=useState<string[]>([]);
 const [notes,setNotes]=useState('');
 const [control,setControl]=useState('');
 const [variant,setVariant]=useState('');
 const [metric,setMetric]=useState('');
 const [window,setWindow]=useState('');
 const [guardrail,setGuardrail]=useState('');
 const [error,setError]=useState('');
 function save(event:React.FormEvent){
  event.preventDefault();setError('');
  let data:Record<string,unknown>;
  if(mode==='emotion'){
   if(!idea.trim()||!behavior.trim()){setError('Descreva o estímulo e o comportamento observável.');return;}
   data={target_emotion:emotion,barrier,creative_hypothesis:idea.trim(),observable_behavior:behavior.trim()};
  }else if(mode==='ux'){
   if(!notes.trim()){setError('Descreva a observação e uma validação possível.');return;}
   data={review_required:uxChecklist.filter(([id])=>issues.includes(id)),observation:notes.trim(),
    methodology:'Checklist heurístico, sem teste com participantes'};
  }else{
   if(!control.trim()||!variant.trim()||!metric.trim()||!window.trim()||!guardrail.trim()){
    setError('Preencha as duas versões, a métrica, a janela e o guardrail.');return;
   }
   data={control_a:control.trim(),variation_b:variant.trim(),primary_metric:metric.trim(),
    observation_window:window.trim(),guardrail:guardrail.trim(),observed_result:null,
    methodology:'Pré-registro; resultado somente após amostra e análise de dados reais'};
  }
  onSave(buildResearchDraft(mode,project,data));
 }
 return <section className="research-workbench" aria-label="Workflows de pesquisa ROD">
  <header><div className="eyebrow">MÉTODO ROD / LABORATÓRIOS APLICADOS</div>
   <h2>Da hipótese ao experimento.</h2>
   <p>Estruture decisões com base no seu projeto. Os resultados só existem quando forem medidos.</p></header>
  <div className="research-modes" role="tablist" aria-label="Escolher tipo de estudo">
   <button type="button" role="tab" aria-selected={mode==='emotion'} onClick={()=>{setMode('emotion');setError('');}}>Emoção e barreiras</button>
   <button type="button" role="tab" aria-selected={mode==='ux'} onClick={()=>{setMode('ux');setError('');}}>Auditoria UX</button>
   <button type="button" role="tab" aria-selected={mode==='ab'} onClick={()=>{setMode('ab');setError('');}}>Planejamento A/B</button>
  </div>
  <form className="research-form" onSubmit={save}>
   {mode==='emotion'&&<div className="research-grid">
    <p className="research-intro">Referência conceitual: Atlas of Emotions. Intenção emocional não é emoção detectada.</p>
    <label>Emoção desejada<select value={emotion} onChange={e=>setEmotion(e.target.value)}>
     {emotionGoals.map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Barreira principal<select value={barrier} onChange={e=>setBarrier(e.target.value)}>
     {behavioralBarriers.map(x=><option key={x}>{x}</option>)}</select></label>
    <label className="research-span">Que situação criativa poderia alterar a percepção?
     <textarea maxLength={2500} value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Hipótese baseada em uma situação real do público"/></label>
    <label className="research-span">Qual comportamento poderá ser observado?
     <input maxLength={600} value={behavior} onChange={e=>setBehavior(e.target.value)} placeholder={project.objective||'Ex.: pedir informações'}/></label>
   </div>}
   {mode==='ux'&&<div className="research-grid">
    <p className="research-intro">Inspirado em critérios de UX da Nielsen Norman Group. Esta auditoria não substitui testes de usabilidade.</p>
    <div className="research-checks research-span">{uxChecklist.map(([id,question])=>
     <label key={id}><input type="checkbox" checked={issues.includes(id)}
      onChange={e=>setIssues(old=>e.target.checked?[...old,id]:old.filter(x=>x!==id))}/>
      <span>{question} <small>Marque se precisar de revisão.</small></span></label>)}</div>
    <label className="research-span">Observações, proposta de correção e validação
     <textarea maxLength={5000} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="O que foi observado? Como testar com o público?"/></label>
   </div>}
   {mode==='ab'&&<div className="research-grid">
    <p className="research-intro">Pré-registre um teste antes de olhar dados. Não há cálculo automático de significância ou vencedor.</p>
    <label>Controle A<textarea maxLength={2400} value={control} onChange={e=>setControl(e.target.value)} placeholder="Versão atual"/></label>
    <label>Variante B<textarea maxLength={2400} value={variant} onChange={e=>setVariant(e.target.value)} placeholder="Uma mudança isolada"/></label>
    <label>Métrica principal<input maxLength={350} value={metric} onChange={e=>setMetric(e.target.value)} placeholder="Ex.: pedidos qualificados por sessão"/></label>
    <label>Janela e distribuição<input maxLength={350} value={window} onChange={e=>setWindow(e.target.value)} placeholder="Ex.: 14 dias, alocação aleatória"/></label>
    <label className="research-span">Guardrail e interrupção<textarea maxLength={2000} value={guardrail} onChange={e=>setGuardrail(e.target.value)} placeholder="Ex.: margem mínima, reclamações, qualidade dos leads"/></label>
   </div>}
   <footer className="research-footer"><p>Registro como rascunho. Sem atribuir efeitos cerebrais, atenção ocular ou conversões não observadas.</p>
    <button type="submit" className="action" disabled={busy}>Salvar no projeto</button></footer>
   {error&&<p className="error" role="alert">{error}</p>}
  </form>
 </section>;
}
