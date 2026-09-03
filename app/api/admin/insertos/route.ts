import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const maxDuration = 60;

// Misma verificación que /api/admin/usuarios: confirma con la service_role
// key que quien llama tiene role = 'admin' en su propio perfil.
async function requireAdmin(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) return { error: "No configurado.", status: 503 as const, admin: null, userId: null };

  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return { error: "No autenticado.", status: 401 as const, admin: null, userId: null };

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: "Sesión inválida.", status: 401 as const, admin: null, userId: null };
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!perfil || perfil.role !== "admin") {
    return { error: "No autorizado.", status: 403 as const, admin: null, userId: null };
  }

  return { error: null, status: 200 as const, admin, userId: userData.user.id };
}

// Crea un inserto nuevo: sube el PDF a Storage y registra la fila en la
// tabla, todo en el servidor con la service_role key.
export async function POST(req: NextRequest) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin || !verificacion.userId) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const body = await req.json();
  const { nombre, fabricante, version, fecha, analisisId, filename, fileBase64 } = body ?? {};

  if (!nombre || !fabricante || !filename || !fileBase64) {
    return NextResponse.json({ error: "Faltan datos obligatorios (nombre, fabricante o archivo)." }, { status: 400 });
  }

  const buffer = Buffer.from(fileBase64, "base64");
  const rutaStorage = `${Date.now()}-${String(filename).replace(/[^\w.\-]/g, "_")}`;

  const { error: subidaError } = await verificacion.admin.storage
    .from("insertos-pdfs")
    .upload(rutaStorage, buffer, { contentType: "application/pdf", upsert: false });

  if (subidaError) {
    console.error("Error subiendo inserto:", subidaError);
    return NextResponse.json({ error: "No se pudo subir el PDF." }, { status: 500 });
  }

  const { data: fila, error: insertError } = await verificacion.admin
    .from("insertos")
    .insert({
      nombre,
      fabricante,
      version: version || null,
      fecha: fecha || null,
      analisis_id: analisisId || null,
      storage_path: rutaStorage,
      file_size: buffer.byteLength,
      created_by: verificacion.userId
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Error registrando inserto:", insertError);
    return NextResponse.json({ error: "No se pudo registrar el inserto." }, { status: 500 });
  }

  return NextResponse.json({ id: fila.id });
}
