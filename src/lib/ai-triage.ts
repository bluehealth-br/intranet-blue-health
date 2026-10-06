import type { Urgency, ProjectType, Submission, SubmissionUpdate } from "./mock-data";

export interface TriageInput {
  title: string;
  description: string;
  ai_tool: string;
  project_type: ProjectType;
  project_url: string;
  what_needs: string;
  deadline: string;
}

export interface TriageResult {
  urgency: Urgency;
  complexity: "simples" | "moderada" | "complexa";
  need_summary: string;
  desire_summary: string;
  approach: string;
  risks: string[];
  estimated_hours: string;
  triage_notes: string;
}

export interface UpdateAnalysis {
  message: string;
}

const DELAY_MS = 3500;
const ANALYSIS_DELAY_MS = 2000;

export async function runAiTriage(input: TriageInput): Promise<TriageResult> {
  await new Promise((r) => setTimeout(r, DELAY_MS));

  const desc = `${input.title} ${input.description} ${input.what_needs}`.toLowerCase();

  const urgency = inferUrgency(desc, input.deadline);
  const complexity = inferComplexity(desc, input.project_type);
  const needSummary = inferNeed(desc, input.what_needs);
  const desireSummary = inferDesire(desc, input.what_needs);
  const approach = inferApproach(desc, input.project_type, input.ai_tool);
  const risks = inferRisks(desc, input.project_type);
  const hours = inferHours(complexity);

  return {
    urgency,
    complexity,
    need_summary: needSummary,
    desire_summary: desireSummary,
    approach,
    risks,
    estimated_hours: hours,
    triage_notes: buildTriageNotes(input, complexity, urgency),
  };
}

function inferUrgency(desc: string, deadline: string): Urgency {
  if (desc.match(/urgente|crítico|produção caiu|bloqueado|não funciona|erro grave|offline/))
    return "critica";
  if (deadline) {
    const days = Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / 86_400_000,
    );
    if (days <= 3) return "critica";
    if (days <= 7) return "alta";
    if (days <= 14) return "media";
  }
  if (desc.match(/rápido|essa semana|amanhã|sprint|pressa|logo/)) return "alta";
  if (desc.match(/quando puder|sem pressa|próximo mês|futur/)) return "baixa";
  return "media";
}

function inferComplexity(desc: string, _type: ProjectType): "simples" | "moderada" | "complexa" {
  if (_type === "automacao" || _type === "chatbot") return "complexa";
  if (desc.match(/integra|api|autenticação|banco|deploy|ci\/cd|pipeline|segurança|rls/))
    return "complexa";
  if (desc.match(/design|layout|responsiv|marca|brand|ajust|css|estilo/))
    return "simples";
  return "moderada";
}

function inferNeed(desc: string, _whatNeeds: string): string {
  const needs: string[] = [];
  if (desc.match(/review|revisar|código|code/)) needs.push("Review de código");
  if (desc.match(/deploy|publicar|hospedar|produção/)) needs.push("Deploy e infraestrutura");
  if (desc.match(/bug|erro|fix|corrig|não funciona/)) needs.push("Correção de bugs");
  if (desc.match(/design|layout|responsiv|marca|brand|css/)) needs.push("Ajustes de design/marca");
  if (desc.match(/integra|api|webhook|banco|supabase/)) needs.push("Integração de sistemas");
  if (desc.match(/segurança|auth|token|rls|permiss/)) needs.push("Review de segurança");
  if (desc.match(/performance|lent|otimiz/)) needs.push("Otimização de performance");
  if (needs.length === 0) needs.push("Validação técnica geral");
  return needs.join(" + ");
}

function inferDesire(_desc: string, whatNeeds: string): string {
  const w = whatNeeds.toLowerCase();
  if (w.match(/funcionando|no ar|produção|deploy|publicar/))
    return "Ter o projeto funcionando em produção para uso real";
  if (w.match(/melhorar|ajustar|refinar|polir/))
    return "Refinar o projeto para atingir qualidade profissional";
  if (w.match(/aprender|entender|ensinar/))
    return "Entender as melhores práticas e aprender com o review";
  if (w.match(/rápido|urgente|bloqueado/))
    return "Resolver um bloqueio técnico que impede o avanço";
  return "Validar se o projeto criado com IA atende aos padrões da empresa";
}

