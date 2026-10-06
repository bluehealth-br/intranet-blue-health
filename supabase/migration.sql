-- ============================================================
-- BlueAI — Migration: submissions + submission_files + storage
-- Rode este SQL inteiro no SQL Editor do Supabase
-- ============================================================

-- 1. Enum types
create type submission_urgency as enum ('critica', 'alta', 'media', 'baixa');
create type submission_status as enum ('novo', 'triagem', 'em_analise', 'aprovado', 'concluido', 'recusado');
create type project_type as enum ('website', 'app', 'dashboard', 'automacao', 'chatbot');
create type submission_complexity as enum ('simples', 'moderada', 'complexa');

-- 2. Submissions table
create table submissions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text not null,

  submitter_name       text not null,
  submitter_email      text not null,
  submitter_department text not null,

  ai_tool      text not null,
  project_type project_type not null,
  project_url  text,

  urgency    submission_urgency not null default 'media',
  status     submission_status  not null default 'novo',
  complexity submission_complexity,
  webhook_secret text,
  mirror_repo_url text,
  last_synced_at timestamptz,
  pending_commits integer not null default 0,

  need   text not null default '',
  desire text not null default '',

  triage_notes text,
  approach     text,
  assigned_to  text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Submission files (normalized)
create table submission_files (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  name          text not null,
  size          bigint not null default 0,
  type          text not null default '',
  path          text not null,
  url           text not null,
  created_at    timestamptz not null default now()
);

create index idx_submission_files_submission on submission_files(submission_id);

-- 4. Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_submissions_updated_at
  before update on submissions
  for each row execute function update_updated_at();

-- 5. Indexes
create index idx_submissions_status on submissions(status);
create index idx_submissions_urgency on submissions(urgency);
create index idx_submissions_created on submissions(created_at desc);

-- 6. RLS (habilitado, mas permissivo por enquanto — sem auth no app)
alter table submissions enable row level security;
alter table submission_files enable row level security;

create policy "submissions_select" on submissions for select using (true);
create policy "submissions_insert" on submissions for insert with check (true);
create policy "submissions_update" on submissions for update using (true);
create policy "submissions_delete" on submissions for delete using (true);

create policy "files_select" on submission_files for select using (true);
create policy "files_insert" on submission_files for insert with check (true);
create policy "files_delete" on submission_files for delete using (true);

-- 7. Submission updates (timeline bidirecional)
create table submission_updates (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  author_name   text not null,
  author_role   text not null default 'solicitante' check (author_role in ('solicitante', 'time', 'ia', 'github')),
  message       text not null,
  files         jsonb not null default '[]',
  created_at    timestamptz not null default now()
);

create index idx_submission_updates_submission on submission_updates(submission_id);
create index idx_submission_updates_created on submission_updates(created_at);

alter table submission_updates enable row level security;

create policy "updates_select" on submission_updates for select using (true);
create policy "updates_insert" on submission_updates for insert with check (true);
create policy "updates_delete" on submission_updates for delete using (true);

-- 8. Increment pending commits (used by github-webhook edge function)
create or replace function increment_pending_commits(p_submission_id uuid, p_count integer)
returns void as $$
begin
  update submissions
  set pending_commits = pending_commits + p_count,
      updated_at = now()
  where id = p_submission_id;
end;
$$ language plpgsql security definer;

-- 9. Storage bucket
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', true)
on conflict (id) do nothing;

create policy "storage_select" on storage.objects for select using (bucket_id = 'project-files');
create policy "storage_insert" on storage.objects for insert with check (bucket_id = 'project-files');
create policy "storage_delete" on storage.objects for delete using (bucket_id = 'project-files');
