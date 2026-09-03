import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { formulaValida } from "@/lib/calc/evaluar";
import type { Calculadora } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const url = new URL(req.url);
  const estado = url.searchParams.get("estado");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  let query = verificacion.admin
    .from("cms_calculadoras")
    .select("id, numero, analisis_id, data, estado, created_at, updated_at")
    .order("numero", { ascending: true });

  if (estado && estado !== "todos") query = query.eq("estado", estado);

  const { data, error } = await query;
  if (error) {
    console.error("Error listando calculadoras:", error);
    return NextResponse.json({ error: "No se pudo cargar la lista." }, { status: 500 });
  }

  let filas = data ?? [];
  if (q) {
    filas = filas.filter((fila) => {
      const c = fila.data as Calculadora;
      return [c.nombre, c.descripcion, fila.id].join(" ").toLowerCase().includes(q);
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
  const data = body?.data as Calculadora | undefined;

  if (!data || !data.id || !data.nombre) {
    return NextResponse.json({ error: "Faltan datos obligatorios (id o nombre)." }, { status: 400 });
  }
  if (!/^[a-z0-9_-]+$/i.test(data.id)) {
    return NextResponse.json({ error: "El id solo puede contener letras, números, guiones y guiones bajos." }, { status: 400 });
  }
  if (!formulaValida(data.formula)) {
    return NextResponse.json({ error: "La fórmula tiene un error de sintaxis." }, { status: 400 });
  }

  const { error } = await verificacion.admin.from("cms_calculadoras").insert({
    id: data.id,
    numero: data.numero ?? 0,
    analisis_id: data.analisisId || null,
    data,
    estado: "activo",
    updated_by: verificacion.userId
  });

  if (error) {
    console.error("Error creando calculadora:", error);
    const mensaje = error.code === "23505" ? "Ya existe una calculadora con ese id." : "No se pudo crear el registro.";
    return NextResponse.json({ error: mensaje }, { status: error.code === "23505" ? 409 : 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
