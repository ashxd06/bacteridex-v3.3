-- ============================================================
-- BacteriDex — CMS de contenido (Fase A)
-- ============================================================
-- No reemplaza ni elimina nada de supabase/schema.sql. Ejecuta este bloque
-- también en el SQL Editor de Supabase, DESPUÉS de haber ejecutado
-- schema.sql (necesita la tabla public.profiles y la función
-- prevent_role_self_escalation ya creadas).
--
-- DISEÑO: cada fila guarda el registro COMPLETO del microorganismo /
-- análisis / procedimiento como JSONB en la columna `data`, con la misma
-- forma que los tipos Organismo / AnalisisClinico / Procedimiento de
-- lib/types.ts. Así el CMS no necesita una columna SQL por cada campo (y
-- puede evolucionar sin migraciones nuevas cada vez que se agregue un campo
-- al tipo), y lib/content.ts puede castear `data` directamente al tipo de
-- TypeScript correspondiente.
--
-- Las columnas sueltas (categoria, numero, estado) existen solo para poder
-- filtrar/ordenar eficientemente sin tener que parsear el JSONB completo.
--
-- Seguridad: exactamente igual que la tabla `insertos` ya existente.
-- RLS activado + política de SELECT pública solo para estado = 'activo'.
-- Deliberadamente NO se crean políticas de insert/update/delete: con RLS
-- activo y sin esas políticas, ningún cliente del navegador (anon o
-- authenticated) puede escribir, sin importar su rol. Solo la
-- service_role key (usada exclusivamente en app/api/admin/**) puede
-- escribir, y esas rutas ya verifican por su cuenta que quien llama tenga
-- role = 'admin' en su perfil (ver lib/adminAuth.ts).

create or replace function public.cms_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  NEW.updated_at := now();
  return NEW;
end;
$$;

-- 1) Microorganismos (bacterias / virus / hongos / parasitos) ------------
create table if not exists public.cms_microorganismos (
  id text primary key,
  categoria text not null check (categoria in ('bacterias', 'virus', 'hongos', 'parasitos')),
  numero int not null default 0,
  data jsonb not null,
  estado text not null default 'activo' check (estado in ('activo', 'archivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.cms_microorganismos enable row level security;

drop policy if exists "Microorganismos activos son públicos" on public.cms_microorganismos;
create policy "Microorganismos activos son públicos"
  on public.cms_microorganismos for select
  using (estado = 'activo');

drop trigger if exists trg_cms_microorganismos_updated_at on public.cms_microorganismos;
create trigger trg_cms_microorganismos_updated_at
  before update on public.cms_microorganismos
  for each row execute function public.cms_set_updated_at();

create index if not exists idx_cms_microorganismos_categoria on public.cms_microorganismos (categoria, numero);

-- 2) Análisis clínicos ----------------------------------------------------
create table if not exists public.cms_analisis (
  id text primary key,
  categoria text not null,
  numero int not null default 0,
  data jsonb not null,
  estado text not null default 'activo' check (estado in ('activo', 'archivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.cms_analisis enable row level security;

drop policy if exists "Análisis activos son públicos" on public.cms_analisis;
create policy "Análisis activos son públicos"
  on public.cms_analisis for select
  using (estado = 'activo');

drop trigger if exists trg_cms_analisis_updated_at on public.cms_analisis;
create trigger trg_cms_analisis_updated_at
  before update on public.cms_analisis
  for each row execute function public.cms_set_updated_at();

create index if not exists idx_cms_analisis_categoria on public.cms_analisis (categoria, numero);

-- 3) Procedimientos de laboratorio ----------------------------------------
create table if not exists public.cms_procedimientos (
  id text primary key,
  categoria text not null,
  numero int not null default 0,
  data jsonb not null,
  estado text not null default 'activo' check (estado in ('activo', 'archivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.cms_procedimientos enable row level security;

drop policy if exists "Procedimientos activos son públicos" on public.cms_procedimientos;
create policy "Procedimientos activos son públicos"
  on public.cms_procedimientos for select
  using (estado = 'activo');

drop trigger if exists trg_cms_procedimientos_updated_at on public.cms_procedimientos;
create trigger trg_cms_procedimientos_updated_at
  before update on public.cms_procedimientos
  for each row execute function public.cms_set_updated_at();

create index if not exists idx_cms_procedimientos_categoria on public.cms_procedimientos (categoria, numero);

-- ============================================================
-- Sembrado inicial: ejecuta `node scripts/seed-cms.mjs` (ver el archivo,
-- necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu
-- entorno) para copiar el contenido actual de /data/*.json a estas tablas.
-- Sin este paso, las tablas quedan vacías y BacteriDex sigue funcionando
-- con normalidad leyendo directamente los JSON (ver lib/content.ts).
-- ============================================================
