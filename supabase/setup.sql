-- ══════════════════════════════════════════════════════════════
-- Intranet Blue Health — Setup inicial do Supabase
-- Execute este SQL no SQL Editor do seu projeto Supabase.
-- ══════════════════════════════════════════════════════════════

-- Tabela de colaboradores (com data de nascimento)
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  avatar_url text,
  title text,
  department text,
  birth_date date,
  org_id uuid not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.employees is 'Colaboradores da empresa — alimenta intranet (equipe e aniversariantes)';

-- Tabela de notícias (para quando sair do mock)
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  content text,
  category text not null default 'Geral',
  image_url text,
  author text,
  published boolean not null default true,
  org_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de comunicados
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  priority text not null default 'normal' check (priority in ('alta', 'media', 'normal')),
  org_id uuid not null,
  published boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabela de sistemas
create table if not exists public.systems (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  url text not null,
  icon text,
  internal boolean not null default false,
  org_id uuid not null,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS básica (leitura para todos autenticados)
alter table public.employees enable row level security;
alter table public.news enable row level security;
alter table public.announcements enable row level security;
alter table public.systems enable row level security;

create policy "Employees are viewable by authenticated users"
  on public.employees for select
  to authenticated
  using (true);

create policy "News are viewable by authenticated users"
  on public.news for select
  to authenticated
  using (published = true);

create policy "Announcements are viewable by authenticated users"
  on public.announcements for select
  to authenticated
  using (published = true);

create policy "Systems are viewable by authenticated users"
  on public.systems for select
  to authenticated
  using (active = true);

-- Dados de exemplo para aniversariantes (substitua pelo org_id real)
-- insert into public.employees (name, email, title, department, birth_date, org_id) values
--   ('Maria Silva', 'maria@bluehealth.com.br', 'SDR', 'Comercial', '1995-10-08', 'SEU-ORG-ID'),
--   ('João Santos', 'joao@bluehealth.com.br', 'Desenvolvedor', 'Tecnologia', '1992-10-15', 'SEU-ORG-ID'),
--   ('Ana Costa', 'ana@bluehealth.com.br', 'Analista Financeiro', 'Financeiro', '1998-10-22', 'SEU-ORG-ID');
