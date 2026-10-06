export type Urgency = "critica" | "alta" | "media" | "baixa";
export type Status = "novo" | "triagem" | "em_analise" | "aprovado" | "concluido" | "recusado";
export type ProjectType = "website" | "app" | "dashboard" | "automacao" | "chatbot";

export interface SubmissionFile {
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
}

export interface Submission {
  id: string;
  title: string;
  description: string;
  submitter_name: string;
  submitter_email: string;
  submitter_department: string;
  ai_tool: string;
  project_type: ProjectType;
  project_url: string | null;
  urgency: Urgency;
  status: Status;
  need: string;
  desire: string;
  created_at: string;
  updated_at: string;
  triage_notes: string | null;
  approach: string | null;
  assigned_to: string | null;
  complexity: "simples" | "moderada" | "complexa" | null;
  webhook_secret: string | null;
  mirror_repo_url: string | null;
  last_synced_at: string | null;
  pending_commits: number;
  files: SubmissionFile[];
}

export interface SubmissionUpdate {
  id: string;
  submission_id: string;
  author_name: string;
  author_role: "solicitante" | "time" | "ia" | "github";
  message: string;
  files: SubmissionFile[];
  created_at: string;
}

export const AI_TOOLS = [
  "ChatGPT",
  "Claude",
  "Gemini",
  "Copilot",
  "Lovable",
  "Bolt",
  "Cursor",
] as const;

export const PROJECT_TYPES: Record<ProjectType, string> = {
  website: "Website / Landing Page",
  app: "Aplicativo",
  dashboard: "Dashboard / Painel",
  automacao: "Automação",
  chatbot: "Chatbot / Assistente",
};

