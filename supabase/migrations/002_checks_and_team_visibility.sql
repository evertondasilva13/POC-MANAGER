-- Padroniza os cinco checks pós-homologação.
-- Pode ser executada uma única vez no SQL Editor do Supabase.

alter table public.poc_checks
  drop constraint if exists poc_checks_key_check;

-- A instalação anterior tinha um único item "paginaMTM". Ele passa a
-- representar o checklist publicado; o playbook é criado logo abaixo.
update public.poc_checks
set key = 'paginaMTMChecklist'
where key = 'paginaMTM';

insert into public.poc_checks (poc_id, key)
select p.id, 'paginaMTMPlaybook'
from public.pocs p
where not exists (
  select 1
  from public.poc_checks c
  where c.poc_id = p.id and c.key = 'paginaMTMPlaybook'
);

alter table public.poc_checks
  add constraint poc_checks_key_check
  check (key in ('checklist', 'playbook', 'catalogo', 'paginaMTMChecklist', 'paginaMTMPlaybook'));
