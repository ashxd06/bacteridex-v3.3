import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ResultadoAnalisis } from "@/lib/study/types";
import { analizarDocumento } from "@/lib/study/ai/provider";
import { ErrorProveedorIA, type SeleccionProveedor } from "@/lib/study/ai/tipos";

export const runtime = "nodejs";
export const maxDuration = 300; // el análisis de PDFs grandes puede tardar

// Esta ruta es la ÚNICA parte de BacteriDex Study que llama a la IA.
// Las claves (ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENAI_API_KEY) viven solo
// en el servidor (variables de entorno sin prefijo NEXT_PUBLIC_) y nunca se
// envían al navegador. La elección de proveedor/fallback vive en
// lib/study/ai/provider.ts.
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
        { error: "BacteriDex Study no está configurado en este despliegue todavía." },
        { status: 503 }
      );
    }

    // Verifica el token del usuario (emitido por Supabase Auth en el cliente).
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const documentId = body?.documentId as string | undefined;
    const proveedor = (body?.proveedor as SeleccionProveedor | undefined) || "automatico";
    if (!documentId) {
      return NextResponse.json({ error: "Falta el documento a analizar." }, { status: 400 });
    }

    // Verifica que el documento pertenezca al usuario que hace la petición
    // (el cliente admin ignora RLS, así que esta comprobación es obligatoria).
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
      await admin
        .from("study_documents")
        .update({ status: "error", error_mensaje: "No se pudo leer el archivo subido." })
        .eq("id", documentId);
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
          : new ErrorProveedorIA("claude", "Ocurrió un problema al analizar el documento.", false, err);
      await admin
        .from("study_documents")
        .update({ status: "error", error_mensaje: error.mensajeAmigable })
        .eq("id", documentId);
      return NextResponse.json(
        { error: error.mensajeAmigable, provider: error.proveedor, code: error.code },
        { status: 502 }
      );
    }

    // Persiste el material de estudio generado.
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

    if (filasContenido.length) await admin.from("study_content").insert(filasContenido);
    if (filasFlashcards.length) await admin.from("study_flashcards").insert(filasFlashcards);
    if (filasPreguntas.length) await admin.from("study_questions").insert(filasPreguntas);

    // El resto del material (resumen, conceptos, microorganismos, tablas,
    // imágenes) se guarda como un único bloque JSON adicional para no crear
    // más tablas de las propuestas originalmente.
    await admin.from("study_content").insert({
      document_id: documentId,
      user_id: userId,
      section: "material_completo",
      title: "Resultado completo del análisis",
      content: JSON.stringify(resultado),
      page_number: null
    });

    await admin
      .from("study_documents")
      .update({ status: "completado", page_count: resultado.paginas_analizadas ?? null })
      .eq("id", documentId);

    return NextResponse.json({ resultado, proveedorUsado, notas });
  } catch (err) {
    console.error("Error en /api/study/analizar:", err);
    return NextResponse.json(
      { error: "Ocurrió un problema al procesar el documento." },
      { status: 500 }
    );
  }
}
