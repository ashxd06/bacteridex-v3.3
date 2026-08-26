"use client";

import { useMemo, useState } from "react";
import { todosLosOrganismos } from "@/lib/data";
import type { Organismo } from "@/lib/types";
import { cargarProgreso, guardarProgreso, otorgarXp } from "@/lib/progress";

interface Pregunta {
  texto: string;
  opciones: string[];
  correcta: string;
  pista: string;
}

function barajar<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generarPreguntas(pool: Organismo[], cantidad: number): Pregunta[] {
  const preguntas: Pregunta[] = [];
  const usados = new Set<string>();
  const candidatos = barajar(pool.filter((o) => o.pruebas.length > 0 || o.enfermedades.length > 0));

  for (const o of candidatos) {
    if (preguntas.length >= cantidad) break;
    if (usados.has(o.id)) continue;
    usados.add(o.id);

    const tipo = Math.random();
    const mismaCategoria = pool.filter((x) => x.categoria === o.categoria && x.id !== o.id);
    const distractores = barajar(mismaCategoria)
      .slice(0, 3)
      .map((x) => x.nombreCientifico);

    if (tipo < 0.4 && o.enfermedades.length > 0) {
      preguntas.push({
        texto: `¿Qué microorganismo se asocia principalmente con "${o.enfermedades[0]}"?`,
        opciones: barajar([o.nombreCientifico, ...distractores]),
        correcta: o.nombreCientifico,
        pista: o.subgrupo
      });
    } else if (tipo < 0.75 && o.pruebas.length > 0) {
      const prueba = o.pruebas[Math.floor(Math.random() * o.pruebas.length)];
      preguntas.push({
        texto: `¿Cuál es el resultado esperado de "${prueba.nombre}" en ${o.nombreCientifico}?`,
        opciones: barajar([
          prueba.resultado,
          "Positiva",
          "Negativa",
          "No aplica"
        ].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 4)),
        correcta: prueba.resultado,
        pista: `Familia ${o.familia}`
      });
    } else {
      preguntas.push({
        texto: `¿A qué familia pertenece ${o.nombreCientifico}?`,
        opciones: barajar([
          o.familia,
          ...barajar(mismaCategoria).slice(0, 3).map((x) => x.familia)
        ]),
        correcta: o.familia,
        pista: o.habitat
      });
    }
  }
  return preguntas;
}

export default function QuizPage() {
  const [cantidad] = useState(10);
  const [preguntas, setPreguntas] = useState<Pregunta[]>(() =>
    generarPreguntas(todosLosOrganismos, cantidad)
  );
  const [indice, setIndice] = useState(0);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [terminado, setTerminado] = useState(false);

  const pregunta = preguntas[indice];

  function responder(opcion: string) {
    if (seleccionada) return;
    setSeleccionada(opcion);
    const esCorrecta = opcion === pregunta.correcta;
    if (esCorrecta) setCorrectas((c) => c + 1);
    const estado = cargarProgreso();
    guardarProgreso(otorgarXp(estado, esCorrecta ? 10 : 2));
  }

  function siguiente() {
    if (indice + 1 >= preguntas.length) {
      setTerminado(true);
      return;
    }
    setIndice((i) => i + 1);
    setSeleccionada(null);
  }

  function reiniciar() {
    setPreguntas(generarPreguntas(todosLosOrganismos, cantidad));
    setIndice(0);
    setSeleccionada(null);
    setCorrectas(0);
    setTerminado(false);
  }

  if (preguntas.length === 0) {
    return <p className="text-mist-400">Aún no hay suficientes datos para generar un quiz.</p>;
  }

  if (terminado) {
    return (
      <div className="lab-card mx-auto max-w-md p-8 text-center">
        <p className="text-4xl">🏆</p>
        <h1 className="mt-2 font-display text-2xl font-bold">
          {correctas} / {preguntas.length} correctas
        </h1>
        <p className="mt-2 text-sm text-mist-400">
          {correctas === preguntas.length
            ? "¡Dominio perfecto! Eres un cazador de microorganismos."
            : "Sigue practicando, cada intento suma XP."}
        </p>
        <button
          onClick={reiniciar}
          className="focus-ring mt-5 rounded-lg bg-bio px-4 py-2 font-medium text-base-950 hover:bg-bio-glow"
        >
          Nuevo quiz
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="section-eyebrow">🎯 Quiz</p>
        <div className="mb-1 flex justify-between text-xs text-mist-400">
          <span>Pregunta {indice + 1} de {preguntas.length}</span>
          <span>{correctas} correctas</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-bio transition-all"
            style={{ width: `${((indice + 1) / preguntas.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="lab-card p-6">
        <p className="font-display text-lg font-semibold">{pregunta.texto}</p>
        <div className="mt-4 flex flex-col gap-2">
          {pregunta.opciones.map((op) => {
            const esCorrecta = op === pregunta.correcta;
            const esSeleccionada = op === seleccionada;
            let estilo = "border-base-600 hover:border-bio";
            if (seleccionada) {
              if (esCorrecta) estilo = "border-bio bg-bio/10 text-bio";
              else if (esSeleccionada) estilo = "border-alert bg-alert/10 text-alert";
              else estilo = "border-base-700 opacity-60";
            }
            return (
              <button
                key={op}
                onClick={() => responder(op)}
                className={`focus-ring rounded-lg border px-4 py-2.5 text-left text-sm transition ${estilo}`}
              >
                {op}
              </button>
            );
          })}
        </div>
        {seleccionada && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-mist-400">Pista: {pregunta.pista}</p>
            <button
              onClick={siguiente}
              className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
            >
              Siguiente →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
