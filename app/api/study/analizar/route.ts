import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ResultadoAnalisis } from "@/lib/study/types";
import { analizarDocumento } from "@/lib/study/ai/provider";
import { ErrorProveedorIA, esSeleccionValida } from "@/lib/study/ai/tipos";

export const runtime = "nodejs";
export const maxDuration = 300; // el analisis de PDFs grandes puede tardar

// Esta ruta es la UNICA parte de BacteriDex Study que llama a la IA.
// Las claves (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY) viven solo
// en el servidor (variables de entorno sin prefijo NEXT_PUBLIC_) y nunca se
// envian al navegador. La eleccion de proveedor/fallback vive en
// lib/study/ai/provider.ts.

/** Marca el documento como "error" en BD. Nunca lanza excepcion. */
async function marcarError(
  admin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  documentId: string,
  mensaje: string
): Promise<void> {
  try {
    await admin
      .from("study_documents")
      .update({ status: "error", error_mensaje: mensaje })
      .eq("id", documentId);
  } catch {
    console.error(`[analizar] No se pudo marcar el documento ${documentId} como error.`);
  }
}

export async function POST(req: NextRequest) {
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

    // Verifica el token del usuario (emitido por Supabase Auth en el cliente).
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Sesion invalida." }, { status: 401 });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const documentId = body?.documentId as string | undefined;

    // --- Validacion de runtime del proveedor (el cast TS no basta) ---
    const proveedorRaw: unknown = body?.proveedor;
    if (proveedorRaw !== undefined && !esSeleccionValida(proveedorRaw)) {
      return NextResponse.json(
        {
          error: `Proveedor de IA no valido: "${String(proveedorRaw)}". Valores permitidos: automatico, claude, gemini, openai.`
        },
        { status: 400 }
      );
    }
    const proveedor = esSeleccionValida(proveedorRaw) ? proveedorRaw : "automatico";

    if (!documentId) {
      return NextResponse.json({ error: "Falta el documento a analizar." }, { status: 400 });
    }

    // Verifica que el documento pertenezca al usuario que hace la peticion
    // (el cliente admin ignora RLS, asi que esta comprobacion es obligatoria).
    const { data: documento, error: docError } = await admin
      .from("study_documents")
      .select("id, user_id, storage_path, filename")
      .eq("id", documentId)
      .single();

    if (docError || !documento) {
      return NextResponse.json({ error: "Documento no encontrado." }, { status: 404 });
    }
    if (documento.user_id !== userId) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    // Descarga el PDF desde Supabase Storage.
    const { data: archivo, error: descargaError } = await admin.storage
      .from("study-pdfs")
      .download(documento.storage_path);

    if (descargaError || !archivo) {
      await marcarError(admin, documentId, "No se pudo leer el archivo subido.");
      return NextResponse.json({ error: "No se pudo leer el archivo subido." }, { status: 500 });
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const base64 = buffer.toString("base64");

    let resultado: ResultadoAnalisis;
    let proveedorUsado: string;
    let notas: string[] = [];

    try {
      const orquestacion = await analizarDocumento(proveedor, base64, documento.filename);
      resultado = orquestacion.resultado;
      proveedorUsado = orquestacion.proveedorUsado;
      notas = orquestacion.notas;
    } catch (err) {
      const error =
        err instanceof ErrorProveedorIA
          ? err
          : new ErrorProveedorIA("claude", "Ocurrio un problema al analizar el documento.", false, err);
      await marcarError(admin, documentId, error.mensajeAmigable);
      return NextResponse.json(
        { error: error.mensajeAmigable, provider: error.proveedor, code: error.code },
        { status: 502 }
      );
    }

    // Persiste el material de estudio generado.
    // Si falla cualquier paso, el documento se marca como "error" para que el
    // usuario pueda reintentarlo --- evita el estado zombie "analizando".
    try {
      const filasContenido = (resultado.temas || []).map((t) => ({
        document_id: documentId,
        user_id: userId,
        section: "tema",
        title: t.titulo,
        content: JSON.stringify(t),
        page_number: t.pagina
      }));

      const filasFlashcards = (resultado.flashcards || []).map((f) => ({
        document_id: documentId,
        user_id: userId,
        question: f.pregunta,
        answer: f.respuesta,
        page_number: f.pagina
      }));

      const filasPreguntas = (resultado.preguntas || []).map((p) => ({
        document_id: documentId,
        user_id: userId,
        question: p.pregunta,
        options: p.opciones,
        correct_answer: p.respuesta_correcta,
        explanation: p.explicacion,
        difficulty: p.dificultad,
        page_number: p.pagina
      }));

      if (filasContenido.length) {
        const { error: e } = await admin.from("study_content").insert(filasContenido);
        if (e) throw new Error(`Error insertando temas: ${e.message}`);
      }
      if (filasFlashcards.length) {
        const { error: e } = await admin.from("study_flashcards").insert(filasFlashcards);
        if (e) throw new Error(`Error insertando flashcards: ${e.message}`);
      }
      if (filasPreguntas.length) {
        const { error: e } = await admin.from("study_questions").insert(filasPreguntas);
        if (e) throw new Error(`Error insertando preguntas: ${e.message}`);
      }

      // El resto del material (resumen, conceptos, microorganismos, tablas,
      // imagenes) se guarda como un unico bloque JSON adicional para no crear
      // mas tablas de las propuestas originalmente.
      const { error: eMat } = await admin.from("study_content").insert({
        document_id: documentId,
        user_id: userId,
        section: "material_completo",
        title: "Resultado completo del analisis",
        content: JSON.stringify(resultado),
        page_number: null
      });
      if (eMat) throw new Error(`Error insertando material completo: ${eMat.message}`);

      const { error: eStatus } = await admin
        .from("study_documents")
        .update({ status: "completado", page_count: resultado.paginas_analizadas ?? null })
        .eq("id", documentId);
      if (eStatus) throw new Error(`Error actualizando estado: ${eStatus.message}`);

    } catch (persistErr) {
      console.error("[analizar] Error persistiendo resultado:", persistErr);
      const msg =
        persistErr instanceof Error
          ? `El analisis fue correcto pero no se pudo guardar: ${persistErr.message}`
          : "El analisis fue correcto pero no se pudo guardar el resultado.";
      await marcarError(admin, documentId, msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // El cliente solo necesita el documentId para navegar y las notas del proceso.
    // El resultado completo ya esta en Supabase y se carga desde /study/[id].
    return NextResponse.json({ ok: true, documentId, proveedorUsado, notas });

  } catch (err) {
    console.error("Error en /api/study/analizar:", err);
    return NextResponse.json(
      { error: "Ocurrio un problema al procesar el documento." },
      { status: 500 }
    );
  }
}
