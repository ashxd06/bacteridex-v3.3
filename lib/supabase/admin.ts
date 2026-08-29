// Cliente de Supabase SOLO para uso en el servidor (Route Handlers de Next.js).
// Usa la service_role key, que NUNCA debe llegar al navegador: por eso este
// archivo se importa exclusivamente desde /app/api/**/route.ts.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  if (adminClient) return adminClient;
  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return adminClient;
}
