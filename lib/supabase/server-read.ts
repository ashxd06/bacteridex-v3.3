// Cliente de Supabase para LECTURA pública desde el servidor (Server
// Components / route handlers). Usa la clave anon, igual que el navegador,
// así que respeta RLS: solo puede leer lo que las políticas de SELECT
// permiten ver a cualquiera (p. ej. estado = 'activo' en las tablas cms_*).
// Nunca debe usarse para escribir — para eso existe lib/supabase/admin.ts.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let clientePublico: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (clientePublico) return clientePublico;
  clientePublico = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return clientePublico;
}
