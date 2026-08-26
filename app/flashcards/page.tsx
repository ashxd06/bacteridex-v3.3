"use client";

import { useEffect, useMemo, useState } from "react";
import { todosLosOrganismos } from "@/lib/data";
import {
  cargarProgreso,
  guardarProgreso,
  responderFlashcard,
  type EstadoProgreso,
  estadoInicial
} from "@/lib/progress";

export default function FlashcardsPage() {
  const [estado, setEstado] = useState<EstadoProgreso>(estadoInicial());
  const [listo, setListo] = useState(false);
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);

  useEffect(() => {
    setEstado(cargarProgreso());
    setListo(true);
  }, []);

  const cola = useMemo(() => {
    if (!listo) return [];
    const ahora = Date.now();
    const pendientes = todosLosOrganismos.filter((o) => {
      const info = estado.flashcardsEstado[o.id];
      if (!info) return true;
      return new Date(info.proximaRevision).getTime() <= ahora;
    });
    return pendientes.length > 0 ? pendientes : todosLosOrganismos;
  }, [estado, listo]);

  const actual = cola[indice % cola.length];

  function responder(resultado: "facil" | "dificil" | "repetir" | "dominado") {
    if (!actual) return;
    const actualizado = responderFlashcard(estado, actual.id, resultado);
    setEstado(actualizado);
    guardarProgreso(actualizado);
    setVolteada(false);
    setIndice((i) => i + 1);
  }

  if (!listo || !actual) {
    return <p className="text-mist-400">Cargando flashcards…</p>;
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
      <div className="w-full">
        <p className="section-eyebrow">🧠 Flashcards</p>
        <h1 className="font-display text-2xl font-bold">Repetición espaciada</h1>
        <p className="text-sm text-mist-400">
          {cola.length} tarjetas listas para repasar. Responde con honestidad para que el sistema
          ajuste cuándo volver a mostrarte cada una.
        </p>
      </div>

      <button
        onClick={() => setVolteada((v) => !v)}
        className="focus-ring lab-card flex min-h-[220px] w-full flex-col items-center justify-center gap-3 p-8 text-center"
      >
        {!volteada ? (
          <>
            <span className="section-eyebrow">Pregunta</span>
            <p className="font-display text-xl font-semibold">
              ¿Cuál es la importancia médica de <em>{actual.nombreCientifico}</em>?
            </p>
            <span className="text-xs text-mist-400">Toca para voltear</span>
          </>
        ) : (
          <>
            <span className="section-eyebrow">Respuesta</span>
            <p className="text-sm text-mist-200">{actual.importanciaMedica.queCausa}</p>
            <p className="text-xs text-mist-400">{actual.subgrupo} · {actual.familia}</p>
          </>
        )}
      </button>

      {volteada && (
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4">
          <button onClick={() => responder("repetir")} className="focus-ring rounded-lg border border-alert/40 bg-alert/10 px-3 py-2 text-sm text-alert hover:bg-alert/20">
            Repetir mañana
          </button>
          <button onClick={() => responder("dificil")} className="focus-ring rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold hover:bg-gold/20">
            Difícil
          </button>
          <button onClick={() => responder("facil")} className="focus-ring rounded-lg border border-bio/40 bg-bio/10 px-3 py-2 text-sm text-bio hover:bg-bio/20">
            Fácil
          </button>
          <button onClick={() => responder("dominado")} className="focus-ring rounded-lg border border-gene/40 bg-gene/10 px-3 py-2 text-sm text-gene hover:bg-gene/20">
            Ya dominado
          </button>
        </div>
      )}
    </div>
  );
}
