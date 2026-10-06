import { create } from "zustand";
import { supabase, isConfigured } from "@/integrations/supabase/client";
import type { Submission, Status, SubmissionFile, SubmissionUpdate } from "./mock-data";
import { MOCK_SUBMISSIONS, MOCK_UPDATES } from "./mock-data";
import { analyzeUpdate } from "./ai-triage";

interface SubmissionsState {
  submissions: Submission[];
  updates: SubmissionUpdate[];
  loading: boolean;
  error: string | null;
  analyzingUpdateFor: string | null;

  fetchSubmissions: () => Promise<void>;
  addSubmission: (sub: Submission) => Promise<void>;
  updateStatus: (id: string, status: Status) => Promise<void>;
  assignTo: (id: string, person: string) => Promise<void>;
  addNote: (id: string, note: string) => Promise<void>;
  addUpdate: (update: SubmissionUpdate) => Promise<void>;
  enableWebhook: (submissionId: string) => Promise<string>;
  disableWebhook: (submissionId: string) => Promise<void>;
  createMirror: (submissionId: string) => Promise<void>;
  syncMirror: (submissionId: string) => Promise<void>;
  getById: (id: string) => Submission | undefined;
  getByStatus: (...statuses: Status[]) => Submission[];
  countByStatus: (status: Status) => number;
  getUpdates: (submissionId: string) => SubmissionUpdate[];
}

