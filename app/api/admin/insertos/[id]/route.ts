import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) return { error: "No configurado.", status: 503 as const, admin: null };

  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return { error: "No autenticado.", status: 401 as const, admin: null };

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: "Sesión inválida.", status: 401 as const, admin: null };
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!perfil || perfil.role !== "admin") {
    return { error: "No autorizado.", status: 403 as const, admin: null };
  }

  return { error: null, status: 200 as const, admin };
}

// Cambia el estado del inserto entre 'vigente' y 'archivado'. No elimina
// nada: así se conservan las versiones anteriores, como pediste.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await req.json();
  const estado = body?.estado;
  if (estado !== "vigente" && estado !== "archivado") {
    return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
  }

  const { error } = await verificacion.admin.from("insertos").update({ estado }).eq("id", params.id);
  if (error) {
    console.error("Error actualizando inserto:", error);
    return NextResponse.json({ error: "No se pudo actualizar el inserto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// Elimina definitivamente un inserto (archivo + fila). El frontend pide
// confirmación explícita antes de llamar a este endpoint.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const { data: fila } = await verificacion.admin
    .from("insertos")
    .select("storage_path")
    .eq("id", params.id)
    .maybeSingle();

  if (fila?.storage_path) {
    await verificacion.admin.storage.from("insertos-pdfs").remove([fila.storage_path]);
  }

  const { error } = await verificacion.admin.from("insertos").delete().eq("id", params.id);
  if (error) {
    console.error("Error eliminando inserto:", error);
    return NextResponse.json({ error: "No se pudo eliminar el inserto." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
