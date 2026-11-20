-- =====================================================================
-- Farmácia Básica · Lista de Espera de Insumos
-- Cole este script no Supabase > SQL Editor > New query > Run
-- =====================================================================

create extension if not exists "pgcrypto";

create table if not exists public.pacientes (
  id              uuid primary key default gen_random_uuid(),
  nome            text        not null,
  cpf             text        not null check (cpf ~ '^[0-9]{11}$'),
  sus             text        not null check (sus ~ '^[0-9]{15}$'),
  data_nascimento date        not null check (data_nascimento <= current_date),
  telefone        text        not null,
  unidade_saude   text        not null,
  tipo_diabetes   text        not null check (tipo_diabetes in ('Tipo I', 'Tipo II')),
  tipo_insumo     text        not null check (tipo_insumo in ('NPH/Regular', 'Glicosímetro', 'Glargina')),
  prioridade      smallint,   -- vazio = sem prioridade
  status          text        not null default 'Aguardando' check (status in ('Aguardando', 'Entregue')),
  entregue_em     timestamptz,
  criado_em       timestamptz not null default now(),
  atualizado_em   timestamptz not null default now(),

  -- Regras de prioridade de cada lista
  constraint prioridade_valida check (
       prioridade is null
    or (tipo_insumo = 'NPH/Regular' and prioridade in (1, 2, 3))
    or (tipo_insumo = 'Glicosímetro' and prioridade in (1, 2))
    or (tipo_insumo = 'Glargina'     and prioridade = 1)
  ),
  -- O mesmo CPF não se repete dentro da mesma lista (mas pode estar em listas diferentes)
  constraint cpf_unico_por_insumo unique (cpf, tipo_insumo)
);

create index if not exists pacientes_fila_idx
  on public.pacientes (tipo_insumo, status, prioridade, criado_em);

-- Atualiza "atualizado_em" e a data de entrega automaticamente
create or replace function public.pacientes_before_write()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  if new.status = 'Entregue' and (tg_op = 'INSERT' or old.status is distinct from 'Entregue') then
    new.entregue_em := coalesce(new.entregue_em, now());
  elsif new.status = 'Aguardando' then
    new.entregue_em := null;
  end if;
  return new;
end $$;

drop trigger if exists trg_pacientes_before_write on public.pacientes;
create trigger trg_pacientes_before_write
  before insert or update on public.pacientes
  for each row execute function public.pacientes_before_write();

-- =====================================================================
-- Segurança (RLS): somente o usuário master logado acessa os dados.
-- A chave "publishable" fica pública no navegador, então SEM estas
-- políticas qualquer pessoa conseguiria ler os dados dos pacientes.
-- =====================================================================
alter table public.pacientes enable row level security;

drop policy if exists "master_total" on public.pacientes;
create policy "master_total" on public.pacientes
  for all
  to authenticated
  using      ((auth.jwt() ->> 'email') = 'bezerrosfarmaciabasica@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'bezerrosfarmaciabasica@gmail.com');
