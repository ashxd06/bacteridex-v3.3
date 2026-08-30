import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// DELETE /api/study/eliminar
// Elimina un documento de study_documents Y su PDF fisico del bucket study-pdfs.
// Requiere autenticacion. Solo puede eliminar documentos propios.
// La operacion se hace en el servidor (service_role) para no exponer
// SUPABASE_SERVICE_ROLE_KEY al navegador ni depender de que el bucket sea publico.
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json(
        { error: "BacteriDex Study no esta configurado en este despliegue todavia." },
        { status: 503 }
      );
    }

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Sesion invalida." }, { status: 401 });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const documentId = body?.documentId as string | undefined;
    if (!documentId) {
      return NextResponse.json({ error: "Falta el documentId." }, { status: 400 });
    }

    // Obtiene el documento verificando que pertenezca al usuario.
    // El cliente admin ignora RLS, asi que la comprobacion manual es obligatoria.
    const { data: documento, error: docError } = await admin
      .from("study_documents")
      .select("id, user_id, storage_path")
      .eq("id", documentId)
      .single();

    if (docError || !documento) {
      return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    }
    if (documento.user_id !== userId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    // 1. Eliminar el PDF del bucket. No es fatal si falla (el registro se borra igual),
    //    pero se registra en consola para poder detectar acumulacion de archivos huerfanos.
    if (documento.storage_path) {
      const { error: storageError } = await admin.storage
        .from("study-pdfs")
        .remove([documento.storage_path]);
      if (storageError) {
        console.error(
          `[eliminar] No se pudo eliminar el PDF de Storage para el documento ${documentId}:`,
          storageError.message
        );
        // Continuamos igualmente para borrar el registro de BD.
      }
    }

    // 2. Eliminar el registro de BD (el CASCADE de FK borra study_content/flashcards/questions).
    const { error: deleteError } = await admin
      .from("study_documents")
      .delete()
      .eq("id", documentId);

    if (deleteError) {
      return NextResponse.json(
        { error: `No se pudo eliminar el documento: ${deleteError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("Error en /api/study/eliminar:", err);
    return NextResponse.json(
      { error: "Ocurrio un problema al eliminar el documento." },
      { status: 500 }
    );
  }
}
