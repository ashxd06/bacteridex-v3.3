import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const maxDuration = 30;

const CAMPOS_PERMITIDOS = [
  "laboratorio_nombre",
  "laboratorio_info",
  "logo_url",
  "profesional_nombre",
  "profesional_profesion",
  "profesional_registro",
  "profesional_cargo",
  "firma_url",
  "sello_url"
] as const;

export async function PATCH(req: NextRequest) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin || !verificacion.userId) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Body inválido." }, { status: 400 });
  }

  const cambios: Record<string, unknown> = { updated_by: verificacion.userId };
  for (const campo of CAMPOS_PERMITIDOS) {
    if (campo in body) cambios[campo] = body[campo] || null;
  }
  if (typeof cambios.laboratorio_nombre === "string" && !cambios.laboratorio_nombre.trim()) {
    return NextResponse.json({ error: "El nombre del laboratorio no puede quedar vacío." }, { status: 400 });
  }

  const { error } = await verificacion.admin.from("lab_config").update(cambios).eq("id", 1);
  if (error) {
    console.error("Error actualizando lab_config:", error);
    return NextResponse.json({ error: "No se pudo guardar la configuración." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
