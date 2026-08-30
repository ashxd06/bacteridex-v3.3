"use client";

import { useMemo, useState } from "react";
import type { StudyPregunta } from "@/lib/study/types";

function barajar<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const CANTIDADES = [10, 20, 30] as const;

export default function StudyExam({ preguntas }: { preguntas: StudyPregunta[] }) {
  const [configurando, setConfigurando] = useState(true);
  const [cantidad, setCantidad] = useState<number>(Math.min(10, preguntas.length));
  const [examen, setExamen] = useState<StudyPregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [terminado, setTerminado] = useState(false);

  const correctas = useMemo(
    () => examen.filter((p, i) => respuestas[i] === p.respuesta_correcta).length,
    [examen, respuestas]
  );

  function empezar() {
    const seleccion = barajar(preguntas).slice(0, Math.min(cantidad, preguntas.length));
    setExamen(seleccion);
    setIndice(0);
    setRespuestas({});
    setTerminado(false);
    setConfigurando(false);
  }

  if (preguntas.length === 0) {
    return <p className="text-sm text-mist-400">No se generaron preguntas para este documento.</p>;
  }

  if (configurando) {
    return (
      <div className="lab-card mx-auto max-w-md p-6">
        <p className="section-eyebrow mb-2">🎯 Crear examen</p>
        <p className="text-sm text-mist-400">Este documento tiene {preguntas.length} preguntas disponibles.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {CANTIDADES.filter((c) => c <= preguntas.length || c === CANTIDADES[0]).map((c) => (
            <button
              key={c}
              onClick={() => setCantidad(Math.min(c, preguntas.length))}
              className={`focus-ring rounded-lg border px-3 py-1.5 text-sm ${
                cantidad === Math.min(c, preguntas.length) ? "border-bio bg-bio/10 text-bio" : "border-base-600"
              }`}
            >
              {Math.min(c, preguntas.length)} preguntas
            </button>
          ))}
        </div>
        <button
          onClick={empezar}
          className="focus-ring mt-5 w-full rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
        >
          Empezar examen
        </button>
      </div>
    );
  }

  if (terminado) {
    return (
      <div className="lab-card mx-auto flex max-w-lg flex-col gap-4 p-6">
        <p className="text-center font-display text-2xl font-bold">
          Resultado: {correctas}/{examen.length}
        </p>
        <div className="flex flex-col gap-3">
          {examen.map((p, i) => {
            const propia = respuestas[i];
            const correcta = propia === p.respuesta_correcta;
            return (
              <div key={i} className={`lab-card p-3 ${correcta ? "border-verde/40" : "border-alert/40"}`}>
                <p className="text-sm font-medium">{p.pregunta}</p>
                <p className={`mt-1 text-xs ${correcta ? "text-verde" : "text-alert"}`}>
                  Tu respuesta: {propia ?? "(sin responder)"} {correcta ? "✓" : `· Correcta: ${p.respuesta_correcta}`}
                </p>
                <p className="mt-1 text-xs text-mist-400">{p.explicacion}</p>
                {p.pagina && <p className="text-[11px] text-mist-400">📄 Página {p.pagina}</p>}
              </div>
            );
          })}
        </div>
        <button
          onClick={() => setConfigurando(true)}
          className="focus-ring w-fit rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
        >
          Nuevo examen
        </button>
      </div>
    );
  }

  const pregunta = examen[indice];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <p className="text-xs text-mist-400">Pregunta {indice + 1} de {examen.length}</p>
      <div className="lab-card p-5">
        <p className="font-display font-semibold">{pregunta.pregunta}</p>
        <div className="mt-3 flex flex-col gap-2">
          {pregunta.opciones.map((op) => (
            <button
              key={op}
              onClick={() => setRespuestas((r) => ({ ...r, [indice]: op }))}
              className={`focus-ring rounded-lg border px-3 py-2 text-left text-sm ${
                respuestas[indice] === op ? "border-bio bg-bio/10 text-bio" : "border-base-600 hover:border-bio"
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-between">
        <button
          disabled={indice === 0}
          onClick={() => setIndice((i) => i - 1)}
          className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-sm disabled:opacity-40"
        >
          ← Anterior
        </button>
        {indice + 1 < examen.length ? (
          <button
            onClick={() => setIndice((i) => i + 1)}
            className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={() => setTerminado(true)}
            className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
          >
            Finalizar examen
          </button>
        )}
      </div>
    </div>
  );
}
