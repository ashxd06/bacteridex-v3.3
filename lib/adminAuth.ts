import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface VerificacionAdmin {
  error: string | null;
  status: 200 | 401 | 403 | 503;
  admin: SupabaseClient | null;
  userId: string | null;
}

// Misma verificación que ya usa app/api/admin/insertos y
// app/api/admin/usuarios: confirma con la service_role key (nunca con lo
// que diga el cliente) que quien llama tiene una sesión válida Y
// role = 'admin' en su propio perfil. Se usa desde todas las rutas nuevas
// del CMS (microorganismos, análisis, procedimientos) para no repetir esta
// lógica de seguridad en cada archivo.
export async function requireAdmin(req: NextRequest): Promise<VerificacionAdmin> {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { error: "El CMS no está configurado (faltan variables de Supabase en el servidor).", status: 503, admin: null, userId: null };
  }

  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) {
    return { error: "No autenticado.", status: 401, admin: null, userId: null };
  }

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) {
    return { error: "Sesión inválida.", status: 401, admin: null, userId: null };
  }

  const { data: perfil } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!perfil || perfil.role !== "admin") {
    return { error: "No autorizado. Se requiere una cuenta de administrador.", status: 403, admin: null, userId: null };
  }

  return { error: null, status: 200, admin, userId: userData.user.id };
}
