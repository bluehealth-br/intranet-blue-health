import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Inbox, Search, ArrowRight } from "lucide-react";
import {
  STATUS_CONFIG,
  URGENCY_CONFIG,
  PROJECT_TYPES,
  type Status,
} from "@/lib/mock-data";
import { useSubmissions } from "@/lib/store";
import { timeAgo } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const STATUS_TABS: (Status | "todos")[] = [
  "todos", "novo", "triagem", "em_analise", "aprovado", "concluido", "recusado",
];

export default function Solicitacoes() {
  const submissions = useSubmissions((s) => s.submissions);
  const [statusFilter, setStatusFilter] = useState<Status | "todos">("todos");
  const [search, setSearch] = useState("");

  const filtered = submissions
    .filter((s) => {
      if (statusFilter !== "todos" && s.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.submitter_name.toLowerCase().includes(q) ||
          s.ai_tool.toLowerCase().includes(q) ||
          s.submitter_department.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl bg-gradient-to-br from-[#0D7AB5] to-[#20DAFE] p-6 text-white">
        <h1 className="text-2xl font-black uppercase tracking-tight">Solicitações</h1>
        <p className="font-light text-white/80">Todos os projetos enviados para análise</p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, nome, IA ou departamento..."
            className="h-10 w-full rounded-lg border border-border bg-white pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-[#0D7AB5] focus:ring-1 focus:ring-[#0D7AB5]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-[#0D7AB5] text-white"
                  : "bg-[#F0F0F0] text-[#2F3570] hover:bg-[#0D7AB5]/10",
              )}
            >
              {s === "todos" ? "Todos" : STATUS_CONFIG[s].label}
              {s !== "todos" && (
                <span className="ml-1 opacity-70">
                  ({submissions.filter((x) => x.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Inbox className="mb-3 h-12 w-12 opacity-50" strokeWidth={1.5} />
              <p className="text-base font-black text-[#2F3570]">Nenhuma solicitação encontrada</p>
              <p className="mt-1 text-sm font-light">Tente ajustar os filtros ou o termo de busca.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((sub) => (
            <Link
              key={sub.id}
              to={`/solicitacoes/${sub.id}`}
              className="block rounded-lg border border-border bg-white p-4 transition-colors hover:border-[#0D7AB5]/30 hover:bg-[#0D7AB5]/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_CONFIG[sub.status].color}`}>
                      {STATUS_CONFIG[sub.status].label}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${URGENCY_CONFIG[sub.urgency].color}`}>
                      {URGENCY_CONFIG[sub.urgency].label}
                    </span>
                    <Badge variant="secondary" className="bg-[#0D7AB5]/10 text-[10px] text-[#0D7AB5]">
                      {sub.ai_tool}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {PROJECT_TYPES[sub.project_type]}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-[#2F3570]">{sub.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs font-light text-muted-foreground">
                    {sub.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-[#2F3570]">{sub.submitter_name}</span>
                    <span>·</span>
                    <span>{sub.submitter_department}</span>
                    <span>·</span>
                    <span>{timeAgo(sub.created_at)}</span>
                    {sub.assigned_to && (
                      <>
                        <span>·</span>
                        <span className="text-[#0D7AB5]">→ {sub.assigned_to}</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
