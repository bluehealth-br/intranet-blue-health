import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ListOrdered,
  AlertCircle,
  Clock,
  User,
  ArrowRight,
  Flame,
  TrendingUp,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import { useSubmissions } from "@/lib/store";
import { getPriorityQueue, getWipByPerson, WIP_LIMIT } from "@/lib/priority";
import { URGENCY_CONFIG, STATUS_CONFIG } from "@/lib/mock-data";
import { timeAgo } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function Fila() {
  const submissions = useSubmissions((s) => s.submissions);
  const queue = getPriorityQueue(submissions);
  const wip = getWipByPerson(submissions);

  const wipEntries = Array.from(wip.entries()).sort(
    (a, b) => b[1].length - a[1].length,
  );

  const unassigned = queue.filter((p) => !p.submission.assigned_to);
  const nextUp = queue[0];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-br from-[#2F3570] to-[#0D7AB5] p-6 text-white">
        <div className="flex items-center gap-3">
          <ListOrdered className="h-7 w-7" strokeWidth={1.5} />
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">
              Fila de Prioridades
            </h1>
            <p className="text-sm font-light text-white/80">
              {queue.length} projetos ativos ordenados por prioridade
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-600" strokeWidth={1.5} />
              <span className="text-xs font-medium text-red-600">Críticos</span>
            </div>
            <p className="mt-1 text-2xl font-black text-red-700">
              {queue.filter((p) => p.submission.urgency === "critica").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" strokeWidth={1.5} />
              <span className="text-xs font-medium text-orange-600">Sem responsável</span>
            </div>
            <p className="mt-1 text-2xl font-black text-orange-700">
              {unassigned.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#0D7AB5]/20 bg-[#0D7AB5]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0D7AB5]" strokeWidth={1.5} />
              <span className="text-xs font-medium text-[#0D7AB5]">Na fila</span>
            </div>
            <p className="mt-1 text-2xl font-black text-[#0D7AB5]">
              {queue.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-[#2F3570]/20 bg-[#2F3570]/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#2F3570]" strokeWidth={1.5} />
              <span className="text-xs font-medium text-[#2F3570]">Pessoas ativas</span>
            </div>
            <p className="mt-1 text-2xl font-black text-[#2F3570]">
              {wipEntries.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Queue principal */}
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-black uppercase text-[#2F3570]">
            Fila ordenada por score
          </h2>

          {queue.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">Nenhum projeto ativo na fila.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {queue.map((item, idx) => {
                const sub = item.submission;
                const isFirst = idx === 0;
                return (
                  <Link
                    key={sub.id}
                    to={`/solicitacoes/${sub.id}`}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg border p-3 transition-all hover:shadow-md",
                      isFirst
                        ? "border-[#0D7AB5]/30 bg-gradient-to-r from-[#0D7AB5]/5 to-transparent"
                        : "border-border hover:border-[#0D7AB5]/20",
                    )}
                  >
                    {/* Rank */}
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
                        isFirst
                          ? "bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] text-white"
                          : idx < 3
                            ? "bg-[#0D7AB5]/10 text-[#0D7AB5]"
                            : "bg-[#F0F0F0] text-[#2F3570]",
                      )}
                    >
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-black text-[#2F3570] group-hover:text-[#0D7AB5]">
                          {sub.title}
                        </span>
                        {isFirst && (
                          <span className="shrink-0 rounded-full bg-[#0D7AB5] px-2 py-0.5 text-[9px] font-black text-white">
                            PRÓXIMO
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium", URGENCY_CONFIG[sub.urgency].color)}>
                          {URGENCY_CONFIG[sub.urgency].label}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-medium", STATUS_CONFIG[sub.status].color)}>
                          {STATUS_CONFIG[sub.status].label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" strokeWidth={1.5} />
                          {timeAgo(sub.created_at)}
                        </span>
                        {sub.assigned_to ? (
                          <span className="flex items-center gap-1 text-[10px] text-[#0D7AB5]">
                            <User className="h-2.5 w-2.5" strokeWidth={1.5} />
                            {sub.assigned_to}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-orange-600">
                            <AlertCircle className="h-2.5 w-2.5" strokeWidth={1.5} />
                            Sem responsável
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="shrink-0 text-right">
                      <div className="text-lg font-black text-[#2F3570]">{item.score}</div>
                      <div className="text-[9px] text-muted-foreground">pontos</div>
                    </div>

                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" strokeWidth={1.5} />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Score breakdown legend */}
          <Card className="bg-[#F0F0F0]/50">
            <CardContent className="p-3">
              <p className="mb-2 text-[10px] font-black uppercase text-muted-foreground">Como o score é calculado</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-md bg-white p-2">
                  <p className="text-[10px] font-medium text-[#2F3570]">Urgência</p>
                  <p className="text-[9px] text-muted-foreground">Crítica 40 · Alta 30 · Média 20 · Baixa 10</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-[10px] font-medium text-[#2F3570]">Tempo de espera</p>
                  <p className="text-[9px] text-muted-foreground">+2 por dia esperando (máx 30)</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-[10px] font-medium text-[#2F3570]">Complexidade</p>
                  <p className="text-[9px] text-muted-foreground">Complexa 15 · Moderada 8 · Simples 3</p>
                </div>
                <div className="rounded-md bg-white p-2">
                  <p className="text-[10px] font-medium text-[#2F3570]">Status</p>
                  <p className="text-[9px] text-muted-foreground">Novo +15 · Triagem +10 · Análise +5</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — WIP por pessoa */}
        <div className="space-y-4">
          <h2 className="text-sm font-black uppercase text-[#2F3570]">
            Capacidade da equipe
          </h2>

          {wipEntries.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-xs text-muted-foreground">Nenhum projeto atribuído.</p>
              </CardContent>
            </Card>
          ) : (
            wipEntries.map(([person, subs]) => {
              const isOver = subs.length >= WIP_LIMIT;
              return (
                <Card
                  key={person}
                  className={cn(
                    "transition-all",
                    isOver && "border-red-200 bg-red-50/50",
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-black text-[#2F3570]">
                        <User className="h-3.5 w-3.5 text-[#0D7AB5]" strokeWidth={1.5} />
                        {person}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-black",
                          isOver
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700",
                        )}
                      >
                        {subs.length}/{WIP_LIMIT}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 pb-3">
                    {isOver && (
                      <div className="mb-2 flex items-center gap-1.5 rounded-md bg-red-100 px-2 py-1.5">
                        <AlertCircle className="h-3 w-3 text-red-600" strokeWidth={1.5} />
                        <span className="text-[10px] font-medium text-red-700">
                          Limite de WIP atingido — evite atribuir novos projetos
                        </span>
                      </div>
                    )}
                    {subs.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/solicitacoes/${sub.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] transition-colors hover:bg-[#0D7AB5]/10"
                      >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", URGENCY_CONFIG[sub.urgency].color.split(" ")[0])} />
                        <span className="min-w-0 flex-1 truncate font-medium text-[#2F3570]">
                          {sub.title}
                        </span>
                        <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-medium", STATUS_CONFIG[sub.status].color)}>
                          {STATUS_CONFIG[sub.status].label}
                        </span>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              );
            })
          )}

          {/* Next up suggestion */}
          {nextUp && !nextUp.submission.assigned_to && (
            <Card className="border-[#0D7AB5]/20 bg-gradient-to-br from-[#0D7AB5]/5 to-[#20DAFE]/5">
              <CardContent className="p-3">
                <p className="mb-1 text-[10px] font-black uppercase text-[#0D7AB5]">
                  Sugestão de próximo projeto
                </p>
                <Link
                  to={`/solicitacoes/${nextUp.submission.id}`}
                  className="text-sm font-black text-[#2F3570] hover:text-[#0D7AB5]"
                >
                  {nextUp.submission.title}
                </Link>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Score {nextUp.score} · {URGENCY_CONFIG[nextUp.submission.urgency].label} · Esperando {timeAgo(nextUp.submission.created_at)}
                </p>
                <p className="mt-1 text-[10px] text-orange-600">
                  Atribua a alguém com capacidade disponível.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