function inferApproach(desc: string, _type: ProjectType, aiTool: string): string {
  const steps: string[] = [];

  steps.push(`1. Analisar o projeto gerado pelo ${aiTool}`);

  if (desc.match(/segurança|auth|token|rls|credenci/))
    steps.push("2. Audit de segurança: verificar exposição de tokens, RLS policies, autenticação");
  else
    steps.push("2. Review de código: qualidade, padrões e potenciais problemas");

  if (desc.match(/marca|brand|manual/))
    steps.push("3. Aplicar manual de marca Blue Health (cores, tipografia, logo)");
  else if (desc.match(/design|layout|responsiv/))
    steps.push("3. Ajustar design e responsividade conforme padrões BH");

  if (desc.match(/integra|api|webhook|supabase/))
    steps.push("4. Implementar integrações necessárias");

  if (desc.match(/deploy|publicar|produção/))
    steps.push(`${steps.length + 1}. Configurar deploy e ambiente de produção`);

  steps.push(`${steps.length + 1}. Testar, documentar e entregar`);

  return steps.join("\n");
}

function inferRisks(desc: string, type: ProjectType): string[] {
  const risks: string[] = [];
  if (desc.match(/api|token|key|credenci|senha/))
    risks.push("Possível exposição de credenciais no código gerado por IA");
  if (type === "chatbot" || type === "automacao")
    risks.push("Código gerado pode ter vulnerabilidades não detectadas");
  if (desc.match(/supabase|banco|dados/))
    risks.push("Verificar RLS policies — IA pode não ter configurado corretamente");
  if (desc.match(/deploy|produção/))
    risks.push("Garantir que env vars de produção não estão hardcoded");
  if (risks.length === 0)
    risks.push("Baixo risco — validação padrão recomendada");
  return risks;
}

function inferHours(complexity: "simples" | "moderada" | "complexa"): string {
  if (complexity === "simples") return "2–4 horas";
  if (complexity === "moderada") return "4–8 horas";
  return "8–16 horas";
}

function buildTriageNotes(
  input: TriageInput,
  complexity: "simples" | "moderada" | "complexa",
  urgency: Urgency,
): string {
  const tool = input.ai_tool;
  const type = input.project_type;
  let note = `Projeto tipo ${type} criado com ${tool}. Complexidade estimada: ${complexity}.`;
  if (urgency === "critica" || urgency === "alta") {
    note += " Prioridade elevada — atenção imediata recomendada.";
  }
  if (input.project_url) {
    note += " Link do projeto disponível para análise.";
  }
  return note;
}

export async function analyzeUpdate(
  update: SubmissionUpdate,
  submission: Submission,
  previousUpdates: SubmissionUpdate[],
): Promise<UpdateAnalysis> {
  await new Promise((r) => setTimeout(r, ANALYSIS_DELAY_MS));

  const msg = update.message.toLowerCase();
  const isFromTeam = update.author_role === "time";
  const sections: string[] = [];

  sections.push("**Análise da atualização:**\n");

  const observations = analyzeContent(msg, update, isFromTeam);
  if (observations.length > 0) {
    sections.push(observations.map((o) => `- ${o}`).join("\n"));
  }

  const impact = analyzeImpact(msg, submission, previousUpdates, isFromTeam);
  sections.push(`\n**Impacto:** ${impact}`);

  const risks = analyzeUpdateRisks(msg, submission);
  if (risks) {
    sections.push(`\n**Risco:** ${risks}`);
  }

  const suggestion = suggestNextStep(msg, submission, isFromTeam);
  sections.push(`\n**Sugestão:** ${suggestion}`);

  return { message: sections.join("\n") };
}

function analyzeContent(
  msg: string,
  update: SubmissionUpdate,
  isFromTeam: boolean,
): string[] {
  const obs: string[] = [];

  if (update.files.length > 0) {
    const fileDesc = update.files
      .map((f) => f.name)
      .join(", ");
    obs.push(`${update.files.length === 1 ? "Arquivo entregue" : "Arquivos entregues"}: ${fileDesc}`);
  }

  if (msg.match(/concluí|pronto|finaliz|terminei|entregue|feito/))
    obs.push(isFromTeam ? "Equipe indica conclusão de etapa" : "Solicitante indica que o trabalho está pronto");

  if (msg.match(/mudei|alterei|troquei|migr|substituí|agora usando/))
    obs.push("Mudança de abordagem ou ferramenta detectada");

  if (msg.match(/problema|erro|bug|não funciona|quebrou|falha|crash/))
    obs.push("Problema ou erro reportado — requer atenção");

  if (msg.match(/urgente|prazo|deadline|atrasado|pressão|pressa/))
    obs.push("Urgência mencionada — verificar se prioridade precisa ser atualizada");

  if (msg.match(/aprovado|aprovação|liberado|sinal verde|ok para/))
    obs.push("Aprovação ou sinal positivo mencionado");

  if (msg.match(/cancel|desist|não precis|descart/))
    obs.push("Possível cancelamento ou descarte do escopo");

  if (msg.match(/integra|api|webhook|connect|endpoint/))
    obs.push("Trabalho de integração mencionado");

  if (msg.match(/deploy|publicar|produção|no ar|vercel|netlify/))
    obs.push("Deploy ou publicação mencionada");

  if (msg.match(/segurança|auth|token|credenci|senha|rls/))
    obs.push("Questão de segurança mencionada — verificar antes de prosseguir");

  if (obs.length === 0) {
    obs.push(isFromTeam ? "Atualização de progresso pela equipe" : "Nova informação do solicitante");
  }

  return obs;
}

