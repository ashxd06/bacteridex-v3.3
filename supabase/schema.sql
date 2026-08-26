-- ============================================================
-- BacteriDex — Esquema de cuentas (Supabase)
-- ============================================================
-- Ejecuta este script completo en Supabase → SQL Editor → New query → Run.
-- No toca ni reemplaza la base de datos científica de BacteriDex, que sigue
-- viviendo en los archivos /data del proyecto (JSON), no en Supabase.

-- 1) Perfiles ---------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Estudiante',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Los perfiles son visibles para su propio dueño"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Cada usuario crea solo su propio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Cada usuario actualiza solo su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- 2) Favoritos ---------------------------------------------------
-- Solo guarda una referencia al microorganismo (id + categoria), nunca la
-- ficha científica completa, que sigue viviendo en /data.
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organismo_id text not null,
  categoria text not null,
  created_at timestamptz not null default now(),
  unique (user_id, organismo_id)
);

alter table public.favorites enable row level security;

create policy "Cada usuario ve solo sus propios favoritos"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Cada usuario inserta solo sus propios favoritos"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propios favoritos"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- 3) Notas personales ---------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organismo_id text,
  titulo text not null,
  contenido text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Cada usuario ve solo sus propias notas"
  on public.notes for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea solo sus propias notas"
  on public.notes for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario actualiza solo sus propias notas"
  on public.notes for update
  using (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propias notas"
  on public.notes for delete
  using (auth.uid() = user_id);

-- 4) Historial de consultas ----------------------------------------
create table if not exists public.history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organismo_id text not null,
  categoria text not null,
  visitado_en timestamptz not null default now(),
  unique (user_id, organismo_id)
);

alter table public.history enable row level security;

create policy "Cada usuario ve solo su propio historial"
  on public.history for select
  using (auth.uid() = user_id);

create policy "Cada usuario inserta solo en su propio historial"
  on public.history for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario actualiza solo su propio historial"
  on public.history for update
  using (auth.uid() = user_id);

create policy "Cada usuario elimina solo su propio historial"
  on public.history for delete
  using (auth.uid() = user_id);

-- 5) Preferencias del usuario ----------------------------------------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tema text not null default 'dark',
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Cada usuario ve solo sus propias preferencias"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea solo sus propias preferencias"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario actualiza solo sus propias preferencias"
  on public.user_settings for update
  using (auth.uid() = user_id);

-- 6) Creación automática de perfil al registrarse -----------------------
-- (BacteriDex también intenta crear el perfil desde el frontend como respaldo,
-- pero este trigger es la vía principal y más confiable).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
