import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BrainCircuit,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Lightbulb,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileIcon,
  X,
  Paperclip,
  User,
  FolderOpen,
  HelpCircle,
} from "lucide-react";
import { AI_TOOLS, PROJECT_TYPES, URGENCY_CONFIG, type ProjectType, type Submission } from "@/lib/mock-data";
import { runAiTriage, type TriageInput, type TriageResult } from "@/lib/ai-triage";
import { validateFiles, formatFileSize, uploadFiles, type UploadedFile } from "@/lib/storage";
import { useSubmissions } from "@/lib/store";
import { cn } from "@/lib/utils";

type Phase = "wizard" | "analyzing" | "result";

const STEPS = [
  { key: "dados", label: "Seus dados", icon: User },
  { key: "projeto", label: "Projeto", icon: FolderOpen },
  { key: "arquivos", label: "Arquivos", icon: Upload },
  { key: "necessidade", label: "Necessidade", icon: HelpCircle },
] as const;

const ANALYSIS_MESSAGES = [
  "Analisando descrição do projeto...",
  "Classificando urgência e complexidade...",
  "Identificando necessidades técnicas...",
  "Enviando arquivos para a cloud...",
  "Avaliando riscos potenciais...",
  "Definindo abordagem recomendada...",
  "Gerando relatório de triagem...",
];

