// Capa de datos "pública" para el contenido administrable por el CMS
// (microorganismos, análisis clínicos, procedimientos).
//
// Por qué existe este archivo y no se reutiliza lib/data.ts directamente:
// lib/data.ts importa los JSON con `import ... from "@/data/x.json"`, que
// Next.js incrusta en el bundle EN TIEMPO DE BUILD. Eso significa que un
// admin podría editar contenido desde /admin, pero el sitio público jamás
// reflejaría el cambio hasta un nuevo despliegue. Para que el CMS sirva de
// algo, la lectura pública tiene que ser dinámica.
//
// Estrategia (conservadora, ver notas de la Fase A):
//   1. Si Supabase está configurado Y la tabla cms_* tiene filas activas,
//      se usa Supabase (fuente editable desde /admin).
//   2. Si no, se usa el JSON tal cual como hasta ahora (comportamiento
//      idéntico al actual; ningún despliegue sin Supabase se rompe).
//
// Los tipos devueltos son EXACTAMENTE Organismo / AnalisisClinico /
// Procedimiento de lib/types.ts en ambos casos, así que los componentes que
// consumen estas funciones no necesitan saber de dónde vino el dato.
import { getSupabasePublic } from "@/lib/supabase/server-read";
import {
  bacterias as bacteriasJSON,
  virus as virusJSON,
  hongos as hongosJSON,
  parasitos as parasitosJSON,
  analisisClinicos as analisisJSON,
  procedimientos as procedimientosJSON
} from "@/lib/data";
import type { Organismo, Categoria, AnalisisClinico, Procedimiento, Calculadora } from "@/lib/types";

function jsonPorCategoria(categoria: Categoria): Organismo[] {
  switch (categoria) {
    case "bacterias":
      return bacteriasJSON;
    case "virus":
      return virusJSON;
    case "hongos":
      return hongosJSON;
    case "parasitos":
      return parasitosJSON;
    default:
      return [];
  }
}

export async function getMicroorganismosPorCategoria(categoria: Categoria): Promise<Organismo[]> {
  const supabase = getSupabasePublic();
  if (supabase) {
    const { data, error } = await supabase
      .from("cms_microorganismos")
      .select("data")
      .eq("categoria", categoria)
      .eq("estado", "activo")
      .order("numero", { ascending: true });
    if (error) {
      console.error("content.ts: error leyendo cms_microorganismos:", error.message);
    } else if (data && data.length > 0) {
      return data.map((fila) => fila.data as Organismo);
    }
  }
  return jsonPorCategoria(categoria);
}

export async function getMicroorganismo(categoria: Categoria, id: string): Promise<Organismo | undefined> {
  const lista = await getMicroorganismosPorCategoria(categoria);
  return lista.find((o) => o.id === id);
}

export async function getTodosLosMicroorganismos(): Promise<Organismo[]> {
  const [bacterias, virus, hongos, parasitos] = await Promise.all([
    getMicroorganismosPorCategoria("bacterias"),
    getMicroorganismosPorCategoria("virus"),
    getMicroorganismosPorCategoria("hongos"),
    getMicroorganismosPorCategoria("parasitos")
  ]);
  return [...bacterias, ...virus, ...hongos, ...parasitos];
}

export async function getMicroorganismoPorId(id: string): Promise<Organismo | undefined> {
  const todos = await getTodosLosMicroorganismos();
  return todos.find((o) => o.id === id);
}

export async function getAnalisisClinicos(): Promise<AnalisisClinico[]> {
  const supabase = getSupabasePublic();
  if (supabase) {
    const { data, error } = await supabase
      .from("cms_analisis")
      .select("data")
      .eq("estado", "activo")
      .order("numero", { ascending: true });
    if (error) {
      console.error("content.ts: error leyendo cms_analisis:", error.message);
    } else if (data && data.length > 0) {
      return data.map((fila) => fila.data as AnalisisClinico);
    }
  }
  return analisisJSON;
}

export async function getAnalisisPorId(id: string): Promise<AnalisisClinico | undefined> {
  const lista = await getAnalisisClinicos();
  return lista.find((a) => a.id === id);
}

export async function getProcedimientosLab(): Promise<Procedimiento[]> {
  const supabase = getSupabasePublic();
  if (supabase) {
    const { data, error } = await supabase
      .from("cms_procedimientos")
      .select("data")
      .eq("estado", "activo")
      .order("numero", { ascending: true });
    if (error) {
      console.error("content.ts: error leyendo cms_procedimientos:", error.message);
    } else if (data && data.length > 0) {
      return data.map((fila) => fila.data as Procedimiento);
    }
  }
  return procedimientosJSON;
}

export async function getProcedimientoPorId(id: string): Promise<Procedimiento | undefined> {
  const lista = await getProcedimientosLab();
  return lista.find((p) => p.id === id);
}

// Calculadoras (Fase 3): no existe JSON de respaldo porque es contenido
// nuevo — si Supabase no está configurado o la tabla está vacía, la lista
// pública simplemente queda vacía (no se inventan calculadoras).
export async function getCalculadoras(): Promise<Calculadora[]> {
  const supabase = getSupabasePublic();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cms_calculadoras")
    .select("data")
    .eq("estado", "activo")
    .order("numero", { ascending: true });
  if (error) {
    console.error("content.ts: error leyendo cms_calculadoras:", error.message);
    return [];
  }
  return (data ?? []).map((fila) => fila.data as Calculadora);
}

export async function getCalculadoraPorId(id: string): Promise<Calculadora | undefined> {
  const lista = await getCalculadoras();
  return lista.find((c) => c.id === id);
}

export async function getCalculadoraPorAnalisisId(analisisId: string): Promise<Calculadora | undefined> {
  const lista = await getCalculadoras();
  return lista.find((c) => c.analisisId === analisisId);
}
