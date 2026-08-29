import type { ResultadoAnalisis } from "@/lib/study/types";
import { analizarConClaude } from "./anthropic";
import { analizarConGemini } from "./gemini";
import { analizarConOpenAI } from "./openai";
import {
  ErrorProveedorIA,
  ORDEN_AUTOMATICO,
  NOMBRE_PROVEEDOR,
  claveConfigurada,
  type ProveedorId,
  type SeleccionProveedor
} from "./tipos";

const ADAPTADORES: Record<ProveedorId, (base64: string, filename: string) => Promise<ResultadoAnalisis>> = {
  claude: analizarConClaude,
  gemini: analizarConGemini,
  openai: analizarConOpenAI
};

export interface ResultadoOrquestacion {
  resultado: ResultadoAnalisis;
  proveedorUsado: ProveedorId;
  // Notas legibles del proceso, ej. "Claude no está disponible. Probando Gemini…"
  // Útiles para mostrar en la interfaz sin exponer detalles técnicos.
  notas: string[];
}

// Punto único de entrada para analizar un PDF con la IA seleccionada.
// - "automatico": intenta Claude → Gemini → OpenAI, saltando proveedores sin
//   clave configurada y reintentando solo ante errores "reintentables"
//   (créditos, autenticación, límite de uso, error temporal o no disponible).
// - un proveedor específico: usa únicamente ese, sin fallback.
export async function analizarDocumento(
  seleccion: SeleccionProveedor,
  base64: string,
  filename: string
): Promise<ResultadoOrquestacion> {
  if (seleccion !== "automatico") {
    if (!claveConfigurada(seleccion)) {
      throw new ErrorProveedorIA(
        seleccion,
        `${NOMBRE_PROVEEDOR[seleccion]} no está configurado actualmente.`,
        false,
        undefined,
        "no_configurado"
      );
    }
    const resultado = await ADAPTADORES[seleccion](base64, filename);
    return { resultado, proveedorUsado: seleccion, notas: [] };
  }

  const notas: string[] = [];
  let ultimoError: ErrorProveedorIA | null = null;

  for (let i = 0; i < ORDEN_AUTOMATICO.length; i++) {
    const proveedor = ORDEN_AUTOMATICO[i];

    if (!claveConfigurada(proveedor)) {
      continue; // Automático salta proveedores sin clave, sin generar error.
    }

    if (i > 0) {
      notas.push(`Probando ${NOMBRE_PROVEEDOR[proveedor]}…`);
    }

    try {
      const resultado = await ADAPTADORES[proveedor](base64, filename);
      return { resultado, proveedorUsado: proveedor, notas };
    } catch (err) {
      const error =
        err instanceof ErrorProveedorIA
          ? err
          : new ErrorProveedorIA(proveedor, "Ocurrió un problema inesperado.", true, err);
      ultimoError = error;

      if (!error.reintentable) {
        // Error no relacionado con disponibilidad (ej. documento no interpretable):
        // no tiene sentido seguir probando otros proveedores para el mismo PDF.
        throw error;
      }
      notas.push(`${NOMBRE_PROVEEDOR[proveedor]} no está disponible.`);
    }
  }

  throw new ErrorProveedorIA(
    ultimoError?.proveedor ?? "claude",
    ultimoError
      ? "No fue posible analizar el documento con los proveedores de IA disponibles."
      : "No hay proveedores de IA configurados en este despliegue todavía.",
    false,
    ultimoError,
    ultimoError?.code ?? "no_configurado"
  );
}
