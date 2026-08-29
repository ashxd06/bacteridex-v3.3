import { SYSTEM_PROMPT_STUDY } from "@/lib/study/prompt";
import type { ResultadoAnalisis } from "@/lib/study/types";
import { ErrorProveedorIA, type CodigoErrorIA } from "./tipos";

const MODELO = process.env.STUDY_AI_MODEL_OPENAI || "gpt-4o";

// Igual que con Anthropic: en vez de depender de que el SDK "openai" tenga
// tipado `client.responses.create(...)` en la versión exacta que termine
// instalando Vercel, llamamos directamente al endpoint REST de la Responses
// API con `fetch` y tipamos nosotros mismos la forma mínima que necesitamos.
// Esto sigue usando la Responses API de OpenAI (no se cambia de API), solo
// evita que un desajuste de tipos del paquete instalado rompa el build.

const OPENAI_API_URL = "https://api.openai.com/v1/responses";

interface OpenAIContentBlock {
  type?: string;
  text?: string;
}

interface OpenAIOutputItem {
  type?: string;
  content?: OpenAIContentBlock[];
}

interface OpenAIResponseBody {
  output?: OpenAIOutputItem[];
}

interface OpenAIErrorBody {
  error?: { type?: string; message?: string; code?: string };
}

const MENSAJE_CUOTA_OPENAI =
  "OpenAI no tiene cuota disponible. Revisa el plan, facturación o créditos de tu cuenta de OpenAI.";
const MENSAJE_AUTH =
  "La IA seleccionada no está configurada correctamente. Revisa las variables de entorno del servidor.";

function clasificarErrorOpenAI(
  status: number | undefined,
  codigoOpenAI: string | undefined,
  mensaje: string
): { code: CodigoErrorIA; mensajeAmigable: string; reintentable: boolean } {
  const m = mensaje.toLowerCase();
  const c = (codigoOpenAI ?? "").toLowerCase();

  if (
    c === "insufficient_quota" ||
    c.includes("quota") ||
    m.includes("insufficient_quota") ||
    m.includes("exceeded your current quota") ||
    m.includes("billing") ||
    m.includes("quota") ||
    m.includes("plan") ||
    m.includes("credit")
  ) {
    return { code: "cuota_excedida", mensajeAmigable: MENSAJE_CUOTA_OPENAI, reintentable: true };
  }
  if (status === 401 || status === 403 || c === "invalid_api_key" || m.includes("api key")) {
    return { code: "api_key_invalida", mensajeAmigable: MENSAJE_AUTH, reintentable: true };
  }
  if (m.includes("rate limit") || status === 429) {
    return { code: "limite_uso", mensajeAmigable: MENSAJE_CUOTA_OPENAI, reintentable: true };
  }
  if (m.includes("overloaded") || (status && [500, 502, 503].includes(status))) {
    return { code: "error_desconocido", mensajeAmigable: "OpenAI no está disponible en este momento.", reintentable: true };
  }
  return { code: "error_desconocido", mensajeAmigable: "OpenAI no está disponible en este momento.", reintentable: false };
}

// Extrae el texto de la respuesta de la Responses API de forma defensiva.
function extraerTexto(datos: OpenAIResponseBody): string {
  if (!Array.isArray(datos.output)) return "";
  return datos.output
    .flatMap((item) => item.content ?? [])
    .map((bloque) => bloque.text ?? "")
    .join("")
    .trim();
}

export async function analizarConOpenAI(base64: string, filename: string): Promise<ResultadoAnalisis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new ErrorProveedorIA(
      "openai",
      "Este proveedor de IA no está configurado actualmente.",
      false,
      undefined,
      "no_configurado"
    );
  }

  let respuestaHttp: Response;
  try {
    respuestaHttp = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODELO,
        instructions: SYSTEM_PROMPT_STUDY,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_file",
                filename,
                file_data: `data:application/pdf;base64,${base64}`
              },
              {
                type: "input_text",
                text: `Analiza este documento ("${filename}") y responde SOLO con el JSON descrito en tus instrucciones.`
              }
            ]
          }
        ]
      })
    });
  } catch (err) {
    throw new ErrorProveedorIA("openai", "OpenAI no está disponible en este momento.", true, err, "error_desconocido");
  }

  if (!respuestaHttp.ok) {
    let cuerpoError: OpenAIErrorBody | null = null;
    try {
      cuerpoError = (await respuestaHttp.json()) as OpenAIErrorBody;
    } catch {
      cuerpoError = null;
    }
    const mensaje = cuerpoError?.error?.message || `Error HTTP ${respuestaHttp.status}`;
    const clasificacion = clasificarErrorOpenAI(respuestaHttp.status, cuerpoError?.error?.code, mensaje);
    throw new ErrorProveedorIA(
      "openai",
      clasificacion.mensajeAmigable,
      clasificacion.reintentable,
      cuerpoError ?? mensaje,
      clasificacion.code
    );
  }

  const datos = (await respuestaHttp.json()) as OpenAIResponseBody;
  const texto = extraerTexto(datos).trim();

  try {
    const limpio = texto.replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    return JSON.parse(limpio) as ResultadoAnalisis;
  } catch (err) {
    throw new ErrorProveedorIA(
      "openai",
      "OpenAI no devolvió un resultado interpretable para este documento.",
      false,
      err,
      "documento_no_interpretable"
    );
  }
}
