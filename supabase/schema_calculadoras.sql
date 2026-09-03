-- ============================================================
-- BacteriDex — Fase 3: Calculadoras
-- ============================================================
-- Mismo patrón que supabase/schema_cms.sql (Fase A): un registro completo
-- por fila en JSONB, RLS pública solo para estado = 'activo', escritura
-- exclusiva desde app/api/admin/calculadoras/** con la service_role key.
--
-- No se guarda ningún resultado calculado ni fórmula clínica inventada acá:
-- esta tabla solo define la ESTRUCTURA de la calculadora (nombre,
-- variables, fórmula como texto, unidad). El cálculo en sí ocurre en el
-- navegador con mathjs (lib/calc/evaluar.ts), nunca en el servidor ni con
-- eval() de JavaScript.
create table if not exists public.cms_calculadoras (
  id text primary key,
  numero int not null default 0,
  analisis_id text,
  data jsonb not null,
  estado text not null default 'activo' check (estado in ('activo', 'archivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.cms_calculadoras enable row level security;

drop policy if exists "Calculadoras activas son públicas" on public.cms_calculadoras;
create policy "Calculadoras activas son públicas"
  on public.cms_calculadoras for select
  using (estado = 'activo');

drop trigger if exists trg_cms_calculadoras_updated_at on public.cms_calculadoras;
create trigger trg_cms_calculadoras_updated_at
  before update on public.cms_calculadoras
  for each row execute function public.cms_set_updated_at();

create index if not exists idx_cms_calculadoras_analisis on public.cms_calculadoras (analisis_id);
