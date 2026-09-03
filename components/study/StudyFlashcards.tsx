"use client";

import { useEffect, useState } from "react";
import type { StudyFlashcard } from "@/lib/study/types";

// Progreso de "aprendida" se guarda en localStorage por documento, aislado
// del sistema de flashcards general de la enciclopedia (lib/progress.ts).
function claveAlmacenamiento(documentId: string) {
  return `bacteridex_study_flashcards_${documentId}`;
}

export default function StudyFlashcards({
  flashcards,
  documentId
}: {
  flashcards: StudyFlashcard[];
  documentId: string;
}) {
  const [indice, setIndice] = useState(0);
  const [volteada, setVolteada] = useState(false);
  const [aprendidas, setAprendidas] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const guardado = window.localStorage.getItem(claveAlmacenamiento(documentId));
      if (guardado) setAprendidas(new Set(JSON.parse(guardado)));
    } catch {
      // sin progreso guardado todavía
    }
  }, [documentId]);

  function guardar(nuevo: Set<number>) {
    setAprendidas(nuevo);
    window.localStorage.setItem(claveAlmacenamiento(documentId), JSON.stringify([...nuevo]));
  }

  if (flashcards.length === 0) {
    return <p className="text-sm text-mist-400">No se generaron flashcards para este documento.</p>;
  }

  const actual = flashcards[indice];

  function marcarAprendida() {
    const nuevo = new Set(aprendidas);
    nuevo.add(indice);
    guardar(nuevo);
  }

  function siguiente() {
    setVolteada(false);
    setIndice((i) => (i + 1) % flashcards.length);
  }

  function anterior() {
    setVolteada(false);
    setIndice((i) => (i - 1 + flashcards.length) % flashcards.length);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-xs text-mist-400">
        Tarjeta {indice + 1} de {flashcards.length} · {aprendidas.size} aprendidas
      </p>

      <button
        onClick={() => setVolteada((v) => !v)}
        className="focus-ring lab-card flex min-h-[180px] w-full max-w-lg flex-col items-center justify-center gap-2 p-8 text-center"
      >
        {!volteada ? (
          <>
            <span className="section-eyebrow">Pregunta</span>
            <p className="font-display text-lg font-semibold">{actual.pregunta}</p>
            <span className="text-xs text-mist-400">Toca para voltear</span>
          </>
        ) : (
          <>
            <span className="section-eyebrow">Respuesta</span>
            <p className="text-sm text-mist-200">{actual.respuesta}</p>
            {actual.pagina && <p className="text-xs text-mist-400">📄 Página {actual.pagina}</p>}
          </>
        )}
      </button>

      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={anterior} className="focus-ring rounded-lg border border-base-600 px-3 py-1.5 text-sm hover:border-bio">
          ← Anterior
        </button>
        <button
          onClick={marcarAprendida}
          className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${
            aprendidas.has(indice) ? "border-verde bg-verde/10 text-verde" : "border-base-600 hover:border-bio hover:text-bio"
          }`}
        >
          {aprendidas.has(indice) ? "✓ Aprendida" : "Marcar como aprendida"}
        </button>
        <button onClick={siguiente} className="focus-ring rounded-lg border border-base-600 px-3 py-1.5 text-sm hover:border-bio">
          Siguiente →
        </button>
      </div>
    </div>
  );
}
