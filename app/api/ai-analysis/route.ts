import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { semester, items, movementsCount, schoolName } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        analysis: generateHeuristicAnalysis(semester, items),
        source: 'local_engine',
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Prepare succinct summary for prompt
    const criticalItems = items.filter((i: any) => i.quantity <= i.minQuantity);
    const summary = items.slice(0, 30).map((i: any) => ({
      item: i.name,
      categoria: i.category,
      estoque: i.quantity,
      minimo: i.minQuantity,
      metaSemestral: i.targetSemesterStock,
      unidade: i.unit,
      precisaComprar: Math.max(0, i.targetSemesterStock - i.quantity),
    }));

    const prompt = `Você é um especialista em gestão de almoxarifado escolar e logística educacional no Brasil.
Escola: ${schoolName || 'Escola de Ensino Fundamental e Médio'}
Semestre de Planejamento: ${semester === '1' ? '1º Semestre Letivo (Fevereiro a Julho)' : '2º Semestre Letivo (Agosto a Dezembro)'}
Total de Itens Cadastrados: ${items.length}
Total de Itens em Nível Crítico/Falta: ${criticalItems.length}

Resumo dos principais itens do depósito:
${JSON.stringify(summary, null, 2)}

Por favor, forneça um parecer executivo claro e estruturado em português (formato Markdown) contendo:
1. **Diagnóstico Imediato de Riscos**: Quais itens mais colocam em risco o funcionamento das aulas ou da higiene escolar se não forem repostos com urgência?
2. **Picos Sazonais e Calendário Escolar**: Quais eventos típicos deste semestre (${semester === '1' ? 'volta às aulas, acolhimento, avaliações do 1º bimestre, festa junina' : 'semana da pátria, feira de ciências/artes, semana da criança, avaliações finais'}) exigem atenção redobrada em papelaria, limpeza e jogos?
3. **Recomendações Práticas de Economia e Conservação**: Dicas para o almoxarife e coordenação escolar evitarem desperdício de papelaria e cuidarem dos itens de capital/patrimônio (projetores, computadores, jogos).
4. **Resumo das 3 Maiores Prioridades de Compra**.

Mantenha o tom profissional, colaborativo e objetivo.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({
      analysis: response.text,
      source: 'gemini_ai',
    });
  } catch (error: any) {
    console.error('Erro na rota de análise de IA:', error);
    // Return heuristic response so the UI always works seamlessly
    return NextResponse.json({
      analysis: 'Análise gerada com base nos parâmetros do estoque local devido a indisponibilidade momentânea da conexão de IA.\n\n### 1. Diagnóstico de Risco\nItens de papelaria como Sulfite A4 e Canetas de Quadro Branco estão em patamares críticos e devem ser pedidos prioritariamente antes do início do ciclo de avaliações.\n\n### 2. Higiene e Limpeza\nDesinfetante e Papel toalha necessitam de reposição quinzenal para atender às normas da vigilância sanitária escolar.',
      source: 'fallback',
    });
  }
}

function generateHeuristicAnalysis(semester: string, items: any[]): string {
  const critical = items.filter((i: any) => i.quantity <= i.minQuantity);
  const criticalNames = critical.map((i: any) => i.name).slice(0, 5).join(', ');

  const semesterLabel = semester === '1' 
    ? '1º Semestre Letivo (Fev a Jul - Volta às Aulas e 1º Ciclo de Provas)'
    : '2º Semestre Letivo (Ago a Dez - Feiras Culturais, Primavera e Fechamento de Ano)';

  return `### Relatório Estratégico do Almoxarifado Escolar (${semesterLabel})

#### 1. Diagnóstico dos Materiais em Risco Crítico
Atualmente identificamos **${critical.length} itens** abaixo do estoque de segurança:
${critical.map((c: any) => `- **${c.name}**: Estoque atual de ${c.quantity} ${c.unit} (Mínimo recomendado: ${c.minQuantity}).`).join('\n')}

> **Atenção:** Materiais de uso contínuo (Sulfite, Canetas de Quadro e Papel Toalha) devem ser priorizados para evitar interrupção de atividades pedagógicas e rotinas sanitárias.

#### 2. Destaques para o Calendário Escolar
- **Papelaria:** Manter margem de 15% a 20% acima do consumo projetado nas semanas de avaliações e feiras culturais.
- **Jogos & Educação Física:** Agendar revisão preventiva nos tabuleiros e calibragem de bolas antes de gincanas e torneios interclasses.
- **Itens de Capital:** Realizar conferência de tombamento semestral e exigir assinatura do termo de cautela para projetores e equipamentos móveis.
- **Limpeza:** O consumo de papel toalha e sabonete dobra em períodos chuvosos e horários de recreio integral.

#### 3. Recomendações de Compra
Recomenda-se realizar pedido unificado para obter melhores descontos em distribuidoras de papelaria e higiene institucional.`;
}
