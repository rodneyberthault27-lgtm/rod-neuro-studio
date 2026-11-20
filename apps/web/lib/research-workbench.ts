export const emotionGoals=['Curiosidade','Confiança','Alívio','Pertencimento','Interesse'] as const;
export const behavioralBarriers=['Não percebe a peça','Não entende o benefício','Não confia na promessa','Há atrito para agir','Não vê valor','Não lembra da marca'] as const;
export const uxChecklist=[
 ['attention','O foco visual é claro?'],
 ['clarity','O benefício principal é compreensível?'],
 ['proof','As provas são verificáveis?'],
 ['action','O CTA explica o próximo passo?'],
 ['friction','A ação tem poucos obstáculos?'],
 ['accessibility','O design tem contraste e legibilidade?']
] as const;
export type ResearchKind='emotion'|'ux'|'ab';
export function buildResearchDraft(kind:ResearchKind,project:{title:string;audience:string;objective:string;channel:string},payload:Record<string,unknown>){
 const names={emotion:'Hipótese de emoção e barreira',ux:'Auditoria heurística de UX',ab:'Plano de teste A/B'};
 return {
  kind:kind==='ab'?'experiment':'analysis',
  payload:{
   title:names[kind],research_kind:kind,
   source:'rod_research_workbench',
   evidence_state:'hypothesis_not_observed',
   scientific_note:'Plano ou auditoria heurística. Não há resultado observado nem medição cerebral.',
   project_context:project,...payload
  }
 };
}
