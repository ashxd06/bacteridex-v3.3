-- ============================================================
-- BacteriDex — Módulo de Laboratorio (Resultados y Configuración)
-- ============================================================
-- Ejecuta este script en Supabase → SQL Editor → New query → Run.

-- 1) Tabla de Informes de Laboratorio ---------------------------
create table if not exists public.lab_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report_number text not null,
  patient_name text not null,
  patient_document text,
  patient_age text,
  patient_gender text,
  sample_date date not null,
  sample_time text,
  sample_type text,
  doctor_name text,
  items jsonb not null default '[]'::jsonb,
  observations text,
  professional_name text,
  professional_title text,
  professional_id text,
  created_at timestamptz not null default now()
);

-- Hacer que el unique constraint sea idempotente
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'lab_reports_number_unique') then
    alter table public.lab_reports add constraint lab_reports_number_unique unique (report_number);
  end if;
end $$;

alter table public.lab_reports enable row level security;

drop policy if exists "Cada usuario ve solo sus propios informes" on public.lab_reports;
create policy "Cada usuario ve solo sus propios informes"
  on public.lab_reports for select
  using (auth.uid() = user_id);

drop policy if exists "Cada usuario crea solo sus propios informes" on public.lab_reports;
create policy "Cada usuario crea solo sus propios informes"
  on public.lab_reports for insert
  with check (auth.uid() = user_id);

drop policy if exists "Cada usuario actualiza solo sus propios informes" on public.lab_reports;
create policy "Cada usuario actualiza solo sus propios informes"
  on public.lab_reports for update
  using (auth.uid() = user_id);

drop policy if exists "Cada usuario elimina solo sus propios informes" on public.lab_reports;
create policy "Cada usuario elimina solo sus propios informes"
  on public.lab_reports for delete
  using (auth.uid() = user_id);


-- 1.5) Secuencia atómica para numeración de informes -------------
create table if not exists public.lab_report_seq (
  year int primary key,
  last_value int not null default 0
);

-- Denegar acceso directo a la tabla de secuencias
revoke all on table public.lab_report_seq from anon, authenticated, public;

-- Función RPC para generar número sin colisiones
create or replace function public.get_next_lab_report_number(report_year int)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_val int;
  formatted_number text;
begin
  -- Validación de seguridad básica para el año
  if report_year < 2000 or report_year > 2100 then
    raise exception 'Año de reporte inválido';
  end if;

  -- Upsert atómico que bloquea la fila para escritura concurrente
  insert into public.lab_report_seq (year, last_value)
  values (report_year, 1)
  on conflict (year) do update
  set last_value = public.lab_report_seq.last_value + 1
  returning last_value into next_val;

  formatted_number := 'LAB-' || report_year::text || '-' || lpad(next_val::text, 5, '0');
  return formatted_number;
end;
$$;

-- Restringir ejecución de la función solo a usuarios autenticados
revoke all on function public.get_next_lab_report_number(int) from public;
grant execute on function public.get_next_lab_report_number(int) to authenticated;


-- 2) Tabla de Configuración de Laboratorio -----------------------
create table if not exists public.lab_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  professional_name text,
  professional_title text,
  professional_id text,
  signature_url text,
  stamp_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lab_settings enable row level security;

drop policy if exists "Cada usuario ve solo su configuración de laboratorio" on public.lab_settings;
create policy "Cada usuario ve solo su configuración de laboratorio"
  on public.lab_settings for select
  using (auth.uid() = user_id);

drop policy if exists "Cada usuario inserta su propia configuración" on public.lab_settings;
create policy "Cada usuario inserta su propia configuración"
  on public.lab_settings for insert
  with check (auth.uid() = user_id);

drop policy if exists "Cada usuario actualiza su propia configuración" on public.lab_settings;
create policy "Cada usuario actualiza su propia configuración"
  on public.lab_settings for update
  using (auth.uid() = user_id);


-- 3) Bucket de Storage para firmas y sellos ---------------------
-- IMPORTANTE: Antes de correr esto, crea el bucket manualmente 
-- en Supabase -> Storage -> New Bucket -> 'lab-assets' -> Privado.

drop policy if exists "Usuarios suben assets a su propia carpeta" on storage.objects;
create policy "Usuarios suben assets a su propia carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'lab-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios leen assets de su propia carpeta" on storage.objects;
create policy "Usuarios leen assets de su propia carpeta"
  on storage.objects for select
  using (
    bucket_id = 'lab-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios actualizan assets de su propia carpeta" on storage.objects;
create policy "Usuarios actualizan assets de su propia carpeta"
  on storage.objects for update
  using (
    bucket_id = 'lab-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Usuarios eliminan assets de su propia carpeta" on storage.objects;
create policy "Usuarios eliminan assets de su propia carpeta"
  on storage.objects for delete
  using (
    bucket_id = 'lab-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