export const URGENCY_CONFIG: Record<Urgency, { label: string; color: string }> = {
  critica: { label: "Crítica", color: "bg-red-100 text-red-700" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700" },
  media: { label: "Média", color: "bg-yellow-100 text-yellow-700" },
  baixa: { label: "Baixa", color: "bg-green-100 text-green-700" },
};

export const STATUS_CONFIG: Record<Status, { label: string; color: string }> = {
  novo: { label: "Novo", color: "bg-blue-100 text-blue-700" },
  triagem: { label: "Em Triagem", color: "bg-purple-100 text-purple-700" },
  em_analise: { label: "Em Análise", color: "bg-yellow-100 text-yellow-700" },
  aprovado: { label: "Aprovado", color: "bg-green-100 text-green-700" },
  concluido: { label: "Concluído", color: "bg-emerald-100 text-emerald-700" },
  recusado: { label: "Recusado", color: "bg-red-100 text-red-700" },
};

export const PIPELINE_STAGES: Status[] = [
  "novo",
  "triagem",
  "em_analise",
  "aprovado",
  "concluido",
];

export const VALID_TRANSITIONS: Record<Status, { next: Status[]; label: Record<string, string> }> = {
  novo: {
    next: ["triagem"],
    label: { triagem: "Iniciar triagem" },
  },
  triagem: {
    next: ["em_analise", "recusado"],
    label: { em_analise: "Validar e encaminhar", recusado: "Recusar" },
  },
  em_analise: {
    next: ["aprovado", "recusado"],
    label: { aprovado: "Aprovar projeto", recusado: "Recusar" },
  },
  aprovado: {
    next: ["concluido"],
    label: { concluido: "Marcar como concluído" },
  },
  concluido: { next: [], label: {} },
  recusado: { next: ["triagem"], label: { triagem: "Reabrir" } },
};

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: "1",
    title: "Landing Page para campanha de implantes",
    description:
      "Criei uma landing page com o Lovable para a campanha de implantes da BU Hospitalar. Preciso de ajuda para revisar o código, ajustar responsividade e conectar ao formulário de leads do CRM.",
    submitter_name: "Giulia Martins",
    submitter_email: "giulia@bluehealth.com.br",
    submitter_department: "Marketing",
    ai_tool: "Lovable",
    project_type: "website",
    project_url: "https://lovable.dev/projects/abc123",
    urgency: "alta",
    status: "triagem",
    need: "Revisão de código + integração CRM",
    desire: "LP funcional conectada ao funil de vendas até semana que vem",
    created_at: "2026-10-04T14:30:00Z",
    updated_at: "2026-10-04T16:00:00Z",
    triage_notes: "LP está 80% pronta. Falta integração com webhook do CRM e ajuste de SEO meta tags.",
    approach: null,
    assigned_to: null,
    complexity: "moderada",
    webhook_secret: null,
    mirror_repo_url: null,
    last_synced_at: null,
    pending_commits: 0,
    files: [
      { name: "lp-implantes.zip", size: 2400000, type: "application/zip", path: "1/lp-implantes.zip", url: "#" },
    ],
  },
  {
    id: "2",
    title: "Chatbot de atendimento ao cliente WhatsApp",
    description:
      "Usei o ChatGPT para criar o fluxo de um chatbot de atendimento. Tenho o prompt e a lógica pronta, mas preciso de ajuda para implementar no WhatsApp Business API e conectar ao Supabase.",
    submitter_name: "Neto Oliveira",
    submitter_email: "neto@bluehealth.com.br",
    submitter_department: "Comercial",
    ai_tool: "ChatGPT",
    project_type: "chatbot",
    project_url: null,
    urgency: "media",
    status: "em_analise",
    need: "Implementação técnica do fluxo em produção",
    desire: "Automatizar 60% do atendimento inicial de leads",
    created_at: "2026-10-03T09:15:00Z",
    updated_at: "2026-10-04T11:00:00Z",
    triage_notes: "Fluxo conversacional bem estruturado. Precisa integrar com edge function da Cláudia.",
    approach: "Usar a edge function claudia-conversation existente como base e adaptar o fluxo.",
    assigned_to: "José Ronald",
    complexity: "complexa",
    webhook_secret: null,
    mirror_repo_url: null,
    last_synced_at: null,
    pending_commits: 0,
    files: [
      { name: "fluxo-chatbot.pdf", size: 1200000, type: "application/pdf", path: "2/fluxo-chatbot.pdf", url: "#" },
      { name: "prompts-chatgpt.txt", size: 45000, type: "text/plain", path: "2/prompts-chatgpt.txt", url: "#" },
    ],
  },
  {
    id: "3",
    title: "Dashboard de métricas de vendas por região",
    description:
      "Criei um dashboard com o Claude que puxa dados do nosso Supabase e mostra vendas por região, vendedor e período. Está funcionando local mas preciso de deploy e review de segurança.",
    submitter_name: "Higor Silva",
    submitter_email: "higor@bluehealth.com.br",
    submitter_department: "Diretoria",
    ai_tool: "Claude",
    project_type: "dashboard",
    project_url: "https://github.com/higorsilva-BH/dashboard-vendas",
    urgency: "media",
    status: "novo",
    need: "Deploy + review de segurança (RLS, tokens)",
    desire: "Painel acessível em TV na sala comercial",
    created_at: "2026-10-05T08:00:00Z",
    updated_at: "2026-10-05T08:00:00Z",
    triage_notes: null,
    approach: null,
    assigned_to: null,
    complexity: null,
    webhook_secret: "whsec_mock_abc123",
    mirror_repo_url: "https://github.com/higorsilva-BH/mirror-dashboard-vendas",
    last_synced_at: "2026-10-05T10:00:00Z",
    pending_commits: 3,
    files: [],
  },
  {
    id: "4",
    title: "Automação de propostas comerciais em PDF",
    description:
      "Usei o Cursor para criar um script que gera propostas em PDF automaticamente a partir dos dados do deal no CRM. Funciona mas o layout precisa de ajustes e queria que disparasse por webhook.",
    submitter_name: "Maiara Santos",
    submitter_email: "maiara@bluehealth.com.br",
    submitter_department: "Comercial",
    ai_tool: "Cursor",
    project_type: "automacao",
    project_url: null,
    urgency: "baixa",
    status: "aprovado",
    need: "Ajuste de layout PDF + webhook trigger",
    desire: "Gerar proposta automaticamente quando deal muda para estágio 'Proposta'",
    created_at: "2026-10-01T16:45:00Z",
    updated_at: "2026-10-04T10:30:00Z",
    triage_notes: "Script funcional. PDF está com fontes erradas e sem logo BH.",
    approach: "Corrigir template PDF com brand BH. Criar trigger no Supabase em deal_stage_history.",
    assigned_to: "José Ronald",
    complexity: "simples",
    webhook_secret: null,
    mirror_repo_url: null,
    last_synced_at: null,
    pending_commits: 0,
    files: [
      { name: "gerador-proposta.py", size: 18000, type: "text/x-python", path: "4/gerador-proposta.py", url: "#" },
    ],
  },
  {
    id: "5",
    title: "API de integração com sistema de estoque",
    description:
      "Tentei criar com o Gemini uma API REST que conecta nosso estoque no ERP com o CRM. A API retorna dados mas não consegui fazer a autenticação funcionar e tem problemas de CORS.",
    submitter_name: "Cristian Almeida",
    submitter_email: "cristian@bluehealth.com.br",
    submitter_department: "Operações",
    ai_tool: "Gemini",
    project_type: "automacao",
    project_url: null,
    urgency: "critica",
    status: "triagem",
    need: "Fix de autenticação + CORS + deploy seguro",
    desire: "Estoque do ERP visível dentro do CRM para o time comercial",
    created_at: "2026-10-04T11:20:00Z",
    updated_at: "2026-10-05T09:00:00Z",
    triage_notes: "Urgente — time comercial vendendo sem conferir estoque. API precisa de auth JWT e proxy reverso.",
    approach: null,
    assigned_to: null,
    complexity: "complexa",
    webhook_secret: null,
    mirror_repo_url: null,
    last_synced_at: null,
    pending_commits: 0,
    files: [],
  },
  {
    id: "6",
    title: "Site institucional com Bolt",
    description:
      "Criei o novo site institucional da Blue Health usando o Bolt. O site está bonito mas preciso garantir que está seguindo o manual de marca e preciso de ajuda com o deploy.",
    submitter_name: "Littiany Costa",
    submitter_email: "littiany@bluehealth.com.br",
    submitter_department: "Marketing",
    ai_tool: "Bolt",
    project_type: "website",
    project_url: "https://bolt.new/project/xyz789",
    urgency: "baixa",
    status: "concluido",
    need: "Validação de marca + deploy",
    desire: "Novo site no ar antes do evento de novembro",
    created_at: "2026-09-25T14:00:00Z",
    updated_at: "2026-10-03T17:00:00Z",
    triage_notes: "Site estava com cores fora do manual (verde genérico). Corrigido para paleta BH.",
    approach: "Aplicado brand skill, ajustado Montserrat + paleta. Deploy no Vercel.",
    assigned_to: "José Ronald",
    complexity: "simples",
    webhook_secret: null,
    mirror_repo_url: null,
    last_synced_at: null,
    pending_commits: 0,
    files: [
      { name: "site-bh-bolt.zip", size: 5600000, type: "application/zip", path: "6/site-bh-bolt.zip", url: "#" },
      { name: "screenshot-home.png", size: 340000, type: "image/png", path: "6/screenshot-home.png", url: "#" },
    ],
  },
];

