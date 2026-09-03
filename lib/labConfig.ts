"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { LabConfig } from "@/lib/types";

// Configuración institucional (nombre del laboratorio, logo, datos del
// profesional, firma y sello). Lectura pública vía RLS — ver
// supabase/schema_resultados.sql. Solo /admin/config puede escribirla
// (usa el backend con service_role, igual que el resto del CMS).
export async function getLabConfig(): Promise<LabConfig | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("lab_config").select("*").eq("id", 1).maybeSingle();
  if (error || !data) return null;
  return data as LabConfig;
}
