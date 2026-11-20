-- Rode UMA vez no Supabase > SQL Editor se o banco já existe.
-- Permite cadastrar pacientes sem prioridade em qualquer lista.
alter table public.pacientes alter column prioridade drop not null;

alter table public.pacientes drop constraint if exists prioridade_valida;
alter table public.pacientes add constraint prioridade_valida check (
       prioridade is null
    or (tipo_insumo = 'NPH/Regular' and prioridade in (1, 2, 3))
    or (tipo_insumo = 'Glicosímetro' and prioridade in (1, 2))
    or (tipo_insumo = 'Glargina'     and prioridade = 1)
);
