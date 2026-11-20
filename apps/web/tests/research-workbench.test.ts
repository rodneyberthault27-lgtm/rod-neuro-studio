import test from 'node:test';
import assert from 'node:assert/strict';
import {documentSchema} from '../lib/validators';
import {buildResearchDraft,emotionGoals,behavioralBarriers,uxChecklist} from '../lib/research-workbench';
const project={title:'Campanha fictícia',audience:'Lojistas',objective:'Solicitar pedido',channel:'WhatsApp'};
test('templates cover emotion, UX and A/B without inventing outcomes',()=>{
 const samples={
  emotion:{target_emotion:'Curiosidade',barrier:'Não percebe a peça',creative_hypothesis:'Demonstração de uso',observable_behavior:'Abrir produto'},
  ux:{review_required:[uxChecklist[0]],observation:'Checar foco com participantes'},
  ab:{control_a:'Atual',variation_b:'Nova',primary_metric:'Pedidos',observation_window:'14 dias',guardrail:'Reclamações',observed_result:null}
 } as const;
 for(const kind of ['emotion','ux','ab'] as const){
  const doc=buildResearchDraft(kind,project,{...samples[kind]});
  assert.equal(documentSchema.safeParse(doc).success,true);
  assert.equal(doc.payload.evidence_state,'hypothesis_not_observed');
  assert.match(String(doc.payload.scientific_note),/Não há resultado observado/);
 }
 assert.equal(new Set(emotionGoals).size,emotionGoals.length);
 assert.equal(new Set(behavioralBarriers).size,behavioralBarriers.length);
 assert.equal(new Set(uxChecklist.map(x=>x[0])).size,uxChecklist.length);
});
