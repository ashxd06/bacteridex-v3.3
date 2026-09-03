import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import type { Organismo } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

// PATCH body:
//   { data: Organismo }                    → reemplaza el contenido completo
//   { estado: "activo" | "archivado" }      → archivar / restaurar
// (pueden combinarse en el mismo body)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin || !verificacion.userId) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await req.json().catch(() => null);
  const data = body?.data as Organismo | undefined;
  const estado = body?.estado as "activo" | "archivado" | undefined;

  if (!data && !estado) {
    return NextResponse.json({ error: "No hay cambios que guardar." }, { status: 400 });
  }
  if (estado && estado !== "activo" && estado !== "archivado") {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const cambios: Record<string, unknown> = { updated_by: verificacion.userId };
  if (data) {
    if (!data.nombreCientifico || !data.categoria) {
      return NextResponse.json({ error: "El registro no puede quedar sin nombre científico o categoría." }, { status: 400 });
    }
    cambios.data = data;
    cambios.categoria = data.categoria;
    cambios.numero = data.numero ?? 0;
  }
  if (estado) cambios.estado = estado;

  const { error } = await verificacion.admin
    .from("cms_microorganismos")
    .update(cambios)
    .eq("id", params.id);

  if (error) {
    console.error("Error actualizando microorganismo:", error);
    return NextResponse.json({ error: "No se pudo guardar el cambio." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE: elimina definitivamente. El frontend debe confirmar antes de llamar esto.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const { error } = await verificacion.admin.from("cms_microorganismos").delete().eq("id", params.id);
  if (error) {
    console.error("Error eliminando microorganismo:", error);
    return NextResponse.json({ error: "No se pudo eliminar el registro." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
