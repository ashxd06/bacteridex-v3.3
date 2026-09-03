import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Verifica que quien llama esté autenticado y que su propio perfil tenga
// role = 'admin'. Esta comprobación ocurre en el servidor con la
// service_role key; nunca se confía en un valor enviado desde el cliente.
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

export async function GET(req: NextRequest) {
  const verificacion = await requireAdmin(req);
  if (verificacion.error || !verificacion.admin) {
    return NextResponse.json({ error: verificacion.error }, { status: verificacion.status });
  }

  const { data, error } = await verificacion.admin
    .from("profiles")
    .select("id, username, role, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error listando usuarios:", error);
    return NextResponse.json({ error: "No se pudo obtener la lista de usuarios." }, { status: 500 });
  }

  return NextResponse.json({ usuarios: data });
}