export const MOCK_UPDATES: SubmissionUpdate[] = [
  {
    id: "u1",
    submission_id: "1",
    author_name: "Giulia Martins",
    author_role: "solicitante",
    message: "Atualizei o layout da LP, agora tá responsivo no mobile. Segue o zip novo.",
    files: [
      { name: "lp-implantes-v2.zip", size: 2800000, type: "application/zip", path: "1/lp-implantes-v2.zip", url: "#" },
    ],
    created_at: "2026-10-05T10:00:00Z",
  },
  {
    id: "u1-ai",
    submission_id: "1",
    author_name: "BlueAI",
    author_role: "ia",
    message: "**Análise da atualização:**\n\n- Arquivo entregue: lp-implantes-v2.zip (2.7 MB) — nova versão do projeto\n- Responsividade mobile mencionada como resolvida\n\n**Impacto:** Escopo parcialmente atendido. Layout mobile OK, mas integração com CRM (webhook de leads) segue pendente.\n\n**Próximo passo sugerido:** Equipe deve validar responsividade no dispositivo real e iniciar a integração do formulário.",
    files: [],
    created_at: "2026-10-05T10:00:05Z",
  },
  {
    id: "u2",
    submission_id: "1",
    author_name: "José Ronald",
    author_role: "time",
    message: "Revisamos o código. O layout tá bom, mas falta conectar o formulário de leads no webhook do CRM. Vou criar a edge function.",
    files: [],
    created_at: "2026-10-05T14:30:00Z",
  },
  {
    id: "u2-ai",
    submission_id: "1",
    author_name: "BlueAI",
    author_role: "ia",
    message: "**Análise da atualização:**\n\n- Equipe confirma qualidade do layout\n- Pendência técnica identificada: integração com webhook do CRM via edge function\n\n**Impacto:** Progresso positivo. Review de código concluído, restando apenas a integração — complexidade reduzida de moderada para simples neste ponto.\n\n**Risco:** Edge function precisa seguir padrão de autenticação do CRM (verificar tokens no header).",
    files: [],
    created_at: "2026-10-05T14:30:05Z",
  },
  {
    id: "u3",
    submission_id: "2",
    author_name: "Neto Oliveira",
    author_role: "solicitante",
    message: "Mudei a abordagem do chatbot. Agora estou usando Claude em vez de ChatGPT. Segue o novo fluxo.",
    files: [
      { name: "fluxo-chatbot-v2.pdf", size: 1500000, type: "application/pdf", path: "2/fluxo-chatbot-v2.pdf", url: "#" },
    ],
    created_at: "2026-10-05T11:00:00Z",
  },
  {
    id: "u4",
    submission_id: "3",
    author_name: "higorsilva-BH",
    author_role: "github",
    message: "**Push no GitHub** por higorsilva-BH em `main` (higorsilva-BH/dashboard-vendas)\n\n**3 commit(s):**\n- `a1b2c3d` feat: adicionar filtro por região no dashboard\n- `e4f5g6h` fix: corrigir query de vendas duplicando resultados\n- `i7j8k9l` style: ajustar cores pro manual de marca BH\n\nArquivos: +4 modificados: 7 removidos: 1",
    files: [],
    created_at: "2026-10-05T12:30:00Z",
  },
  {
    id: "u4-ai",
    submission_id: "3",
    author_name: "BlueAI",
    author_role: "ia",
    message: "**Análise da atualização:**\n\n- 3 commits no branch main — nova feature (filtro por região), bugfix (query duplicada) e ajuste visual\n- 12 arquivos impactados (+4 novos, 7 modificados, 1 removido)\n\n**Impacto:** Progresso significativo. O filtro por região é funcionalidade core do dashboard. Fix de query duplicada é crítico — dados incorretos poderiam causar decisões erradas.\n\n**Risco:** Ajuste de cores mencionado — verificar se está alinhado com a paleta oficial BH (#0D7AB5, #20DAFE, #2F3570). Query fix precisa de teste com volume real de dados.\n\n**Sugestão:** Equipe deve fazer review do diff antes de sincronizar o espelho. Priorizar validação da query fix com dados de produção.",
    files: [],
    created_at: "2026-10-05T12:30:05Z",
  },
  {
    id: "u3-ai",
    submission_id: "2",
    author_name: "BlueAI",
    author_role: "ia",
    message: "**Análise da atualização:**\n\n- Mudança de ferramenta: ChatGPT → Claude\n- Novo arquivo de fluxo entregue (v2)\n\n**Impacto:** Mudança significativa. O fluxo conversacional precisa ser reavaliado, pois Claude tem padrões de prompt diferentes do ChatGPT. A edge function claudia-conversation já usa Claude, o que pode facilitar a integração.\n\n**Risco:** Novo fluxo pode exigir retrabalho na implementação se a estrutura de prompts mudou muito.\n\n**Sugestão:** Reavaliar estimativa de horas e priorizar review do novo fluxo antes de continuar implementação.",
    files: [],
    created_at: "2026-10-05T11:00:05Z",
  },
];
