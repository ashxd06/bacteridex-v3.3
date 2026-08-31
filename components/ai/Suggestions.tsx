"use client";

import { Sparkles, ArrowRight } from "lucide-react";

export const SUGERENCIAS = [
  "¿Qué es la tinción de Gram?",
  "¿Cómo diferencio STAPHYLOCOCCUS AUREUS de STAPHYLOCOCCUS EPIDERMIDIS?",
  "¿Qué bacterias crecen en agar MacConkey?",
  "Explícame la prueba de catalasa",
  "¿Qué diferencia hay entre bacterias Gram positivas y Gram negativas?",
  "Explícame la PCR de forma sencilla"
];

export default function Suggestions({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-bio/10 text-bio ring-1 ring-bio/30">
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="mb-2 font-display text-2xl font-bold">BacteriDex AI</h2>
      <p className="mb-8 max-w-md text-sm text-mist-400">
        Tu asistente inteligente de Laboratorio Clínico. Estoy aquí para explicarte conceptos, microorganismos y pruebas.
      </p>

      <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUGERENCIAS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(sug)}
            className="focus-ring group flex flex-col justify-between rounded-xl border border-base-700 bg-base-800/50 p-4 text-left transition-colors hover:border-bio/50 hover:bg-base-800"
          >
            <span className="text-sm font-medium text-mist-200 line-clamp-3">{sug}</span>
            <span className="mt-3 inline-flex items-center text-xs font-semibold text-bio opacity-0 transition-opacity group-hover:opacity-100">
              Preguntar <ArrowRight className="ml-1 h-3 w-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
