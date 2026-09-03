import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { formulaValida } from "@/lib/calc/evaluar";
import type { Calculadora } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin || !verificacion.userId) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await req.json().catch(() => null);
  const data = body?.data as Calculadora | undefined;
  const estado = body?.estado as "activo" | "archivado" | undefined;

  if (!data && !estado) {
    return NextResponse.json({ error: "No hay cambios que guardar." }, { status: 400 });
  }
  if (estado && estado !== "activo" && estado !== "archivado") {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const cambios: Record<string, unknown> = { updated_by: verificacion.userId };
  if (data) {
    if (!data.nombre) {
      return NextResponse.json({ error: "El registro no puede quedar sin nombre." }, { status: 400 });
    }
    if (!formulaValida(data.formula)) {
      return NextResponse.json({ error: "La fórmula tiene un error de sintaxis." }, { status: 400 });
    }
    cambios.data = data;
    cambios.numero = data.numero ?? 0;
    cambios.analisis_id = data.analisisId || null;
  }
  if (estado) cambios.estado = estado;

  const { error } = await verificacion.admin.from("cms_calculadoras").update(cambios).eq("id", params.id);
  if (error) {
    console.error("Error actualizando calculadora:", error);
    return NextResponse.json({ error: "No se pudo guardar el cambio." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const { error } = await verificacion.admin.from("cms_calculadoras").delete().eq("id", params.id);
  if (error) {
    console.error("Error eliminando calculadora:", error);
    return NextResponse.json({ error: "No se pudo eliminar el registro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
