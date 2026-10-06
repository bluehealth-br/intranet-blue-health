import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import {
  STATUS_CONFIG,
  URGENCY_CONFIG,
  PIPELINE_STAGES,
} from "@/lib/mock-data";
import { useSubmissions } from "@/lib/store";
import { timeAgo } from "@/lib/helpers";

export default function Dashboard() {
  const submissions = useSubmissions((s) => s.submissions);

  const total = submissions.length;
  const novos = submissions.filter((s) => s.status === "novo").length;
  const emAndamento = submissions.filter(
    (s) => s.status === "triagem" || s.status === "em_analise",
  ).length;
  const concluidos = submissions.filter(
    (s) => s.status === "concluido" || s.status === "aprovado",
  ).length;
  const criticos = submissions.filter((s) => s.urgency === "critica").length;

  const pending = submissions
    .filter((s) => s.status !== "concluido" && s.status !== "recusado")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <BrainCircuit className="h-10 w-10" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">BlueAI</h1>
          <p className="font-light text-white/80">Triagem de projetos criados com IA</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0D7AB5]/10">
              <Inbox className="h-5 w-5 text-[#0D7AB5]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#2F3570]">{total}</p>
              <p className="text-xs font-light text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#2F3570]">{novos}</p>
              <p className="text-xs font-light text-muted-foreground">Novos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <ListFilter className="h-5 w-5 text-purple-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#2F3570]">{emAndamento}</p>
              <p className="text-xs font-light text-muted-foreground">Em andamento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#2F3570]">{concluidos}</p>
              <p className="text-xs font-light text-muted-foreground">Concluídos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-700" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#2F3570]">{criticos}</p>
              <p className="text-xs font-light text-muted-foreground">Críticos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mini pipeline visual */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-black text-[#2F3570]">Esteira de validação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto">
            {PIPELINE_STAGES.map((stage, i) => {
              const count = submissions.filter((s) => s.status === stage).length;
              const cfg = STATUS_CONFIG[stage];
              return (
                <div key={stage} className="flex items-center">
                  <Link
                    to="/triagem"
                    className="flex flex-col items-center rounded-lg px-4 py-2 transition-colors hover:bg-[#0D7AB5]/5"
                  >
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="mt-1 text-lg font-black text-[#2F3570]">{count}</span>
                  </Link>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="mx-1 h-4 w-4 shrink-0 text-border" strokeWidth={1.5} />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-black text-[#2F3570]">Solicitações pendentes</CardTitle>
          <Link to="/solicitacoes" className="flex items-center gap-1 text-xs font-medium text-[#0D7AB5] hover:underline">
            Ver todas <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma solicitação pendente
            </p>
          ) : (
            pending.map((sub) => (
              <Link
                key={sub.id}
                to={`/solicitacoes/${sub.id}`}
                className="flex items-center gap-4 rounded-lg border border-border p-3 transition-colors hover:border-[#0D7AB5]/30 hover:bg-[#0D7AB5]/5"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CONFIG[sub.status].color}`}>
                      {STATUS_CONFIG[sub.status].label}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${URGENCY_CONFIG[sub.urgency].color}`}>
                      {URGENCY_CONFIG[sub.urgency].label}
                    </span>
                    <Badge variant="secondary" className="bg-[#0D7AB5]/10 text-[10px] text-[#0D7AB5]">
                      {sub.ai_tool}
                    </Badge>
                  </div>
                  <h3 className="truncate text-sm font-black text-[#2F3570]">{sub.title}</h3>
                  <p className="mt-0.5 flex items-center gap-2 text-xs font-light text-muted-foreground">
                    <span>{sub.submitter_name}</span>
                    <span>·</span>
                    <span>{sub.submitter_department}</span>
                    <span>·</span>
                    <span>{timeAgo(sub.created_at)}</span>
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