function analyzeImpact(
  msg: string,
  submission: Submission,
  previousUpdates: SubmissionUpdate[],
  isFromTeam: boolean,
): string {
  const updateCount = previousUpdates.filter(
    (u) => u.author_role !== "ia",
  ).length;

  if (msg.match(/cancel|desist|não precis|descart/))
    return "Alto — possível cancelamento do projeto. Confirmar com solicitante antes de qualquer ação.";

  if (msg.match(/mudei|alterei|troquei|migr|substituí/))
    return "Significativo — mudança de abordagem pode exigir reavaliação de escopo e estimativa de horas.";

  if (msg.match(/problema|erro|bug|não funciona|quebrou/))
    return "Negativo — novo problema identificado que pode atrasar a entrega.";

  if (msg.match(/concluí|pronto|finaliz|terminei|feito/) && isFromTeam)
    return `Positivo — etapa concluída pela equipe. ${submission.status === "em_analise" ? "Projeto pode estar pronto para aprovação." : ""}`;

  if (msg.match(/concluí|pronto|finaliz|terminei|feito/) && !isFromTeam)
    return "Positivo — solicitante indica progresso. Equipe deve validar o que foi entregue.";

  if (updateCount > 4)
    return `Neutro — ${updateCount + 1} atualizações neste projeto. Verificar se escopo está bem definido para evitar vai-e-volta.`;

  return "Progresso normal. Acompanhar evolução.";
}

function analyzeUpdateRisks(msg: string, submission: Submission): string | null {
  if (msg.match(/segurança|auth|token|credenci|senha/))
    return "Questão de segurança levantada — não avançar deploy sem review de segurança.";

  if (msg.match(/mudei|alterei|troquei/) && submission.complexity === "complexa")
    return "Mudança em projeto complexo pode gerar retrabalho significativo.";

  if (msg.match(/urgente|prazo|deadline|atrasado/) && submission.urgency !== "critica")
    return `Urgência mencionada mas prioridade atual é "${submission.urgency}". Considerar reclassificação.`;

  if (msg.match(/produção|deploy|no ar/) && msg.match(/token|key|env|credenci/))
    return "Menção a credenciais junto com deploy — verificar que nenhum segredo está hardcoded.";

  return null;
}

function suggestNextStep(
  msg: string,
  submission: Submission,
  isFromTeam: boolean,
): string {
  if (msg.match(/cancel|desist|não precis/))
    return "Confirmar com o solicitante se deseja cancelar. Se sim, mover para Recusado com justificativa.";

  if (msg.match(/problema|erro|bug|não funciona/))
    return "Priorizar correção do problema reportado antes de avançar o pipeline.";

  if (msg.match(/concluí|pronto|finaliz/) && isFromTeam) {
    if (submission.status === "em_analise") return "Solicitar aprovação do solicitante e mover para Aprovado.";
    if (submission.status === "aprovado") return "Validar entrega final e mover para Concluído.";
    return "Documentar o que foi feito e aguardar próximo passo no pipeline.";
  }

  if (msg.match(/concluí|pronto|finaliz/) && !isFromTeam)
    return "Equipe deve revisar a entrega do solicitante e postar feedback.";

  if (msg.match(/mudei|alterei|troquei/))
    return "Reavaliar estimativa de horas e escopo com base na nova abordagem.";

  if (!submission.assigned_to)
    return "Projeto ainda não atribuído — atribuir a um responsável para acompanhamento.";

  return isFromTeam
    ? "Aguardar retorno do solicitante sobre a última entrega."
    : "Equipe deve analisar a atualização e responder com próximos passos.";
}
