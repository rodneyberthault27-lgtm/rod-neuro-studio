'use client';
import {useMemo,useState} from 'react';
import {favoriteSources} from '@/lib/references-v3';

const categories=['Todas',...Array.from(new Set(favoriteSources.map(s=>s.category)))].sort(
  (a,b)=>a==='Todas'?-1:b==='Todas'?1:a.localeCompare(b,'pt-BR')
);

export function SourcesDirectory(){
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('Todas');
  const visible=useMemo(()=>{
    const q=query.trim().toLocaleLowerCase('pt-BR');
    return favoriteSources.filter(s=>{
      const group=category==='Todas'||s.category===category;
      const includes=!q||[s.name,s.category,s.application,...s.modules]
        .join(' ').toLocaleLowerCase('pt-BR').includes(q);
      return group&&includes;
    });
  },[query,category]);
  return <main className="references-page">
    <header className="references-header">
      <a href="/studio" className="references-back">Voltar aos projetos</a>
      <div className="eyebrow">ROD / BIBLIOTECA DE FONTES</div>
      <h1>Conhecimento com procedência.</h1>
      <p>Fontes públicas, ferramentas, exemplos visuais e recursos de pesquisa
      organizados sem confundir referências com resultados científicos.</p>
    </header>
    <section className="references-stats" aria-label="Estado da curadoria">
      <div><b>30</b><span>Favoritos catalogados</span></div>
      <div><b>13</b><span>Conferências públicas parciais</span></div>
      <div><b>09</b><span>Acessos restritos</span></div>
    </section>
    <div className="references-grid">
      <aside className="references-filters">
        <label>Buscar<input type="search" value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Atenção, UX, estudos..." aria-label="Buscar referências"/></label>
        <label>Área de pesquisa<select value={category} onChange={e=>setCategory(e.target.value)}>
          {categories.map(c=><option value={c} key={c}>{c}</option>)}
        </select></label>
        <p>Conferência pública parcial significa apenas que a descrição do recurso foi checada,
          não que os artigos disponíveis nele foram estudados.</p>
      </aside>
      <section aria-label="Referências catalogadas" className="references-content">
        <p className="references-count" aria-live="polite">{visible.length} referências</p>
        {visible.map(s=><article className="references-item" key={s.id}>
          <div className="references-kicker"><span>{s.id} / 30</span><span>{s.category}</span>
            <span>{s.verification==='reviewed'?'Conferência pública parcial':
              s.access==='public'?'Não conferido':'Acesso restrito'}</span></div>
          <h2>{s.name}</h2>
          <p>{s.application}</p>
          <div className="references-meta">
            <span>{s.modules.join(' · ')}</span>
            {s.url && s.access==='public'?
              <a href={s.url} target="_blank" rel="noopener noreferrer">Abrir referência</a>:
              <span>Conteúdo privado não acessado</span>}
          </div>
        </article>)}
        {!visible.length&&<div className="references-item">Nenhuma referência encontrada.</div>}
      </section>
    </div>
    <footer className="references-warning">
      <h2>Política de evidência</h2>
      <p>Saliência visual computacional não é rastreamento ocular real. Estudos com
      webcam exigem participantes, consentimento, calibração e avaliação de erro.
      Atlas cerebrais não demonstram que uma campanha provocou ativação neuronal.
      Nenhuma fonte privada foi copiada para esta biblioteca.</p>
    </footer>
  </main>;
}
