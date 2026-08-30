// Tipos del selector de proveedores de IA de BacteriDex Study.
// No modifica ResultadoAnalisis (lib/study/types.ts): el contrato con el
// resto de la app se mantiene exactamente igual, sin importar qué IA respondió.

export type ProveedorId = "claude" | "gemini" | "openai";
export type SeleccionProveedor = "automatico" | ProveedorId;

export const ORDEN_AUTOMATICO: ProveedorId[] = ["claude", "gemini", "openai"];

// Lista de valores válidos para validación en runtime (sin depender de types de TS).
const SELECCIONES_VALIDAS: readonly string[] = ["automatico", "claude", "gemini", "openai"];

/** Devuelve true si el valor recibido del cliente es un SeleccionProveedor válido. */
export function esSeleccionValida(valor: unknown): valor is SeleccionProveedor {
  return typeof valor === "string" && SELECCIONES_VALIDAS.includes(valor);
}

export const NOMBRE_PROVEEDOR: Record<ProveedorId, string> = {
  claude: "Claude",
  gemini: "Gemini",
  openai: "OpenAI"
};

// Códigos estandarizados para que la interfaz pueda reaccionar de forma
// específica sin tener que parsear el texto del mensaje.
export type CodigoErrorIA =
  | "no_configurado"
  | "api_key_invalida"
  | "cuota_excedida"
  | "modelo_no_disponible"
  | "limite_uso"
  | "documento_no_interpretable"
  | "error_desconocido";

// Error estandarizado que cada adaptador (anthropic.ts, gemini.ts, openai.ts)
// debe lanzar. "reintentable" indica si tiene sentido probar el siguiente
// proveedor en modo Automático (créditos, autenticación, límite de uso,
// error temporal o proveedor no disponible) o si el problema es del propio
// documento/petición y no cambiaría al intentar otra IA.
export class ErrorProveedorIA extends Error {
  proveedor: ProveedorId;
  reintentable: boolean;
  mensajeAmigable: string;
  code: CodigoErrorIA;

  constructor(
    proveedor: ProveedorId,
    mensajeAmigable: string,
    reintentable: boolean,
    causaOriginal?: unknown,
    code: CodigoErrorIA = "error_desconocido"
  ) {
    super(mensajeAmigable);
    this.name = "ErrorProveedorIA";
    this.proveedor = proveedor;
    this.mensajeAmigable = mensajeAmigable;
    this.reintentable = reintentable;
    this.code = code;
    if (causaOriginal) {
      // Detalle técnico solo para console.error del servidor, nunca para el usuario.
      console.error(`[${proveedor}] error original:`, causaOriginal);
    }
  }
}

// Variable de entorno con la clave de cada proveedor.
export function claveConfigurada(proveedor: ProveedorId): boolean {
  if (proveedor === "claude") return !!process.env.ANTHROPIC_API_KEY;
  if (proveedor === "gemini") return !!process.env.GEMINI_API_KEY;
  return !!process.env.OPENAI_API_KEY;
}
