import type { Submission } from "./mock-data";

export interface PriorityScore {
  submission: Submission;
  score: number;
  breakdown: {
    urgency: number;
    waiting: number;
    complexity: number;
    status: number;
  };
}

const URGENCY_SCORE: Record<string, number> = {
  critica: 40,
  alta: 30,
  media: 20,
  baixa: 10,
};

const COMPLEXITY_SCORE: Record<string, number> = {
  complexa: 15,
  moderada: 8,
  simples: 3,
};

const STATUS_SCORE: Record<string, number> = {
  novo: 15,
  triagem: 10,
  em_analise: 5,
  aprovado: 0,
};

const ACTIVE_STATUSES = ["novo", "triagem", "em_analise", "aprovado"];

export function calculatePriority(sub: Submission): PriorityScore {
  const urgency = URGENCY_SCORE[sub.urgency] ?? 10;

  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(sub.created_at).getTime()) / (1000 * 60 * 60 * 24),
  );
  const waiting = Math.min(daysSinceCreated * 2, 30);

  const complexity = COMPLEXITY_SCORE[sub.complexity ?? ""] ?? 5;
  const status = STATUS_SCORE[sub.status] ?? 0;

  return {
    submission: sub,
    score: urgency + waiting + complexity + status,
    breakdown: { urgency, waiting, complexity, status },
  };
}

export function getPriorityQueue(submissions: Submission[]): PriorityScore[] {
  return submissions
    .filter((s) => ACTIVE_STATUSES.includes(s.status))
    .map(calculatePriority)
    .sort((a, b) => b.score - a.score);
}

export function getWipByPerson(submissions: Submission[]): Map<string, Submission[]> {
  const wip = new Map<string, Submission[]>();
  for (const sub of submissions) {
    if (!sub.assigned_to || sub.status === "concluido" || sub.status === "recusado") continue;
    const list = wip.get(sub.assigned_to) ?? [];
    list.push(sub);
    wip.set(sub.assigned_to, list);
  }
  return wip;
}

const WIP_LIMIT = 3;

export function isOverWip(person: string, wip: Map<string, Submission[]>): boolean {
  return (wip.get(person)?.length ?? 0) >= WIP_LIMIT;
}

export { WIP_LIMIT };
