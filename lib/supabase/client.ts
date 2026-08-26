"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente de Supabase para el navegador (autenticación + tablas personales).
// No toca la base de datos científica de BacteriDex (bacterias/virus/hongos/parasitos),
// que sigue viviendo en /data como siempre.

let cliente: SupabaseClient | null = null;

// true cuando las variables de entorno están configuradas. Si no lo están,
// BacteriDex sigue funcionando con normalidad como enciclopedia pública;
// simplemente las funciones de cuenta quedan deshabilitadas en vez de romper la app.
export const supabaseHabilitado =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseHabilitado) return null;
  if (cliente) return cliente;
  cliente = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
  return cliente;
}
