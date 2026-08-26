"use client";

// Todo el progreso se guarda en localStorage del navegador del estudiante.
// Estructura pensada para poder migrar fácilmente a una base de datos real
// (Supabase, Postgres, etc.) en una fase posterior sin cambiar la UI.

export interface RegistroOrganismo {
  leyoFicha: boolean;
  identificoGram: boolean;
  identificoMorfologia: boolean;
  reconocioImagen: boolean;
  resolvioQuiz: boolean;
  identificoPruebas: boolean;
  resolvioCaso: boolean;
}

export interface EstadoIdentifica {
  puntaje: number;
  racha: number;
  mejorRacha: number;
  correctas: number;
  incorrectas: number;
}

export interface EstadoProgreso {
  xp: number;
  nivel: number;
  racha: number;
  ultimaFecha: string | null;
  favoritos: string[];
  registros: Record<string, RegistroOrganismo>;
  flashcardsEstado: Record<string, { caja: number; proximaRevision: string }>;
  medallas: string[];
  identifica: EstadoIdentifica;
}

const STORAGE_KEY = "bacteridex_progreso_v1";

const registroVacio: RegistroOrganismo = {
  leyoFicha: false,
  identificoGram: false,
  identificoMorfologia: false,
  reconocioImagen: false,
  resolvioQuiz: false,
  identificoPruebas: false,
  resolvioCaso: false
};

export function estadoInicial(): EstadoProgreso {
  return {
    xp: 0,
    nivel: 1,
    racha: 0,
    ultimaFecha: null,
    favoritos: [],
    registros: {},
    flashcardsEstado: {},
    medallas: [],
    identifica: { puntaje: 0, racha: 0, mejorRacha: 0, correctas: 0, incorrectas: 0 }
  };
}

export function cargarProgreso(): EstadoProgreso {
  if (typeof window === "undefined") return estadoInicial();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return estadoInicial();
    const parsed = JSON.parse(raw);
    return { ...estadoInicial(), ...parsed };
  } catch {
    return estadoInicial();
  }
}

export function guardarProgreso(estado: EstadoProgreso) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

export function nivelParaXp(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function otorgarXp(estado: EstadoProgreso, cantidad: number): EstadoProgreso {
  const xp = estado.xp + cantidad;
  return { ...estado, xp, nivel: nivelParaXp(xp) };
}

export function marcarPasoRegistro(
  estado: EstadoProgreso,
  organismoId: string,
  paso: keyof RegistroOrganismo
): EstadoProgreso {
  const actual = estado.registros[organismoId] ?? { ...registroVacio };
  if (actual[paso]) return estado; // ya estaba marcado, no repetir XP
  const actualizado = { ...actual, [paso]: true };
  const registros = { ...estado.registros, [organismoId]: actualizado };
  return otorgarXp({ ...estado, registros }, 10);
}

export function porcentajeRegistro(registro?: RegistroOrganismo): number {
  if (!registro) return 0;
  const pasos = Object.values(registro);
  const completos = pasos.filter(Boolean).length;
  return Math.round((completos / pasos.length) * 100);
}

export function toggleFavorito(estado: EstadoProgreso, organismoId: string): EstadoProgreso {
  const esFavorito = estado.favoritos.includes(organismoId);
  const favoritos = esFavorito
    ? estado.favoritos.filter((id) => id !== organismoId)
    : [...estado.favoritos, organismoId];
  return { ...estado, favoritos };
}

export function actualizarIdentifica(
  estado: EstadoProgreso,
  correcta: boolean,
  puntos: number
): EstadoProgreso {
  const actual = estado.identifica ?? estadoInicial().identifica;
  const racha = correcta ? actual.racha + 1 : 0;
  const identifica: EstadoIdentifica = {
    puntaje: actual.puntaje + (correcta ? puntos : 0),
    racha,
    mejorRacha: Math.max(actual.mejorRacha, racha),
    correctas: actual.correctas + (correcta ? 1 : 0),
    incorrectas: actual.incorrectas + (correcta ? 0 : 1)
  };
  return otorgarXp({ ...estado, identifica }, correcta ? puntos / 5 : 1);
}

// Repetición espaciada simplificada (tipo Leitner de 5 cajas)
const INTERVALOS_DIAS = [1, 2, 4, 7, 14];

export function responderFlashcard(
  estado: EstadoProgreso,
  organismoId: string,
  resultado: "facil" | "dificil" | "repetir" | "dominado"
): EstadoProgreso {
  const actual = estado.flashcardsEstado[organismoId]?.caja ?? 0;
  let nuevaCaja = actual;
  if (resultado === "facil") nuevaCaja = Math.min(actual + 1, INTERVALOS_DIAS.length - 1);
  if (resultado === "dificil" || resultado === "repetir") nuevaCaja = 0;
  if (resultado === "dominado") nuevaCaja = INTERVALOS_DIAS.length - 1;

  const dias = INTERVALOS_DIAS[nuevaCaja];
  const proxima = new Date();
  proxima.setDate(proxima.getDate() + dias);

  const flashcardsEstado = {
    ...estado.flashcardsEstado,
    [organismoId]: { caja: nuevaCaja, proximaRevision: proxima.toISOString() }
  };

  return otorgarXp({ ...estado, flashcardsEstado }, resultado === "dominado" ? 15 : 5);
}