export default function NovaSolicitacao() {
  const addSubmission = useSubmissions((s) => s.addSubmission);
  const [phase, setPhase] = useState<Phase>("wizard");
  const [stepIdx, setStepIdx] = useState(0);
  const [analysisMsg, setAnalysisMsg] = useState(0);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    title: "",
    description: "",
    ai_tool: "",
    project_type: "website" as ProjectType,
    project_url: "",
    what_needs: "",
    deadline: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const currentStep = STEPS[stepIdx].key;

  function canAdvance(): boolean {
    switch (currentStep) {
      case "dados":
        return Boolean(form.name && form.email && form.department);
      case "projeto":
        return Boolean(form.title && form.description && form.ai_tool && form.project_type);
      case "arquivos":
        return true;
      case "necessidade":
        return Boolean(form.what_needs);
      default:
        return false;
    }
  }

  function goNext() {
    if (stepIdx < STEPS.length - 1) {
      setDirection("next");
      setStepIdx((i) => i + 1);
    }
  }

  function goBack() {
    if (stepIdx > 0) {
      setDirection("prev");
      setStepIdx((i) => i - 1);
    }
  }

  function handleFiles(newFiles: FileList | File[]) {
    const arr = Array.from(newFiles);
    const { valid, errors } = validateFiles(arr);
    if (errors.length > 0) setFileErrors(errors);
    setFiles((prev) => [...prev, ...valid]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileErrors([]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }

  async function handleSubmit() {
    if (!canAdvance()) return;

    setPhase("analyzing");
    setAnalysisMsg(0);

    const interval = setInterval(() => {
      setAnalysisMsg((prev) => {
        if (prev >= ANALYSIS_MESSAGES.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 550);

    const submissionId = crypto.randomUUID();

    const [triageResult, uploadResult] = await Promise.all([
      runAiTriage({
        title: form.title,
        description: form.description,
        ai_tool: form.ai_tool,
        project_type: form.project_type,
        project_url: form.project_url,
        what_needs: form.what_needs,
        deadline: form.deadline,
      } satisfies TriageInput),
      files.length > 0 ? uploadFiles(files, submissionId) : { uploaded: [], errors: [] },
    ]);

    clearInterval(interval);
    setResult(triageResult);
    setUploadedFiles(uploadResult.uploaded);
    if (uploadResult.errors.length > 0) {
      setFileErrors(uploadResult.errors);
    }

    const now = new Date().toISOString();
    const newSubmission: Submission = {
      id: submissionId,
      title: form.title,
      description: form.description,
      submitter_name: form.name,
      submitter_email: form.email,
      submitter_department: form.department,
      ai_tool: form.ai_tool,
      project_type: form.project_type,
      project_url: form.project_url || null,
      urgency: triageResult.urgency,
      status: "triagem",
      need: triageResult.need_summary,
      desire: triageResult.desire_summary,
      created_at: now,
      updated_at: now,
      triage_notes: triageResult.triage_notes,
      approach: triageResult.approach,
      assigned_to: null,
      complexity: triageResult.complexity,
      files: uploadResult.uploaded,
    };
    await addSubmission(newSubmission);

    setPhase("result");
  }

  function resetAll() {
    setPhase("wizard");
    setStepIdx(0);
    setResult(null);
    setUploadedFiles([]);
    setFiles([]);
    setFileErrors([]);
    setForm({
      name: "",
      email: "",
      department: "",
      title: "",
      description: "",
      ai_tool: "",
      project_type: "website",
      project_url: "",
      what_needs: "",
      deadline: "",
    });
  }

  // ─── Analyzing ───
  if (phase === "analyzing") {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE]">
            <BrainCircuit className="h-10 w-10 animate-pulse text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-black text-[#2F3570]">IA analisando seu projeto</h2>
          <p className="mt-2 text-sm font-light text-muted-foreground">
            Aguarde enquanto classificamos sua solicitação
          </p>
          <div className="mt-8 space-y-3">
            {ANALYSIS_MESSAGES.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition-all duration-500",
                  i < analysisMsg
                    ? "bg-green-50 text-green-700"
                    : i === analysisMsg
                      ? "bg-[#0D7AB5]/10 text-[#0D7AB5] font-medium"
                      : "text-muted-foreground/40",
                )}
              >
                {i < analysisMsg ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                ) : i === analysisMsg ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" strokeWidth={1.5} />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border border-current" />
                )}
                {msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Result ───
  if (phase === "result" && result) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Triagem Concluída</h1>
              <p className="font-light text-white/80">
                A IA analisou seu projeto "{form.title}"
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-light text-muted-foreground">Urgência</p>
              <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${URGENCY_CONFIG[result.urgency].color}`}>
                {URGENCY_CONFIG[result.urgency].label}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-light text-muted-foreground">Complexidade</p>
              <p className="mt-1 text-sm font-black capitalize text-[#2F3570]">{result.complexity}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xs font-light text-muted-foreground">Estimativa</p>
              <p className="mt-1 text-sm font-black text-[#2F3570]">
                <Clock className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.5} />
                {result.estimated_hours}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-[#2F3570]">
                <Lightbulb className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                Necessidade identificada
              </h3>
              <p className="mt-2 text-sm text-[#2F3570]">{result.need_summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-[#2F3570]">
                <ArrowRight className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                Anseio / Objetivo
              </h3>
              <p className="mt-2 text-sm text-[#2F3570]">{result.desire_summary}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#2F3570]">
              <BrainCircuit className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
              Abordagem recomendada
            </h3>
            <div className="mt-2 space-y-2">
              {result.approach.split("\n").map((line, i) => (
                <p key={i} className="text-sm text-[#2F3570]">{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="flex items-center gap-2 text-sm font-black text-[#2F3570]">
              <ShieldAlert className="h-4 w-4 text-orange-500" strokeWidth={1.5} />
              Riscos identificados
            </h3>
            <ul className="mt-2 space-y-2">
              {result.risks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#2F3570]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" strokeWidth={1.5} />
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {uploadedFiles.length > 0 && (
          <Card>
            <CardContent className="p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-[#2F3570]">
                <Paperclip className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
                Arquivos enviados ({uploadedFiles.length})
              </h3>
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-[#F0F0F0] px-3 py-2">
                    <FileIcon className="h-4 w-4 shrink-0 text-[#0D7AB5]" strokeWidth={1.5} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#2F3570]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <button
            onClick={resetAll}
            className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-[#2F3570] transition-colors hover:bg-[#F0F0F0]"
          >
            Nova solicitação
          </button>
          <button className="rounded-lg bg-gradient-to-r from-[#0D7AB5] to-[#20DAFE] px-6 py-2.5 text-sm font-black text-white transition-opacity hover:opacity-90">
            Enviar para equipe
          </button>
        </div>
      </div>
    );
  }

  // ─── Wizard ───
  const isLast = stepIdx === STEPS.length - 1;
  const isFirst = stepIdx === 0;

  return (
    <div className="flex min-h-[calc(100vh-2rem)] flex-col p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Nova Solicitação</h1>
        <p className="font-light text-white/80">
          Envie seu projeto criado com IA para análise automática
        </p>
      </div>

      {/* Stepper */}
      <div className="mt-6 flex items-center justify-center gap-1">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <div key={s.key} className="flex items-center">
              <button
                type="button"
                onClick={() => {
                  if (i < stepIdx) {
                    setDirection("prev");
                    setStepIdx(i);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  done && "cursor-pointer bg-green-100 text-green-700 hover:bg-green-200",
                  active && "bg-[#0D7AB5] text-white shadow-md",
                  !done && !active && "bg-[#F0F0F0] text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                ) : (
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "mx-1 h-px w-6 transition-colors",
                  i < stepIdx ? "bg-green-300" : "bg-border",
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="mx-auto mt-6 w-full max-w-lg flex-1">
        <div
          key={currentStep}
          className={direction === "next" ? "step-enter-next" : "step-enter-prev"}
        >
          {currentStep === "dados" && (
            <Card className="border-0 shadow-lg">
              <CardContent className="space-y-5 p-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7AB5]/10">
                    <User className="h-6 w-6 text-[#0D7AB5]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-black text-[#2F3570]">Sobre você</h2>
                  <p className="mt-1 text-sm font-light text-muted-foreground">
                    Precisamos saber quem está enviando o projeto
                  </p>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Seu nome completo</span>
                  <input
                    autoFocus
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">E-mail corporativo</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="nome@bluehealth.com.br"
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Departamento</span>
                  <input
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    placeholder="Ex: Marketing, Comercial, TI..."
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>
              </CardContent>
            </Card>
          )}

          {currentStep === "projeto" && (
            <Card className="border-0 shadow-lg">
              <CardContent className="space-y-5 p-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7AB5]/10">
                    <FolderOpen className="h-6 w-6 text-[#0D7AB5]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-black text-[#2F3570]">Sobre o projeto</h2>
                  <p className="mt-1 text-sm font-light text-muted-foreground">
                    Conte sobre o que você criou com IA
                  </p>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Título do projeto</span>
                  <input
                    autoFocus
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Ex: Landing page para campanha de implantes"
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Descreva o que foi criado</span>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Conte o que você criou, como funciona, e o que está faltando..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-[#2F3570]">Qual IA foi utilizada?</span>
                    <select
                      value={form.ai_tool}
                      onChange={(e) => set("ai_tool", e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                    >
                      <option value="">Selecione...</option>
                      {AI_TOOLS.map((tool) => (
                        <option key={tool} value={tool}>{tool}</option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1.5">
                    <span className="text-xs font-medium text-[#2F3570]">Tipo de projeto</span>
                    <select
                      value={form.project_type}
                      onChange={(e) => set("project_type", e.target.value)}
                      className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                    >
                      {Object.entries(PROJECT_TYPES).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Link do projeto (opcional)</span>
                  <input
                    type="url"
                    value={form.project_url}
                    onChange={(e) => set("project_url", e.target.value)}
                    placeholder="https://..."
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>
              </CardContent>
            </Card>
          )}

          {currentStep === "arquivos" && (
            <Card className="border-0 shadow-lg">
              <CardContent className="space-y-5 p-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7AB5]/10">
                    <Upload className="h-6 w-6 text-[#0D7AB5]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-black text-[#2F3570]">Envie seus arquivos</h2>
                  <p className="mt-1 text-sm font-light text-muted-foreground">
                    Código, prints, PDFs — tudo que ajude nossa análise
                  </p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all",
                    isDragging
                      ? "border-[#0D7AB5] bg-[#0D7AB5]/10 scale-[1.02]"
                      : "border-border hover:border-[#0D7AB5]/50 hover:bg-[#0D7AB5]/5",
                  )}
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#0D7AB5]/10">
                    <Upload className="h-6 w-6 text-[#0D7AB5]" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium text-[#2F3570]">
                    Arraste arquivos aqui
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ou clique para selecionar
                  </p>
                  <p className="mt-3 rounded-full bg-[#F0F0F0] px-3 py-1 text-[10px] text-muted-foreground">
                    ZIP, PDF, imagens, código — até 50MB por arquivo
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) handleFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </div>

                {fileErrors.length > 0 && (
                  <div className="rounded-lg bg-red-50 p-3">
                    {fileErrors.map((err, i) => (
                      <p key={i} className="text-xs text-red-600">{err}</p>
                    ))}
                  </div>
                )}

                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#2F3570]">
                      {files.length} arquivo{files.length > 1 ? "s" : ""} selecionado{files.length > 1 ? "s" : ""}
                    </p>
                    {files.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg bg-[#F0F0F0] px-3 py-2">
                        <FileIcon className="h-4 w-4 shrink-0 text-[#0D7AB5]" strokeWidth={1.5} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#2F3570]">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {files.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    Este passo é opcional — você pode avançar sem arquivos
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === "necessidade" && (
            <Card className="border-0 shadow-lg">
              <CardContent className="space-y-5 p-6">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0D7AB5]/10">
                    <HelpCircle className="h-6 w-6 text-[#0D7AB5]" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-black text-[#2F3570]">O que você precisa?</h2>
                  <p className="mt-1 text-sm font-light text-muted-foreground">
                    Descreva como podemos ajudar com o projeto
                  </p>
                </div>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Descreva o que precisa de ajuda</span>
                  <textarea
                    autoFocus
                    rows={4}
                    value={form.what_needs}
                    onChange={(e) => set("what_needs", e.target.value)}
                    placeholder="Ex: Preciso de review do código, ajuste de responsividade, deploy em produção..."
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-[#2F3570]">Prazo desejado (opcional)</span>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => set("deadline", e.target.value)}
                    className="h-10 w-full rounded-lg border border-border px-3 text-sm outline-none focus:border-[#0D7AB5] focus:ring-2 focus:ring-[#0D7AB5]/20"
                  />
                </label>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-auto mt-6 flex w-full max-w-lg items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          className={cn(
            "flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
            isFirst
              ? "invisible"
              : "border border-border text-[#2F3570] hover:bg-[#F0F0F0]",
          )}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar
        </button>

        <span className="text-xs text-muted-foreground">
          {stepIdx + 1} de {STEPS.length}
        </span>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdvance()}
            className={cn(
              "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-black text-white transition-all",
              canAdvance()
                ? "bg-gradient-to-r from-[#0D7AB5] to-[#20DAFE] hover:opacity-90 shadow-lg shadow-[#0D7AB5]/25"
                : "cursor-not-allowed bg-gray-300",
            )}
          >
            <BrainCircuit className="h-4 w-4" strokeWidth={1.5} />
            Enviar para IA
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            disabled={!canAdvance()}
            className={cn(
              "flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-black text-white transition-all",
              canAdvance()
                ? "bg-gradient-to-r from-[#0D7AB5] to-[#20DAFE] hover:opacity-90"
                : "cursor-not-allowed bg-gray-300",
            )}
          >
            Avançar
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
