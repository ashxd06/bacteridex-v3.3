"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

export interface InsertoFila {
  id: string;
  nombre: string;
  fabricante: string;
  version: string | null;
  fecha: string | null;
  analisis_id: string | null;
  storage_path: string;
  file_size: number;
  estado: "vigente" | "archivado";
  created_at: string;
}

// Los insertos son públicos: cualquier visitante puede listarlos y abrirlos,
// con o sin sesión iniciada (bucket "insertos-pdfs" configurado como público
// en Supabase Storage).
export function urlPublicaInserto(storagePath: string): string | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const { data } = supabase.storage.from("insertos-pdfs").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function listarInsertos(): Promise<InsertoFila[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("insertos")
    .select("id, nombre, fabricante, version, fecha, analisis_id, storage_path, file_size, estado, created_at")
    .order("created_at", { ascending: false });
  return (data as InsertoFila[]) ?? [];
}
