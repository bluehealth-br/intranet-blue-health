import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import {
  STATUS_CONFIG,
  URGENCY_CONFIG,
  PIPELINE_STAGES,
  VALID_TRANSITIONS,
} from "@/lib/mock-data";
import { useSubmissions } from "@/lib/store";
import { timeAgo } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function Triagem() {
  const submissions = useSubmissions((s) => s.submissions);
  const updateStatus = useSubmissions((s) => s.updateStatus);

  const recusados = submissions.filter((s) => s.status === "recusado");

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-8 w-8" strokeWidth={1.5} />
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Esteira de validação</h1>
            <p className="font-light text-white/80">
              Arraste ou use os botões para mover os projetos entre as etapas
            </p>
          </div>
        </div>
      </div>

      {/* Kanban columns */}
      <div className="mt-4 flex flex-1 gap-3 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => {
          const items = submissions
            .filter((s) => s.status === stage)
            .sort((a, b) => {
              const urgencyOrder = { critica: 0, alta: 1, media: 2, baixa: 3 };
              return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
            });
          const cfg = STATUS_CONFIG[stage];
          const transitions = VALID_TRANSITIONS[stage];

          return (
            <div
              key={stage}
              className="flex w-72 shrink-0 flex-col rounded-xl bg-[#F0F0F0]/60 lg:w-auto lg:flex-1"
            >
              {/* Column header */}
              <div className="flex items-center justify-between rounded-t-xl bg-white px-3 py-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="text-xs font-black text-[#2F3570]">{items.length}</span>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {items.length === 0 ? (
                  <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                    Nenhum item
                  </div>
                ) : (
                  items.map((sub) => (
                    <div
                      key={sub.id}
                      className={cn(
                        "rounded-lg border bg-white p-3 transition-shadow hover:shadow-md",
                        sub.urgency === "critica" && "border-red-200",
                      )}
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-medium ${URGENCY_CONFIG[sub.urgency].color}`}>
                          {URGENCY_CONFIG[sub.urgency].label}
                        </span>
                        <Badge variant="secondary" className="bg-[#0D7AB5]/10 px-1.5 py-0 text-[9px] text-[#0D7AB5]">
                          {sub.ai_tool}
                        </Badge>
                      </div>

                      <Link
                        to={`/solicitacoes/${sub.id}`}
                        className="block text-sm font-black text-[#2F3570] hover:text-[#0D7AB5]"
                      >
                        {sub.title}
                      </Link>

                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {sub.submitter_name} · {timeAgo(sub.created_at)}
                      </p>

                      {sub.assigned_to && (
                        <p className="mt-1 text-[10px] text-[#0D7AB5]">→ {sub.assigned_to}</p>
                      )}

                      {/* Transition buttons */}
                      {transitions.next.length > 0 && (
                        <div className="mt-2 flex gap-1.5">
                          {transitions.next.map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() => void updateStatus(sub.id, nextStatus)}
                              className={cn(
                                "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-colors",
                                nextStatus === "recusado"
                                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                                  : "bg-[#0D7AB5]/10 text-[#0D7AB5] hover:bg-[#0D7AB5]/20",
                              )}
                            >
                              {transitions.label[nextStatus]}
                              <ArrowRight className="h-2.5 w-2.5" strokeWidth={1.5} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recusados */}
      {recusados.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-black text-muted-foreground uppercase">
            Recusados ({recusados.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recusados.map((sub) => (
              <div
                key={sub.id}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 px-3 py-2"
              >
                <Link
                  to={`/solicitacoes/${sub.id}`}
                  className="text-xs font-medium text-[#2F3570] hover:text-[#0D7AB5]"
                >
                  {sub.title}
                </Link>
                <button
                  onClick={() => void updateStatus(sub.id, "triagem")}
                  className="rounded bg-[#0D7AB5]/10 px-2 py-0.5 text-[9px] font-medium text-[#0D7AB5] hover:bg-[#0D7AB5]/20"
                >
                  Reabrir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