async function fetchWithFiles(): Promise<Submission[]> {
  const { data: rows, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const { data: files } = await supabase
    .from("submission_files")
    .select("*")
    .in("submission_id", ids);

  const filesBySubmission = new Map<string, SubmissionFile[]>();
  for (const f of files ?? []) {
    const list = filesBySubmission.get(f.submission_id) ?? [];
    list.push({ name: f.name, size: f.size, type: f.type, path: f.path, url: f.url });
    filesBySubmission.set(f.submission_id, list);
  }

  return rows.map((r) => ({
    ...r,
    files: filesBySubmission.get(r.id) ?? [],
  })) as Submission[];
}

async function fetchAllUpdates(): Promise<SubmissionUpdate[]> {
  const { data, error } = await supabase
    .from("submission_updates")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((u) => ({
    ...u,
    author_role: u.author_role as "solicitante" | "time" | "ia" | "github",
    files: (u.files as unknown as SubmissionFile[]) ?? [],
  }));
}

export const useSubmissions = create<SubmissionsState>((set, get) => ({
  submissions: isConfigured ? [] : [...MOCK_SUBMISSIONS],
  updates: isConfigured ? [] : [...MOCK_UPDATES],
  loading: isConfigured,
  error: null,
  analyzingUpdateFor: null,

  fetchSubmissions: async () => {
    if (!isConfigured) return;
    set({ loading: true, error: null });
    try {
      const [submissions, updates] = await Promise.all([
        fetchWithFiles(),
        fetchAllUpdates(),
      ]);
      set({ submissions, updates, loading: false });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao carregar solicitações";
      set({ error: msg, loading: false });
    }
  },

  addSubmission: async (sub) => {
    if (!isConfigured) {
      set((s) => ({ submissions: [sub, ...s.submissions] }));
      return;
    }

    const { files, ...row } = sub;
    const { data, error } = await supabase
      .from("submissions")
      .insert(row)
      .select()
      .single();

    if (error) throw error;

    if (files.length > 0) {
      const fileRows = files.map((f) => ({
        submission_id: data.id,
        name: f.name,
        size: f.size,
        type: f.type,
        path: f.path,
        url: f.url,
      }));
      await supabase.from("submission_files").insert(fileRows);
    }

    const full: Submission = { ...data, files } as Submission;
    set((s) => ({ submissions: [full, ...s.submissions] }));
  },

  updateStatus: async (id, status) => {
    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    }

    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === id
          ? { ...sub, status, updated_at: new Date().toISOString() }
          : sub,
      ),
    }));
  },

  assignTo: async (id, person) => {
    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ assigned_to: person })
        .eq("id", id);
      if (error) throw error;
    }

    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === id
          ? { ...sub, assigned_to: person, updated_at: new Date().toISOString() }
          : sub,
      ),
    }));
  },

  addNote: async (id, note) => {
    const current = get().submissions.find((s) => s.id === id);
    const newNotes = current?.triage_notes
      ? `${current.triage_notes}\n\n${note}`
      : note;

    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ triage_notes: newNotes })
        .eq("id", id);
      if (error) throw error;
    }

    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === id
          ? { ...sub, triage_notes: newNotes, updated_at: new Date().toISOString() }
          : sub,
      ),
    }));
  },

  addUpdate: async (update) => {
    if (isConfigured) {
      const { error } = await supabase
        .from("submission_updates")
        .insert({
          id: update.id,
          submission_id: update.submission_id,
          author_name: update.author_name,
          author_role: update.author_role,
          message: update.message,
          files: JSON.parse(JSON.stringify(update.files)),
        });
      if (error) throw error;

      if (update.files.length > 0) {
        const fileRows = update.files.map((f) => ({
          submission_id: update.submission_id,
          name: f.name,
          size: f.size,
          type: f.type,
          path: f.path,
          url: f.url,
        }));
        await supabase.from("submission_files").insert(fileRows);
      }
    }

    set((s) => ({ updates: [...s.updates, update] }));

    if (update.author_role === "ia") return;

    const submission = get().submissions.find((s) => s.id === update.submission_id);
    if (!submission) return;

    set({ analyzingUpdateFor: update.submission_id });

    const previousUpdates = get().updates.filter(
      (u) => u.submission_id === update.submission_id && u.id !== update.id,
    );

    try {
      const analysis = await analyzeUpdate(update, submission, previousUpdates);

      const aiUpdate: SubmissionUpdate = {
        id: `${update.id}-ai`,
        submission_id: update.submission_id,
        author_name: "BlueAI",
        author_role: "ia",
        message: analysis.message,
        files: [],
        created_at: new Date().toISOString(),
      };

      if (isConfigured) {
        await supabase
          .from("submission_updates")
          .insert({
            id: aiUpdate.id,
            submission_id: aiUpdate.submission_id,
            author_name: aiUpdate.author_name,
            author_role: aiUpdate.author_role,
            message: aiUpdate.message,
            files: JSON.parse(JSON.stringify(aiUpdate.files)),
          });
      }

      set((s) => ({
        updates: [...s.updates, aiUpdate],
        analyzingUpdateFor: null,
      }));
    } catch {
      set({ analyzingUpdateFor: null });
    }
  },

  enableWebhook: async (submissionId) => {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    const secret = "whsec_" + Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");

    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ webhook_secret: secret })
        .eq("id", submissionId);
      if (error) throw error;
    }

    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId
          ? { ...sub, webhook_secret: secret, updated_at: new Date().toISOString() }
          : sub,
      ),
    }));

    return secret;
  },

  disableWebhook: async (submissionId) => {
    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ webhook_secret: null })
        .eq("id", submissionId);
      if (error) throw error;
    }

    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId
          ? { ...sub, webhook_secret: null, updated_at: new Date().toISOString() }
          : sub,
      ),
    }));
  },

  createMirror: async (submissionId) => {
    const submission = get().submissions.find((s) => s.id === submissionId);
    if (!submission?.project_url) return;

    const repoName = submission.project_url.split("/").pop() ?? submissionId;
    const mirrorUrl = `https://github.com/higorsilva-BH/mirror-${repoName}`;

    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ mirror_repo_url: mirrorUrl, last_synced_at: new Date().toISOString(), pending_commits: 0 })
        .eq("id", submissionId);
      if (error) throw error;
    }

    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId
          ? { ...sub, mirror_repo_url: mirrorUrl, last_synced_at: new Date().toISOString(), pending_commits: 0, updated_at: new Date().toISOString() }
          : sub,
      ),
    }));
  },

  syncMirror: async (submissionId) => {
    const submission = get().submissions.find((s) => s.id === submissionId);
    if (!submission?.mirror_repo_url) return;

    if (isConfigured) {
      const { error } = await supabase
        .from("submissions")
        .update({ last_synced_at: new Date().toISOString(), pending_commits: 0 })
        .eq("id", submissionId);
      if (error) throw error;
    }

    const now = new Date().toISOString();
    set((s) => ({
      submissions: s.submissions.map((sub) =>
        sub.id === submissionId
          ? { ...sub, last_synced_at: now, pending_commits: 0, updated_at: now }
          : sub,
      ),
    }));

    const syncUpdate: SubmissionUpdate = {
      id: crypto.randomUUID(),
      submission_id: submissionId,
      author_name: "Equipe BlueAI",
      author_role: "time",
      message: `Espelho sincronizado com o repositório original. ${submission.pending_commits} commit(s) incorporados.`,
      files: [],
      created_at: now,
    };

    await get().addUpdate(syncUpdate);
  },

  getById: (id) => get().submissions.find((s) => s.id === id),

  getByStatus: (...statuses) =>
    get().submissions.filter((s) => statuses.includes(s.status)),

  countByStatus: (status) =>
    get().submissions.filter((s) => s.status === status).length,

  getUpdates: (submissionId) =>
    get().updates.filter((u) => u.submission_id === submissionId),
}));
