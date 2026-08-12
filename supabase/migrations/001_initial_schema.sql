-- ═══════════════════════════════════════════════════════════════
--  POC Manager — Schema Inicial
--  Rodar no Supabase SQL Editor (uma vez, em ordem)
-- ═══════════════════════════════════════════════════════════════

-- Habilita extensão para UUID
create extension if not exists "pgcrypto";

-- ─── USERS ───────────────────────────────────────────────────────
create table if not exists users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null unique,
  is_admin   boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table users is 'Usuários do sistema (login simplificado — sem senha)';

-- ─── POCS ────────────────────────────────────────────────────────
create table if not exists pocs (
  id                          uuid primary key default gen_random_uuid(),
  nome                        text not null,
  descricao                   text not null,
  kpi_chave                   text not null,
  resultado                   text,
  link_apresentacao           text,
  arquivo_apresentacao_url    text,
  arquivo_apresentacao_name   text,
  desenho_tecnico_url         text,
  desenho_tecnico_name        text,
  status                      text not null default 'draft'
                              check (status in ('draft','ready','approval','homologacao','checks','finished')),
  created_by_id               uuid not null references users(id) on delete restrict,
  created_by_name             text not null,
  created_by_email            text not null,
  supervisor_mtm_nome         text,
  supervisor_mtm_email        text,
  gerente_mtm_nome            text,
  gerente_mtm_email           text,
  aprovacao_enviada_em        timestamptz,
  email_homologacao_enviado   boolean not null default false,
  checks_email_sent_at        timestamptz,
  status_dates                jsonb not null default '{}',
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

comment on table pocs is 'Cards de Prova de Conceito';

-- auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pocs_updated_at
  before update on pocs
  for each row execute function update_updated_at();

-- ─── POC APPROVERS ───────────────────────────────────────────────
create table if not exists poc_approvers (
  id                uuid primary key default gen_random_uuid(),
  poc_id            uuid not null references pocs(id) on delete cascade,
  type              text not null check (type in ('op', 'she')),
  nome              text not null,
  email             text not null,
  aprovado          boolean not null default false,
  reprovado         boolean not null default false,
  motivo_reprovacao text,
  enviado_em        timestamptz,
  aprovado_em       timestamptz,
  reprovado_em      timestamptz,
  created_at        timestamptz not null default now()
);

comment on table poc_approvers is 'Aprovadores por POC (Operação e SHE, máx 3 cada)';

-- ─── POC SHARES ──────────────────────────────────────────────────
create table if not exists poc_shares (
  id         uuid primary key default gen_random_uuid(),
  poc_id     uuid not null references pocs(id) on delete cascade,
  user_name  text not null,
  user_email text not null,
  created_at timestamptz not null default now(),
  unique (poc_id, user_email)
);

comment on table poc_shares is 'Compartilhamento de cards com outros usuários';

-- ─── POC RESPONSAVEIS HOMOLOGAÇÃO ────────────────────────────────
create table if not exists poc_responsaveis (
  id         uuid primary key default gen_random_uuid(),
  poc_id     uuid not null references pocs(id) on delete cascade,
  role       text not null check (role in ('SHE','Compras','Operacao','Lean','MTM')),
  nome       text,
  email      text,
  created_at timestamptz not null default now(),
  unique (poc_id, role)
);

comment on table poc_responsaveis is 'Responsáveis por área na etapa de Homologação';

-- ─── POC CHECKS ──────────────────────────────────────────────────
create table if not exists poc_checks (
  id          uuid primary key default gen_random_uuid(),
  poc_id      uuid not null references pocs(id) on delete cascade,
  key         text not null check (key in ('checklist','playbook','catalogo','paginaMTM')),
  done        boolean not null default false,
  link        text,
  arquivo_url  text,
  arquivo_name text,
  updated_at  timestamptz not null default now(),
  unique (poc_id, key)
);

comment on table poc_checks is 'Checklist pós-homologação (4 itens por POC)';

-- ─── POC HISTORY ─────────────────────────────────────────────────
create table if not exists poc_history (
  id         uuid primary key default gen_random_uuid(),
  poc_id     uuid not null references pocs(id) on delete cascade,
  emoji      text,
  event      text not null,
  detail     text,
  by_name    text,
  by_email   text,
  created_at timestamptz not null default now()
);

comment on table poc_history is 'Timeline de atividades de cada POC';

-- ─── ÍNDICES ─────────────────────────────────────────────────────
create index on pocs (created_by_id);
create index on pocs (status);
create index on poc_approvers (poc_id);
create index on poc_shares (poc_id);
create index on poc_shares (user_email);
create index on poc_responsaveis (poc_id);
create index on poc_checks (poc_id);
create index on poc_history (poc_id);
create index on poc_history (created_at desc);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────
-- Usamos JWT próprio (não Supabase Auth), então o service_role_key
-- será usado no backend. RLS desabilitado por padrão para facilitar.
-- Se quiser habilitar futuramente, use políticas baseadas em claims JWT.

alter table users               enable row level security;
alter table pocs                enable row level security;
alter table poc_approvers       enable row level security;
alter table poc_shares          enable row level security;
alter table poc_responsaveis    enable row level security;
alter table poc_checks          enable row level security;
alter table poc_history         enable row level security;

-- Service role bypassa RLS — o backend usa a service_role_key
-- Acesso público bloqueado por padrão (sem políticas abertas)

-- ─── SEED: Admin inicial ─────────────────────────────────────────
-- Substitua pelo e-mail real do admin antes de rodar
-- insert into users (name, email, is_admin)
-- values ('Admin MTM', 'admin@mercadolivre.com', true);
