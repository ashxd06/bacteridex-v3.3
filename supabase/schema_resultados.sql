-- ============================================================
-- BacteriDex — Fase 1: Resultados de Laboratorio
-- ============================================================
-- No reemplaza ni elimina nada de schema.sql ni schema_cms.sql. Ejecuta
-- este bloque también en el SQL Editor de Supabase.
--
-- Diseño: se comprobó primero si ya existía algo equivalente (no existía).
-- Se crean DOS tablas en vez de una sola "resultados_laboratorio" plana
-- porque un informe imprimible necesita una cabecera (paciente/muestra/
-- fecha/firma) compartida por varias filas de resultado:
--
--   resultados_informes      → la cabecera (1 por informe/documento)
--   resultados_laboratorio   → los renglones de la tabla de resultados
--                               (N por informe), con exactamente los
--                               campos mínimos pedidos: fecha, muestra,
--                               analisis_id, resultado, unidad,
--                               rango_referencia, estado, observaciones,
--                               created_by, updated_by (+ id/timestamps).
--
-- Privacidad: BacteriDex es una herramienta EDUCATIVA (no un sistema
-- hospitalario real), así que los datos de "paciente" son opcionales y de
-- práctica — no se crea una tabla de pacientes reales. Cada informe le
-- pertenece únicamente a quien lo creó (RLS por user_id, igual que
-- notes/favorites/history): ni siquiera un admin puede leer los informes
-- de otro usuario, porque no hace falta para que la función funcione.

-- 1) Cabecera del informe -------------------------------------------------
create table if not exists public.resultados_informes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null default current_date,
  codigo_muestra text,
  paciente_nombre text,
  paciente_edad text,
  paciente_sexo text,
  observaciones_generales text,
  estado_informe text not null default 'borrador' check (estado_informe in ('borrador', 'completado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id)
);

alter table public.resultados_informes enable row level security;

create policy "Cada usuario ve solo sus propios informes"
  on public.resultados_informes for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea solo sus propios informes"
  on public.resultados_informes for insert
  with check (auth.uid() = user_id and auth.uid() = created_by);

create policy "Cada usuario actualiza solo sus propios informes"
  on public.resultados_informes for update
  using (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propios informes"
  on public.resultados_informes for delete
  using (auth.uid() = user_id);

create or replace function public.resultados_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

drop trigger if exists trg_resultados_informes_updated_at on public.resultados_informes;
create trigger trg_resultados_informes_updated_at
  before update on public.resultados_informes
  for each row execute function public.resultados_set_updated_at();

-- 2) Renglones de resultado ------------------------------------------------
create table if not exists public.resultados_laboratorio (
  id uuid primary key default gen_random_uuid(),
  informe_id uuid not null references public.resultados_informes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null default current_date,
  muestra text,
  analisis_id text,
  analisis_nombre text not null,
  resultado text not null default '',
  unidad text,
  rango_referencia text,
  estado text not null default 'pendiente' check (estado in ('normal', 'bajo', 'alto', 'critico', 'pendiente')),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id)
);

alter table public.resultados_laboratorio enable row level security;

create policy "Cada usuario ve solo sus propios resultados"
  on public.resultados_laboratorio for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea solo sus propios resultados"
  on public.resultados_laboratorio for insert
  with check (auth.uid() = user_id and auth.uid() = created_by);

create policy "Cada usuario actualiza solo sus propios resultados"
  on public.resultados_laboratorio for update
  using (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propios resultados"
  on public.resultados_laboratorio for delete
  using (auth.uid() = user_id);

drop trigger if exists trg_resultados_laboratorio_updated_at on public.resultados_laboratorio;
create trigger trg_resultados_laboratorio_updated_at
  before update on public.resultados_laboratorio
  for each row execute function public.resultados_set_updated_at();

create index if not exists idx_resultados_laboratorio_informe on public.resultados_laboratorio (informe_id);

-- 3) Configuración del laboratorio / firma / sello -------------------------
-- Fila única (id = 1) con los datos institucionales que aparecen en el
-- encabezado y la firma/sello del informe. Lectura pública (cualquier
-- usuario con sesión necesita poder RENDERIZAR el informe con estos
-- datos), pero SOLO el backend admin (service_role, ver
-- app/api/admin/config-laboratorio) puede escribirla — mismo patrón que
-- `insertos`: RLS activo + ninguna política de insert/update para
-- anon/authenticated.
create table if not exists public.lab_config (
  id int primary key default 1,
  laboratorio_nombre text not null default 'BacteriDex — Laboratorio Clínico',
  laboratorio_info text,
  logo_url text,
  profesional_nombre text,
  profesional_profesion text,
  profesional_registro text,
  profesional_cargo text,
  firma_url text,
  sello_url text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint lab_config_singleton check (id = 1)
);

insert into public.lab_config (id) values (1) on conflict (id) do nothing;

alter table public.lab_config enable row level security;

create policy "La configuración del laboratorio es visible para cualquier sesión"
  on public.lab_config for select
  using (true);

drop trigger if exists trg_lab_config_updated_at on public.lab_config;
create trigger trg_lab_config_updated_at
  before update on public.lab_config
  for each row execute function public.resultados_set_updated_at();

-- Nota: la subida real de logo/firma/sello (Storage) se implementa en la
-- Fase 9 (Imágenes y Admin). Por ahora `lab_config` guarda URLs de texto
-- que el administrador puede pegar manualmente desde /admin/config, y el
-- informe muestra un placeholder cuando no hay ninguna configurada.
