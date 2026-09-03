function calcularProteinaISSN(peso, objetivo) {
  // A ISSN recomenda 1.4 a 2.0 g/kg/dia para a maioria dos indivíduos que se exercitam[span_1](start_span)[span_1](end_span)
  let proteinaMin = peso * 1.4;
  let proteinaMax = peso * 2.0;

  // Ingestões maiores (>3.0 g/kg/d) podem ter efeitos positivos na perda de massa gorda em indivíduos treinados[span_2](start_span)[span_2](end_span)
  if (objetivo === "cutting") {
    proteinaMin = peso * 2.4; // Baseado na citação de dietas restritivas com 3x a RDA[span_3](start_span)[span_3](end_span)
    proteinaMax = peso * 3.0; 
  }

  // Recomendação de dose por refeição para maximizar a síntese: 0.25 g/kg ou dose absoluta de 20 a 40 g[span_4](start_span)[span_4](end_span)
  let doseRefeicao = peso * 0.25;
  if (doseRefeicao < 20) doseRefeicao = 20;
  if (doseRefeicao > 40) doseRefeicao = 40;

  return {
    alvoDiario: `${proteinaMin.toFixed(0)}g a ${proteinaMax.toFixed(0)}g`,
    doseIdealPorRefeicao: `${doseRefeicao.toFixed(0)}g`,
    frequencia: "A cada 3 a 4 horas", // As doses devem ser distribuídas uniformemente ao longo do dia[span_5](start_span)[span_5](end_span)
    leucinaPorRefeicao: "700mg a 3000mg" // Doses agudas devem buscar essa faixa de leucina[span_6](start_span)[span_6](end_span)
  };
}

// Exemplo rodando a calculadora para uma estrutura de 87 kg:
const pesoAtual = 87;
const objetivoAtual = "manutencao"; 

const macros = calcularProteinaISSN(pesoAtual, objetivoAtual);
console.log(`Meta diária: ${macros.alvoDiario}`);
console.log(`Dose por refeição: ${macros.doseIdealPorRefeicao} (${macros.frequencia})`);

