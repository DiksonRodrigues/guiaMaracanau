-- Adiciona campos de gestão na tabela leads existente
alter table public.leads
  add column if not exists status text not null default 'novo',
  add column if not exists notes text,
  add column if not exists created_at timestamptz not null default now();

-- Constraint de status válidos
alter table public.leads
  add constraint leads_status_check check (status in ('novo', 'em_contato', 'fechado', 'descartado'));

create index leads_status_idx on public.leads(status, created_at desc);

-- RLS: anon pode inserir, service_role lê e atualiza
alter table public.leads enable row level security;

create policy "leads_insert_anon" on public.leads
  for insert with check (true);

create policy "leads_select_service" on public.leads
  for select using (auth.role() = 'service_role');

create policy "leads_update_service" on public.leads
  for update using (auth.role() = 'service_role');
