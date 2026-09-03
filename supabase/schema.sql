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

-- ============================================================
-- BacteriDex Study — PDFs y material de estudio generado por IA
-- ============================================================
-- Añade estas tablas SIN tocar las anteriores (profiles, favorites, notes,
-- history, user_settings). Ejecuta este bloque también en el SQL Editor.

-- 7) Documentos subidos ------------------------------------------------
create table if not exists public.study_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  storage_path text not null,
  file_url text,
  file_size bigint not null default 0,
  page_count int,
  status text not null default 'subiendo', -- subiendo | analizando | completado | error
  error_mensaje text,
  created_at timestamptz not null default now()
);

alter table public.study_documents enable row level security;

create policy "Cada usuario ve solo sus propios documentos de Study"
  on public.study_documents for select
  using (auth.uid() = user_id);

create policy "Cada usuario crea solo sus propios documentos de Study"
  on public.study_documents for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario actualiza solo sus propios documentos de Study"
  on public.study_documents for update
  using (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propios documentos de Study"
  on public.study_documents for delete
  using (auth.uid() = user_id);

-- 8) Contenido generado (temas + el resultado completo del análisis) --
create table if not exists public.study_content (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.study_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  section text not null, -- 'tema' | 'material_completo'
  title text,
  content text not null,
  page_number int,
  created_at timestamptz not null default now()
);

alter table public.study_content enable row level security;

create policy "Cada usuario ve solo su propio contenido de Study"
  on public.study_content for select
  using (auth.uid() = user_id);

create policy "El servidor inserta contenido de Study"
  on public.study_content for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina solo su propio contenido de Study"
  on public.study_content for delete
  using (auth.uid() = user_id);

-- 9) Flashcards generadas ------------------------------------------------
create table if not exists public.study_flashcards (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.study_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  page_number int,
  created_at timestamptz not null default now()
);

alter table public.study_flashcards enable row level security;

create policy "Cada usuario ve solo sus propias flashcards de Study"
  on public.study_flashcards for select
  using (auth.uid() = user_id);

create policy "El servidor inserta flashcards de Study"
  on public.study_flashcards for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propias flashcards de Study"
  on public.study_flashcards for delete
  using (auth.uid() = user_id);

-- 10) Preguntas de examen generadas --------------------------------------
create table if not exists public.study_questions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.study_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  difficulty text,
  page_number int,
  created_at timestamptz not null default now()
);

alter table public.study_questions enable row level security;

create policy "Cada usuario ve solo sus propias preguntas de Study"
  on public.study_questions for select
  using (auth.uid() = user_id);

create policy "El servidor inserta preguntas de Study"
  on public.study_questions for insert
  with check (auth.uid() = user_id);

create policy "Cada usuario elimina solo sus propias preguntas de Study"
  on public.study_questions for delete
  using (auth.uid() = user_id);

-- 11) Bucket de almacenamiento para los PDFs -----------------------------
-- Crea el bucket manualmente en Supabase → Storage → New bucket → nombre
-- "study-pdfs" → privado (NO marcar como público). Luego ejecuta las
-- políticas de abajo para que cada usuario solo pueda leer/escribir dentro
-- de su propia carpeta (la app sube los archivos como "<user_id>/archivo.pdf").

create policy "Cada usuario sube PDFs solo a su propia carpeta"
  on storage.objects for insert
  with check (
    bucket_id = 'study-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Cada usuario lee solo los PDFs de su propia carpeta"
  on storage.objects for select
  using (
    bucket_id = 'study-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Cada usuario elimina solo los PDFs de su propia carpeta"
  on storage.objects for delete
  using (
    bucket_id = 'study-pdfs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- BacteriDex — Sistema de roles (admin / user)
-- ============================================================
-- No reemplaza ni elimina nada de lo anterior. Ejecuta este bloque también
-- en el SQL Editor de Supabase.

-- 12) Rol en la tabla de perfiles ya existente --------------------------
alter table public.profiles
  add column if not exists role text not null default 'user';

alter table public.profiles
  drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'admin'));

-- Protección crítica: un usuario NUNCA puede ascenderse a sí mismo a admin
-- desde la propia app, aunque manipule la petición desde el navegador. Solo
-- se permite cambiar el rol cuando la operación NO viene de una sesión de
-- usuario autenticado normal (auth.role() = 'authenticated'); es decir,
-- únicamente desde el SQL Editor de Supabase o desde el backend usando la
-- service_role key (lib/supabase/admin.ts), nunca desde el cliente.
create or replace function public.prevent_role_self_escalation()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if NEW.role is distinct from OLD.role and auth.role() = 'authenticated' then
    NEW.role := OLD.role;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_prevent_role_self_escalation on public.profiles;
create trigger trg_prevent_role_self_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_self_escalation();

-- Para convertir tu propia cuenta en administrador, ejecuta UNA VEZ en el
-- SQL Editor de Supabase (reemplazando el correo):
--
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
--
-- Esto funciona porque el SQL Editor corre con privilegios de administrador
-- de la base de datos, no como un usuario autenticado normal de la app.

-- ============================================================
-- BacteriDex — Biblioteca de Insertos (documentos de fabricante)
-- ============================================================
-- No reemplaza ni elimina nada de lo anterior. Ejecuta este bloque también
-- en el SQL Editor de Supabase.
--
-- A diferencia de los documentos de Study (privados, uno por usuario), los
-- insertos son material de referencia PÚBLICO: cualquier visitante de
-- BacteriDex puede consultarlos sin iniciar sesión, igual que el resto de
-- la enciclopedia. Solo un administrador puede subir, archivar o eliminar
-- un inserto, y esa operación se hace exclusivamente desde el backend
-- (app/api/admin/insertos) usando la service_role key — nunca directo desde
-- el navegador.

-- 13) Tabla de insertos ---------------------------------------------------
create table if not exists public.insertos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fabricante text not null,
  version text,
  fecha date,
  analisis_id text,
  storage_path text not null,
  file_size bigint not null default 0,
  estado text not null default 'vigente' check (estado in ('vigente', 'archivado')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.insertos enable row level security;

-- Lectura pública: cualquier visitante (con o sin sesión) puede ver la
-- biblioteca de insertos, igual que el resto de la enciclopedia.
create policy "Los insertos son visibles para todos"
  on public.insertos for select
  using (true);

-- Deliberadamente NO se crean políticas de insert/update/delete para roles
-- 'anon'/'authenticated': con RLS activado y sin esas políticas, ningún
-- cliente del navegador puede escribir en esta tabla, sin importar su rol.
-- Solo la service_role key (usada exclusivamente en app/api/admin/insertos)
-- puede insertar, actualizar o eliminar filas, y esa ruta ya verifica por su
-- cuenta que quien la llama tenga role = 'admin' en su perfil.

-- 14) Bucket de Storage para los PDFs de insertos -------------------------
-- Crea el bucket manualmente en Supabase → Storage → New bucket → nombre
-- "insertos-pdfs" → PÚBLICO (a diferencia de "study-pdfs", que es privado).
-- Luego ejecuta esta política para que cualquiera pueda leer los archivos:

create policy "Los PDFs de insertos son de lectura pública"
  on storage.objects for select
  using (bucket_id = 'insertos-pdfs');

-- No se agregan políticas de insert/update/delete para storage.objects en
-- este bucket: solo la service_role key (backend) puede escribir ahí.
