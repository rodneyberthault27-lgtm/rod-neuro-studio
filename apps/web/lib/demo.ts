// Dados inteiramente sintéticos. Não representam resultados de uma marca real.
export const demoProject = {
  title: 'DEMO | Desejo ou desconto?',
  objective: 'Comparar a comunicação de valor percebido com uma abordagem promocional, acompanhando intenção de compra, pedidos e recompra sem antecipar resultados.',
  audience: 'Lojistas e compradores de varejo especializado em uma campanha B2B fictícia.',
  channel: 'WhatsApp B2B'
} as const;

export const demoBriefing = {
  kind: 'briefing' as const,
  payload: {
    title: 'Briefing de demonstração | Valor percebido',
    text: [
      'CENÁRIO: Marca fictícia testa mensagens para lojistas.',
      'PROBLEMA: Descontos frequentes podem reduzir a força do preço de referência.',
      'HIPÓTESE A: Benefício, demonstração e prova de uso aumentam interesse na marca.',
      'HIPÓTESE B: Uma mensagem promocional aumenta a resposta imediata.',
      'EXPERIMENTO PROPOSTO: Comparar criativos com públicos e períodos equivalentes.',
      'MÉTRICAS A OBSERVAR: Resposta qualificada, pedido realizado e recompra.',
      'GUARDA-CORPOS: Margem, qualidade do lead e opt-out.',
      'IMPORTANTE: Nenhum efeito foi medido. Este documento não constitui validação científica.'
    ].join('\n'),
    source: 'synthetic_demo',
    review_note: 'Rascunho ilustrativo. Não contém métricas reais ou resultados de pesquisa.'
  }
} as const;
