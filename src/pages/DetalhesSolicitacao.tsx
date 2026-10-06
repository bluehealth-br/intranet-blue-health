import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  User,
  Mail,
  Building2,
  BrainCircuit,
  Clock,
  Lightbulb,
  ShieldAlert,
  Wrench,
  Target,
  Paperclip,
  FileIcon,
  Download,
  UserPlus,
  MessageSquarePlus,
  CheckCircle2,
  XCircle,
  Upload,
  X,
  Send,
  MessagesSquare,
  Loader2,
  GitBranch,
  GitFork,
  Copy,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import {
  STATUS_CONFIG,
  URGENCY_CONFIG,
  PROJECT_TYPES,
  VALID_TRANSITIONS,
  PIPELINE_STAGES,
} from "@/lib/mock-data";
import { useSubmissions } from "@/lib/store";
import { formatDateTimeBR, timeAgo } from "@/lib/helpers";
import { formatFileSize, validateFiles, uploadFiles } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { SubmissionUpdate } from "@/lib/mock-data";

function renderMarkdownLight(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function DetalhesSolicitacao() {
  const { id } = useParams<{ id: string }>();
  const sub = useSubmissions((s) => s.submissions.find((x) => x.id === id));
  const updateStatus = useSubmissions((s) => s.updateStatus);
  const assignTo = useSubmissions((s) => s.assignTo);
  const addNote = useSubmissions((s) => s.addNote);
  const addUpdate = useSubmissions((s) => s.addUpdate);
  const enableWebhook = useSubmissions((s) => s.enableWebhook);
  const disableWebhook = useSubmissions((s) => s.disableWebhook);
  const createMirror = useSubmissions((s) => s.createMirror);
  const syncMirror = useSubmissions((s) => s.syncMirror);
  const allUpdates = useSubmissions((s) => s.updates);
  const updates = allUpdates.filter((u) => u.submission_id === id);
  const analyzingUpdateFor = useSubmissions((s) => s.analyzingUpdateFor);
  const isAnalyzing = analyzingUpdateFor === id;

  const [showAssign, setShowAssign] = useState(false);
  const [assignName, setAssignName] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState("");

  const [updateMsg, setUpdateMsg] = useState("");
  const [updateRole, setUpdateRole] = useState<"solicitante" | "time">("time");
  const [updateFiles, setUpdateFiles] = useState<File[]>([]);
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const updateFileRef = useRef<HTMLInputElement>(null);
  const [webhookCopied, setWebhookCopied] = useState<"url" | "secret" | null>(null);
  const [togglingWebhook, setTogglingWebhook] = useState(false);
  const [creatingMirror, setCreatingMirror] = useState(false);
  const [syncing, setSyncing] = useState(false);

  if (!sub) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="text-center">
          <p className="text-lg font-black text-[#2F3570]">Solicitação não encontrada</p>
          <Link to="/solicitacoes" className="mt-2 text-sm text-[#0D7AB5] hover:underline">
            Voltar para solicitações
          </Link>
        </div>
      </div>
    );
  }

  const transitions = VALID_TRANSITIONS[sub.status];
  const currentIdx = PIPELINE_STAGES.indexOf(sub.status);

  async function handleAssign() {
    if (!assignName.trim() || !id) return;
    await assignTo(id, assignName.trim());
    setAssignName("");
    setShowAssign(false);
  }

  async function handleNote() {
    if (!noteText.trim() || !id) return;
    await addNote(id, noteText.trim());
    setNoteText("");
    setShowNote(false);
  }

  async function handleSendUpdate() {
    if (!updateMsg.trim() || !id || !sub) return;
    setSendingUpdate(true);

    const updateId = crypto.randomUUID();
    const { uploaded } = updateFiles.length > 0
      ? await uploadFiles(updateFiles, `${id}/updates/${updateId}`)
      : { uploaded: [] };

    const update: SubmissionUpdate = {
      id: updateId,
      submission_id: id,
      author_name: updateRole === "time" ? "Equipe BlueAI" : sub.submitter_name,
      author_role: updateRole,
      message: updateMsg.trim(),
      files: uploaded,
      created_at: new Date().toISOString(),
    };

    await addUpdate(update);
    setUpdateMsg("");
    setUpdateFiles([]);
    setSendingUpdate(false);
  }

  function handleUpdateFiles(fileList: FileList | File[]) {
    const { valid } = validateFiles(Array.from(fileList));
    setUpdateFiles((prev) => [...prev, ...valid]);
  }

  async function handleToggleWebhook() {
    if (!id) return;
    setTogglingWebhook(true);
    try {
      if (sub.webhook_secret) {
        await disableWebhook(id);
      } else {
        await enableWebhook(id);
      }
    } finally {
      setTogglingWebhook(false);
    }
  }

  function copyToClipboard(text: string, type: "url" | "secret") {
    navigator.clipboard.writeText(text);
    setWebhookCopied(type);
    setTimeout(() => setWebhookCopied(null), 2000);
  }

  async function handleCreateMirror() {
    if (!id) return;
    setCreatingMirror(true);
    try {
      await createMirror(id);
    } finally {
      setCreatingMirror(false);
    }
  }

  async function handleSync() {
    if (!id) return;
    setSyncing(true);
    try {
      await syncMirror(id);
    } finally {
      setSyncing(false);
    }
  }

  const webhookUrl = sub.webhook_secret
    ? `${import.meta.env.VITE_SUPABASE_URL ?? "https://<seu-projeto>.supabase.co"}/functions/v1/github-webhook?submission_id=${sub.id}`
    : null;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <Link
          to="/triagem"
          className="mb-3 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.5} /> Voltar à esteira
        </Link>
        <h1 className="text-xl font-black uppercase tracking-tight">{sub.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CONFIG[sub.status].color}`}>
            {STATUS_CONFIG[sub.status].label}
          </span>
          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_CONFIG[sub.urgency].color}`}>
            {URGENCY_CONFIG[sub.urgency].label}
          </span>
          <Badge className="bg-white/20 text-xs text-white hover:bg-white/20">
            {sub.ai_tool}
          </Badge>
          <span className="text-xs text-white/80">{PROJECT_TYPES[sub.project_type]}</span>
        </div>
      </div>

      {/* Pipeline progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-1">
            {PIPELINE_STAGES.map((stage, i) => {
              const cfg = STATUS_CONFIG[stage];
              const isCurrent = sub.status === stage;
              const isPast = currentIdx >= 0 && i < currentIdx;
              const isRecusado = sub.status === "recusado";
              return (
                <div key={stage} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      "flex h-8 flex-1 items-center justify-center rounded-md text-[10px] font-medium transition-all",
                      isCurrent && "ring-2 ring-[#0D7AB5] ring-offset-1",
                      isPast && !isRecusado && "bg-green-100 text-green-700",
                      isCurrent && !isRecusado && cfg.color,
                      !isPast && !isCurrent && "bg-[#F0F0F0] text-muted-foreground",
                      isRecusado && isCurrent && "bg-red-100 text-red-700",
                    )}
                  >
                    {isPast && !isRecusado ? (
                      <CheckCircle2 className="mr-1 h-3 w-3" strokeWidth={1.5} />
                    ) : null}
                    <span className="hidden sm:inline">{cfg.label}</span>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight
                      className={cn(
                        "mx-0.5 h-3 w-3 shrink-0",
                        isPast && !isRecusado ? "text-green-400" : "text-border",
                      )}
                      strokeWidth={1.5}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {sub.status === "recusado" && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
              <XCircle className="h-3 w-3" strokeWidth={1.5} />
              Esta solicitação foi recusada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions bar */}
      <Card className="border-[#0D7AB5]/20 bg-[#0D7AB5]/5">
        <CardContent className="p-4">
          <p className="mb-3 text-xs font-black uppercase text-[#0D7AB5]">Ações</p>
          <div className="flex flex-wrap gap-2">
            {transitions.next.map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => void updateStatus(sub.id, nextStatus)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition-all",
                  nextStatus === "recusado"
                    ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
                    : "bg-gradient-to-r from-[#0D7AB5] to-[#20DAFE] text-white shadow-md hover:opacity-90",
                )}
              >
                {transitions.label[nextStatus]}
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            ))}
            <button
              onClick={() => setShowAssign(!showAssign)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-[#2F3570] hover:bg-[#F0F0F0]"
            >
              <UserPlus className="h-3 w-3" strokeWidth={1.5} />
              Atribuir
            </button>
            <button
              onClick={() => setShowNote(!showNote)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-4 py-2 text-xs font-medium text-[#2F3570] hover:bg-[#F0F0F0]"
            >
              <MessageSquarePlus className="h-3 w-3" strokeWidth={1.5} />
              Adicionar nota
            </button>
          </div>

          {showAssign && (
            <div className="mt-3 flex gap-2">
              <input
                autoFocus
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                placeholder="Nome do responsável"
                onKeyDown={(e) => e.key === "Enter" && handleAssign()}
                className="h-8 flex-1 rounded-lg border border-border px-3 text-xs outline-none focus:border-[#0D7AB5] focus:ring-1 focus:ring-[#0D7AB5]"
              />
              <button
                onClick={handleAssign}
                disabled={!assignName.trim()}
                className="rounded-lg bg-[#0D7AB5] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Atribuir
              </button>
            </div>
          )}

          {showNote && (
            <div className="mt-3 space-y-2">
              <textarea
                autoFocus
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Escreva uma observação..."
                className="w-full rounded-lg border border-border px-3 py-2 text-xs outline-none focus:border-[#0D7AB5] focus:ring-1 focus:ring-[#0D7AB5]"
              />
              <button
                onClick={handleNote}
                disabled={!noteText.trim()}
                className="rounded-lg bg-[#0D7AB5] px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                Salvar nota
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-black text-[#2F3570]">Descrição do projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#2F3570]">
                {sub.description}
              </p>
              {sub.project_url && (
                <a
                  href={sub.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#0D7AB5]/10 px-3 py-1.5 text-xs font-medium text-[#0D7AB5] hover:bg-[#0D7AB5]/20"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  Abrir projeto
                </a>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          {sub.files.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black text-[#2F3570]">
                  <Paperclip className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                  Arquivos ({sub.files.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sub.files.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg bg-[#F0F0F0] px-3 py-2">
                      <FileIcon className="h-4 w-4 shrink-0 text-[#0D7AB5]" strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[#2F3570]">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-muted-foreground transition-colors hover:bg-[#0D7AB5]/10 hover:text-[#0D7AB5]"
                      >
                        <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI triage */}
          {sub.triage_notes && (
            <Card className="border-[#0D7AB5]/20 bg-[#0D7AB5]/5">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-black text-[#0D7AB5]">
                  <BrainCircuit className="h-4 w-4" strokeWidth={1.5} />
                  Análise da IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#2F3570]">
                    <Lightbulb className="h-3 w-3 text-[#0D7AB5]" strokeWidth={1.5} />
                    Necessidade
                  </div>
                  <p className="text-sm text-[#2F3570]">{sub.need}</p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#2F3570]">
                    <Target className="h-3 w-3 text-[#0D7AB5]" strokeWidth={1.5} />
                    Anseio
                  </div>
                  <p className="text-sm text-[#2F3570]">{sub.desire}</p>
                </div>
                {sub.approach && (
                  <div>
                    <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#2F3570]">
                      <Wrench className="h-3 w-3 text-[#0D7AB5]" strokeWidth={1.5} />
                      Como fazer
                    </div>
                    <p className="whitespace-pre-line text-sm text-[#2F3570]">{sub.approach}</p>
                  </div>
                )}
                <div className="rounded-lg bg-white p-3">
                  <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#2F3570]">
                    <ShieldAlert className="h-3 w-3 text-orange-500" strokeWidth={1.5} />
                    Notas da triagem
                  </div>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{sub.triage_notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline de atualizações */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-black text-[#2F3570]">
                <MessagesSquare className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                Atualizações
                {updates.length > 0 && (
                  <span className="text-xs font-medium text-muted-foreground">({updates.length})</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulário de nova atualização */}
              <div className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setUpdateRole("time")}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      updateRole === "time"
                        ? "bg-[#0D7AB5] text-white"
                        : "bg-[#F0F0F0] text-[#2F3570] hover:bg-[#0D7AB5]/10",
                    )}
                  >
                    Equipe
                  </button>
                  <button
                    onClick={() => setUpdateRole("solicitante")}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      updateRole === "solicitante"
                        ? "bg-[#2F3570] text-white"
                        : "bg-[#F0F0F0] text-[#2F3570] hover:bg-[#2F3570]/10",
                    )}
                  >
                    Solicitante
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={updateMsg}
                  onChange={(e) => setUpdateMsg(e.target.value)}
                  placeholder={
                    updateRole === "time"
                      ? "Escreva uma resposta ou entrega para o solicitante..."
                      : "Descreva a atualização do projeto..."
                  }
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-1 focus:ring-[#0D7AB5]"
                />

                {updateFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {updateFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-md bg-[#F0F0F0] px-2.5 py-1.5">
                        <FileIcon className="h-3.5 w-3.5 shrink-0 text-[#0D7AB5]" strokeWidth={1.5} />
                        <span className="min-w-0 flex-1 truncate text-xs text-[#2F3570]">{file.name}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
                        <button
                          onClick={() => setUpdateFiles((f) => f.filter((_, idx) => idx !== i))}
                          className="shrink-0 rounded p-0.5 text-muted-foreground hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3 w-3" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => updateFileRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-[#2F3570] hover:bg-[#F0F0F0]"
                  >
                    <Upload className="h-3 w-3" strokeWidth={1.5} />
                    Anexar arquivo
                  </button>
                  <input
                    ref={updateFileRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleUpdateFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => void handleSendUpdate()}
                    disabled={!updateMsg.trim() || sendingUpdate}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-black text-white transition-all",
                      updateMsg.trim() && !sendingUpdate
                        ? "bg-gradient-to-r from-[#0D7AB5] to-[#20DAFE] hover:opacity-90"
                        : "cursor-not-allowed bg-gray-300",
                    )}
                  >
                    {sendingUpdate ? "Enviando..." : "Enviar"}
                    <Send className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Timeline */}
              {updates.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Nenhuma atualização ainda. Use o formulário acima para postar.
                </p>
              ) : (
                <div className="relative space-y-4 pl-6 before:absolute before:left-[9px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
                  {updates.map((u) => (
                    <div key={u.id} className="relative">
                      {u.author_role === "ia" ? (
                        <div className="absolute -left-6 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#7C3AED] to-[#0D7AB5]">
                          <BrainCircuit className="h-2.5 w-2.5 text-white" strokeWidth={2} />
                        </div>
                      ) : u.author_role === "github" ? (
                        <div className="absolute -left-6 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-[#24292f]">
                          <GitBranch className="h-2.5 w-2.5 text-white" strokeWidth={2} />
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "absolute -left-6 top-1.5 h-[18px] w-[18px] rounded-full border-2 border-white",
                            u.author_role === "time" ? "bg-[#0D7AB5]" : "bg-[#2F3570]",
                          )}
                        />
                      )}
                      <div
                        className={cn(
                          "rounded-lg border p-3",
                          u.author_role === "ia"
                            ? "border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/5 to-[#0D7AB5]/5"
                            : u.author_role === "github"
                              ? "border-[#24292f]/20 bg-[#24292f]/5"
                              : "border-border",
                        )}
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          {u.author_role === "ia" && (
                            <BrainCircuit className="h-3 w-3 text-[#7C3AED]" strokeWidth={1.5} />
                          )}
                          {u.author_role === "github" && (
                            <GitBranch className="h-3 w-3 text-[#24292f]" strokeWidth={1.5} />
                          )}
                          <span className={cn(
                            "text-xs font-black",
                            u.author_role === "ia" ? "text-[#7C3AED]"
                              : u.author_role === "github" ? "text-[#24292f]"
                              : "text-[#2F3570]",
                          )}>
                            {u.author_name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-medium",
                              u.author_role === "time"
                                ? "bg-[#0D7AB5]/10 text-[#0D7AB5]"
                                : u.author_role === "ia"
                                  ? "bg-[#7C3AED]/10 text-[#7C3AED]"
                                  : u.author_role === "github"
                                    ? "bg-[#24292f]/10 text-[#24292f]"
                                    : "bg-[#2F3570]/10 text-[#2F3570]",
                            )}
                          >
                            {u.author_role === "time" ? "Equipe" : u.author_role === "ia" ? "IA" : u.author_role === "github" ? "GitHub" : "Solicitante"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{timeAgo(u.created_at)}</span>
                        </div>
                        <div className={cn(
                          "whitespace-pre-line text-sm",
                          u.author_role === "ia"
                            ? "text-[#2F3570] [&_strong]:font-black [&_strong]:text-[#7C3AED]"
                            : u.author_role === "github"
                              ? "text-[#2F3570] [&_strong]:font-black [&_strong]:text-[#24292f] font-mono text-xs"
                              : "text-[#2F3570]",
                        )}>
                          {u.author_role === "ia" || u.author_role === "github" ? renderMarkdownLight(u.message) : u.message}
                        </div>
                        {u.author_role === "github" && sub.pending_commits > 0 && (
                          <div className="mt-2 flex gap-2">
                            <button
                              onClick={() => void handleSync()}
                              disabled={syncing}
                              className="flex items-center gap-1 rounded-md bg-[#0D7AB5] px-2.5 py-1 text-[10px] font-black text-white hover:opacity-90 disabled:opacity-50"
                            >
                              <RefreshCw className={cn("h-2.5 w-2.5", syncing && "animate-spin")} strokeWidth={2} />
                              Sincronizar espelho
                            </button>
                          </div>
                        )}
                        {u.files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {u.files.map((file, i) => (
                              <div key={i} className="flex items-center gap-2 rounded-md bg-[#F0F0F0] px-2.5 py-1.5">
                                <FileIcon className="h-3.5 w-3.5 shrink-0 text-[#0D7AB5]" strokeWidth={1.5} />
                                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#2F3570]">{file.name}</span>
                                <span className="shrink-0 text-[10px] text-muted-foreground">{formatFileSize(file.size)}</span>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-[#0D7AB5]"
                                >
                                  <Download className="h-3 w-3" strokeWidth={1.5} />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isAnalyzing && (
                    <div className="relative">
                      <div className="absolute -left-6 top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#7C3AED] to-[#0D7AB5]">
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-white" strokeWidth={2} />
                      </div>
                      <div className="rounded-lg border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/5 to-[#0D7AB5]/5 p-3">
                        <div className="flex items-center gap-2">
                          <BrainCircuit className="h-3 w-3 animate-pulse text-[#7C3AED]" strokeWidth={1.5} />
                          <span className="text-xs font-black text-[#7C3AED]">BlueAI</span>
                          <span className="text-[10px] text-muted-foreground">analisando atualização...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-[#2F3570]">Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-[#2F3570]">
                <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                {sub.submitter_name}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                {sub.submitter_email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                {sub.submitter_department}
              </div>
            </CardContent>
          </Card>

          {/* Repositório Espelho */}
          {sub.project_url && sub.project_url.includes("github.com") && (
            <Card className="border-[#24292f]/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-black text-[#24292f]">
                  <GitFork className="h-4 w-4" strokeWidth={1.5} />
                  Repositório Espelho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Repo original */}
                <div className="space-y-1">
                  <label className="text-[10px] font-medium uppercase text-muted-foreground">Repo original</label>
                  <a
                    href={sub.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 truncate rounded-md bg-[#F0F0F0] px-2 py-1.5 font-mono text-[10px] text-[#0D7AB5] hover:bg-[#0D7AB5]/10"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                    {sub.project_url.replace("https://github.com/", "")}
                  </a>
                </div>

                {sub.mirror_repo_url ? (
                  <>
                    {/* Repo espelho */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-medium uppercase text-muted-foreground">Espelho BH</label>
                      <a
                        href={sub.mirror_repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 truncate rounded-md bg-[#F0F0F0] px-2 py-1.5 font-mono text-[10px] text-[#0D7AB5] hover:bg-[#0D7AB5]/10"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" strokeWidth={1.5} />
                        {sub.mirror_repo_url.replace("https://github.com/", "")}
                      </a>
                    </div>

                    {/* Status do espelho */}
                    <div className="rounded-md border border-border p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Último sync</span>
                        <span className="text-[10px] font-medium text-[#2F3570]">
                          {sub.last_synced_at ? timeAgo(sub.last_synced_at) : "Nunca"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Commits pendentes</span>
                        {sub.pending_commits > 0 ? (
                          <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                            <AlertCircle className="h-2.5 w-2.5" strokeWidth={2} />
                            {sub.pending_commits}
                          </span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                            Em dia
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão sincronizar */}
                    {sub.pending_commits > 0 && (
                      <button
                        onClick={() => void handleSync()}
                        disabled={syncing}
                        className={cn(
                          "flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black text-white transition-all",
                          syncing
                            ? "cursor-not-allowed bg-gray-300"
                            : "bg-gradient-to-r from-[#0D7AB5] to-[#20DAFE] hover:opacity-90",
                        )}
                      >
                        <RefreshCw className={cn("h-3 w-3", syncing && "animate-spin")} strokeWidth={1.5} />
                        {syncing ? "Sincronizando..." : `Sincronizar espelho (${sub.pending_commits} commits)`}
                      </button>
                    )}

                    {/* Ver diff */}
                    {sub.pending_commits > 0 && (
                      <a
                        href={`${sub.project_url}/compare/main...main`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#24292f]/20 px-3 py-2 text-xs font-medium text-[#24292f] hover:bg-[#24292f]/5"
                      >
                        <GitBranch className="h-3 w-3" strokeWidth={1.5} />
                        Ver diff no GitHub
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-[10px] leading-relaxed text-muted-foreground">
                      Crie um espelho na org Blue Health pra acompanhar as alterações sem modificar o repo original.
                    </p>
                    <button
                      onClick={() => void handleCreateMirror()}
                      disabled={creatingMirror}
                      className={cn(
                        "flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black text-white transition-all",
                        creatingMirror
                          ? "cursor-not-allowed bg-gray-300"
                          : "bg-[#24292f] hover:bg-[#24292f]/90",
                      )}
                    >
                      <GitFork className={cn("h-3 w-3", creatingMirror && "animate-spin")} strokeWidth={1.5} />
                      {creatingMirror ? "Criando espelho..." : "Criar repositório espelho"}
                    </button>
                  </>
                )}

                {/* Webhook config (colapsável) */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium uppercase text-muted-foreground">Webhook automático</span>
                    <button
                      onClick={() => void handleToggleWebhook()}
                      disabled={togglingWebhook}
                      className="disabled:opacity-50"
                    >
                      {sub.webhook_secret ? (
                        <ToggleRight className="h-5 w-5 text-green-600" strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                  {sub.webhook_secret && webhookUrl && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-1">
                        <div className="flex-1 truncate rounded-md bg-[#F0F0F0] px-2 py-1 font-mono text-[9px] text-[#2F3570]">
                          {webhookUrl}
                        </div>
                        <button
                          onClick={() => copyToClipboard(webhookUrl, "url")}
                          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-[#0D7AB5]"
                        >
                          {webhookCopied === "url" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" strokeWidth={1.5} />
                          ) : (
                            <Copy className="h-3 w-3" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex-1 truncate rounded-md bg-[#F0F0F0] px-2 py-1 font-mono text-[9px] text-[#2F3570]">
                          Secret: {sub.webhook_secret.slice(0, 10)}...
                        </div>
                        <button
                          onClick={() => copyToClipboard(sub.webhook_secret!, "secret")}
                          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-[#0D7AB5]"
                        >
                          {webhookCopied === "secret" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" strokeWidth={1.5} />
                          ) : (
                            <Copy className="h-3 w-3" strokeWidth={1.5} />
                          )}
                        </button>
                      </div>
                      <p className="text-[9px] text-muted-foreground">
                        Configure em Settings → Webhooks no repo original. Content type: application/json, evento: push.
                      </p>
                    </div>
                  )}
                  {!sub.webhook_secret && (
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      Ative pra receber pushes automaticamente na timeline.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-black text-[#2F3570]">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Complexidade</span>
                <span className="font-medium capitalize text-[#2F3570]">
                  {sub.complexity || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Responsável</span>
                <span className="font-medium text-[#0D7AB5]">
                  {sub.assigned_to || "Não atribuído"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Criado em</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  {formatDateTimeBR(sub.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Atualizado</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" strokeWidth={1.5} />
                  {formatDateTimeBR(sub.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
