import { evaluate } from "mathjs";

// Evalúa la fórmula de una Calculadora (lib/types.ts) con los valores que
// ingresó el usuario. Usa mathjs.evaluate, que interpreta un lenguaje de
// expresiones matemáticas aislado (sin acceso a JS/DOM/red) — nunca
// eval()/Function() de JavaScript, así que una fórmula cargada por un
// admin no puede ejecutar código arbitrario.
export interface ResultadoEvaluacion {
  ok: boolean;
  valor?: number;
  error?: string;
}

export function evaluarFormula(formula: string, valores: Record<string, number>): ResultadoEvaluacion {
  if (!formula.trim()) {
    return { ok: false, error: "Esta calculadora todavía no tiene una fórmula cargada." };
  }
  try {
    const resultado = evaluate(formula, valores);
    if (typeof resultado !== "number" || !Number.isFinite(resultado)) {
      return { ok: false, error: "La fórmula no produjo un número válido con esos datos." };
    }
    return { ok: true, valor: resultado };
  } catch {
    return { ok: false, error: "No se pudo calcular: revisa que todos los campos tengan un valor numérico válido." };
  }
}

// Valida la sintaxis de una fórmula (usado en el formulario de admin, antes
// de guardar) sin necesidad de tener valores de variables todavía.
export function formulaValida(formula: string): boolean {
  if (!formula.trim()) return true; // vacío = "pendiente", es válido
  try {
    evaluate(formula, {});
    return true;
  } catch (e) {
    // Un error de variable indefinida es esperado (aún no hay valores) y
    // sigue significando que la sintaxis es correcta.
    return e instanceof Error && /Undefined symbol/i.test(e.message);
  }
}
