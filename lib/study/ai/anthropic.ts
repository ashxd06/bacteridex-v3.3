import { SYSTEM_PROMPT_STUDY } from "@/lib/study/prompt";
import type { ResultadoAnalisis } from "@/lib/study/types";
import { ErrorProveedorIA, type CodigoErrorIA } from "./tipos";

const MODELO = process.env.STUDY_AI_MODEL || "claude-sonnet-5";

// La versión instalada de @anthropic-ai/sdk (ver package.json) no tiene
// tipado compatible para enviar PDFs ni por `anthropic.messages.create`
// (no incluye "document" en la unión de tipos de contenido) ni por
// `anthropic.beta.messages.create` (esa ruta no existe en esta versión del
// SDK). En vez de forzar los tipos del SDK con "as any", esta función llama
// directamente al endpoint REST de Anthropic con `fetch`, tipando nosotros
// mismos la forma mínima de la petición y la respuesta que necesitamos. La
// API de Anthropic sí admite el bloque de contenido "document" mediante el
// header "anthropic-beta: pdfs-2024-09-25"; el problema era únicamente de
// tipado del paquete instalado, no de la API en sí.

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const ANTHROPIC_BETA_PDFS = "pdfs-2024-09-25";

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessagesResponse {
  content?: AnthropicContentBlock[];
}

interface AnthropicErrorBody {
  error?: { type?: string; message?: string };
}

const MENSAJE_LIMITE_CLAUDE =
  "Claude no está disponible en este momento por límite de uso, cuota o disponibilidad. Revisa tu cuenta de Anthropic o intenta con otra IA.";
const MENSAJE_AUTH =
  "La IA seleccionada no está configurada correctamente. Revisa las variables de entorno del servidor.";

function clasificarErrorClaude(
  status: number | undefined,
  mensaje: string
): { code: CodigoErrorIA; mensajeAmigable: string; reintentable: boolean } {
  const m = mensaje.toLowerCase();

  if (status === 401 || status === 403 || m.includes("authentication") || m.includes("invalid x-api-key")) {
    return { code: "api_key_invalida", mensajeAmigable: MENSAJE_AUTH, reintentable: true };
  }
  if (
    m.includes("credit balance") ||
    m.includes("billing") ||
    m.includes("quota") ||
    m.includes("credit")
  ) {
    return { code: "cuota_excedida", mensajeAmigable: MENSAJE_LIMITE_CLAUDE, reintentable: true };
  }
  if (m.includes("rate limit") || status === 429) {
    return { code: "limite_uso", mensajeAmigable: MENSAJE_LIMITE_CLAUDE, reintentable: true };
  }
  if (m.includes("overloaded") || status === 529) {
    return { code: "limite_uso", mensajeAmigable: MENSAJE_LIMITE_CLAUDE, reintentable: true };
  }
  if (status && [408, 409, 500, 502, 503].includes(status)) {
    return { code: "error_desconocido", mensajeAmigable: "Claude no está disponible en este momento.", reintentable: true };
  }
  return { code: "error_desconocido", mensajeAmigable: "Claude no está disponible en este momento.", reintentable: false };
}

export async function analizarConClaude(base64: string, filename: string): Promise<ResultadoAnalisis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ErrorProveedorIA("claude", "Este proveedor de IA no está configurado actualmente.", false);
  }

  let respuestaHttp: Response;
  try {
    respuestaHttp = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-beta": ANTHROPIC_BETA_PDFS
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 8000,
        system: SYSTEM_PROMPT_STUDY,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: { type: "base64", media_type: "application/pdf", data: base64 }
              },
              {
                type: "text",
                text: `Analiza este documento ("${filename}") y responde SOLO con el JSON descrito en tus instrucciones.`
              }
            ]
          }
        ]
      })
    });
  } catch (err) {
    throw new ErrorProveedorIA("claude", "Claude no está disponible en este momento.", true, err, "error_desconocido");
  }

  if (!respuestaHttp.ok) {
    let cuerpoError: AnthropicErrorBody | null = null;
    try {
      cuerpoError = (await respuestaHttp.json()) as AnthropicErrorBody;
    } catch {
      cuerpoError = null;
    }
    const mensaje = cuerpoError?.error?.message || `Error HTTP ${respuestaHttp.status}`;
    const clasificacion = clasificarErrorClaude(respuestaHttp.status, mensaje);
    throw new ErrorProveedorIA(
      "claude",
      clasificacion.mensajeAmigable,
      clasificacion.reintentable,
      cuerpoError ?? mensaje,
      clasificacion.code
    );
  }

  const datos = (await respuestaHttp.json()) as AnthropicMessagesResponse;
  const texto = (datos.content ?? [])
    .map((bloque) => (bloque.type === "text" ? bloque.text ?? "" : ""))
    .join("")
    .trim();

  try {
    const limpio = texto.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(limpio) as ResultadoAnalisis;
  } catch (err) {
    throw new ErrorProveedorIA(
      "claude",
      "Claude no devolvió un resultado interpretable para este documento.",
      false,
      err,
      "documento_no_interpretable"
    );
  }
}
