import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT_STUDY } from "@/lib/study/prompt";
import type { ResultadoAnalisis } from "@/lib/study/types";
import { ErrorProveedorIA, type CodigoErrorIA } from "./tipos";

// gemini-2.0-flash fue retirado por Google; el modelo vigente configurado es
// gemini-3.6-flash. Se puede sobrescribir con STUDY_AI_MODEL_GEMINI si
// Google publica un modelo más nuevo en el futuro, sin tocar este archivo.
const MODELO = process.env.STUDY_AI_MODEL_GEMINI || "gemini-3.6-flash";

const MENSAJE_MODELO_NO_DISPONIBLE =
  "El modelo de Gemini seleccionado ya no está disponible. Se requiere actualizar la configuración del modelo.";
const MENSAJE_CUOTA_GEMINI =
  "Gemini alcanzó su límite de uso o cuota disponible. Intenta nuevamente más tarde o revisa tu cuota de Google AI.";
const MENSAJE_AUTH =
  "La IA seleccionada no está configurada correctamente. Revisa las variables de entorno del servidor.";

function clasificarErrorGemini(mensaje: string): {
  code: CodigoErrorIA;
  mensajeAmigable: string;
  reintentable: boolean;
} {
  const m = mensaje.toLowerCase();

  if (
    m.includes("404") ||
    m.includes("not found") ||
    m.includes("no longer available") ||
    m.includes("model not found") ||
    m.includes("modelo no disponible")
  ) {
    return { code: "modelo_no_disponible", mensajeAmigable: MENSAJE_MODELO_NO_DISPONIBLE, reintentable: true };
  }
  if (
    m.includes("quota") ||
    m.includes("resource_exhausted") ||
    m.includes("rate limit") ||
    m.includes("too many requests") ||
    m.includes("billing") ||
    m.includes("429")
  ) {
    return { code: "cuota_excedida", mensajeAmigable: MENSAJE_CUOTA_GEMINI, reintentable: true };
  }
  if (
    m.includes("api key") ||
    m.includes("unauthenticated") ||
    m.includes("permission") ||
    m.includes("401") ||
    m.includes("403")
  ) {
    return { code: "api_key_invalida", mensajeAmigable: MENSAJE_AUTH, reintentable: true };
  }
  if (m.includes("unavailable") || m.includes("timeout") || m.includes("internal") || m.includes("503")) {
    return { code: "error_desconocido", mensajeAmigable: "Gemini no está disponible en este momento.", reintentable: true };
  }
  return { code: "error_desconocido", mensajeAmigable: "Gemini no está disponible en este momento.", reintentable: false };
}

export async function analizarConGemini(base64: string, filename: string): Promise<ResultadoAnalisis> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ErrorProveedorIA(
      "gemini",
      "Este proveedor de IA no está configurado actualmente.",
      false,
      undefined,
      "no_configurado"
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelo = genAI.getGenerativeModel({ model: MODELO, systemInstruction: SYSTEM_PROMPT_STUDY });

  let respuesta;
  try {
    respuesta = await modelo.generateContent([
      { inlineData: { mimeType: "application/pdf", data: base64 } },
      { text: `Analiza este documento ("${filename}") y responde SOLO con el JSON descrito en tus instrucciones.` }
    ]);
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);
    const clasificacion = clasificarErrorGemini(mensaje);
    throw new ErrorProveedorIA(
      "gemini",
      clasificacion.mensajeAmigable,
      clasificacion.reintentable,
      err,
      clasificacion.code
    );
  }

  const texto = respuesta.response.text().trim();

  try {
    const limpio = texto.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(limpio) as ResultadoAnalisis;
  } catch (err) {
    throw new ErrorProveedorIA(
      "gemini",
      "Gemini no devolvió un resultado interpretable para este documento.",
      false,
      err,
      "documento_no_interpretable"
    );
  }
}
