import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import type { AnalisisClinico } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// Nota de nombre: esta ruta vive en /api/admin/analisis-cms (no
// /api/admin/analisis) para no chocar con el sistema de insertos existente,
// que ya usa el término "analisisId" en otro contexto (app/api/admin/insertos).

export async function GET(req: NextRequest) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const url = new URL(req.url);
  const categoria = url.searchParams.get("categoria");
  const estado = url.searchParams.get("estado");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  let query = verificacion.admin
    .from("cms_analisis")
    .select("id, categoria, numero, data, estado, created_at, updated_at")
    .order("categoria", { ascending: true })
    .order("numero", { ascending: true });

  if (categoria && categoria !== "todas") query = query.eq("categoria", categoria);
  if (estado && estado !== "todos") query = query.eq("estado", estado);

  const { data, error } = await query;
  if (error) {
    console.error("Error listando análisis:", error);
    return NextResponse.json({ error: "No se pudo cargar la lista." }, { status: 500 });
  }

  let filas = data ?? [];
  if (q) {
    filas = filas.filter((fila) => {
      const a = fila.data as AnalisisClinico;
      const texto = [a.nombre, a.descripcion, fila.id].join(" ").toLowerCase();
      return texto.includes(q);
    });
  }

  return NextResponse.json({ items: filas });
}

export async function POST(req: NextRequest) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin || !verificacion.userId) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await req.json().catch(() => null);
  const data = body?.data as AnalisisClinico | undefined;

  if (!data || !data.id || !data.categoria || !data.nombre) {
    return NextResponse.json({ error: "Faltan datos obligatorios (id, categoría o nombre)." }, { status: 400 });
  }
  if (!/^[a-z0-9_-]+$/i.test(data.id)) {
    return NextResponse.json({ error: "El id solo puede contener letras, números, guiones y guiones bajos." }, { status: 400 });
  }

  const { error } = await verificacion.admin.from("cms_analisis").insert({
    id: data.id,
    categoria: data.categoria,
    numero: data.numero ?? 0,
    data,
    estado: "activo",
    updated_by: verificacion.userId
  });

  if (error) {
    console.error("Error creando análisis:", error);
    const mensaje = error.code === "23505" ? "Ya existe un análisis con ese id." : "No se pudo crear el registro.";
    return NextResponse.json({ error: mensaje }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
