"use client";

import { useMemo, useState } from "react";
import { todosLosOrganismos } from "@/lib/data";
import type { Organismo } from "@/lib/types";
import { cargarProgreso, guardarProgreso, actualizarIdentifica, type EstadoProgreso, estadoInicial } from "@/lib/progress";

type Dificultad = "facil" | "intermedio" | "dificil" | "experto";

const MULTIPLICADOR: Record<Dificultad, number> = {
  facil: 1,
  intermedio: 1.25,
  dificil: 1.5,
  experto: 2
};

const CLUES_INICIALES: Record<Dificultad, number> = {
  facil: 4,
  intermedio: 2,
  dificil: 1,
  experto: 1
};

function barajar<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function construirPistas(o: Organismo): string[] {
  const pistas: string[] = [];
  if (o.muestraClinica?.length) pistas.push(`🧪 Muestra clínica: ${o.muestraClinica.join(", ")}`);
  const tincion = o.gram && o.gram !== "no-aplica" ? `Gram ${o.gram}` : o.genoma ? `Genoma ${o.genoma}` : o.tipoHongo || o.tipoParasito;
  if (tincion) pistas.push(`🎨 Tinción/clasificación: ${tincion}`);
  if (o.morfologia) pistas.push(`🔬 Morfología: ${o.morfologia}`);
  if (o.colonia) pistas.push(`🧫 Características coloniales: ${o.colonia}`);
  const hemolisis = o.pruebas.find((p) => p.nombre.toLowerCase().includes("hemólisis"));
  if (hemolisis) pistas.push(`🩸 Hemólisis: ${hemolisis.resultado}`);
  if (o.pruebas.length) {
    pistas.push(`🧫 Pruebas bioquímicas: ${o.pruebas.map((p) => `${p.nombre} ${p.resultado}`).join(" · ")}`);
  }
  if (o.mediosCultivo?.length) pistas.push(`🧫 Medio de cultivo: ${o.mediosCultivo.join(", ")}`);
  pistas.push(`🩺 Características clínicas: ${o.importanciaMedica.queCausa}`);
  return pistas;
}

export default function IdentificaPage() {
  const [dificultad, setDificultad] = useState<Dificultad>("intermedio");
  const [estadoJuego, setEstadoJuego] = useState<"config" | "jugando" | "resultado">("config");
  const [objetivo, setObjetivo] = useState<Organismo | null>(null);
  const [pistas, setPistas] = useState<string[]>([]);
  const [pistasVisibles, setPistasVisibles] = useState(1);
  const [opciones, setOpciones] = useState<string[]>([]);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [progreso, setProgreso] = useState<EstadoProgreso>(estadoInicial());

  const listo = () => {
    setProgreso(cargarProgreso());
  };

  const puntosActuales = useMemo(() => {
    const base = Math.max(20, 100 - (pistasVisibles - 1) * 15);
    return Math.round(base * MULTIPLICADOR[dificultad]);
  }, [pistasVisibles, dificultad]);

  function nuevaRonda() {
    listo();
    const o = todosLosOrganismos[Math.floor(Math.random() * todosLosOrganismos.length)];
    const mismaCategoria = todosLosOrganismos.filter((x) => x.categoria === o.categoria && x.id !== o.id);
    const distractores = barajar(mismaCategoria).slice(0, 3).map((x) => x.nombreCientifico);
    setObjetivo(o);
    setPistas(construirPistas(o));
    setPistasVisibles(Math.min(CLUES_INICIALES[dificultad], construirPistas(o).length));
    setOpciones(barajar([o.nombreCientifico, ...distractores]));
    setSeleccion(null);
    setEstadoJuego("jugando");
  }

  function pedirPista() {
    setPistasVisibles((v) => Math.min(v + 1, pistas.length));
  }

  function responder(opcion: string) {
    if (seleccion || !objetivo) return;
    setSeleccion(opcion);
    const correcta = opcion === objetivo.nombreCientifico;
    const actualizado = actualizarIdentifica(progreso, correcta, puntosActuales);
    setProgreso(actualizado);
    guardarProgreso(actualizado);
  }

  if (estadoJuego === "config") {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <div>
          <p className="section-eyebrow">🕵️ Identifica el microorganismo</p>
          <h1 className="font-display text-2xl font-bold">Modo investigación</h1>
          <p className="text-sm text-mist-400">
            Recibirás pistas progresivas (muestra, tinción, morfología, colonia, pruebas
            bioquímicas, medio de cultivo, clínica). Adivina con el menor número de pistas
            posible para ganar más puntos.
          </p>
        </div>

        <div className="lab-card p-5">
          <p className="section-eyebrow mb-3">Dificultad</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["facil", "intermedio", "dificil", "experto"] as Dificultad[]).map((d) => (
              <button
                key={d}
                onClick={() => setDificultad(d)}
                className={`focus-ring rounded-lg border px-3 py-2 text-sm capitalize transition ${
                  dificultad === d ? "border-bio bg-bio/10 text-bio" : "border-base-600 hover:border-bio"
                }`}
              >
                {d} <span className="block text-[10px] text-mist-400">x{MULTIPLICADOR[d]}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={nuevaRonda}
          className="focus-ring rounded-lg bg-bio px-4 py-3 font-medium text-base-950 hover:bg-bio-glow"
        >
          Empezar investigación
        </button>
      </div>
    );
  }

  if (!objetivo) return null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="section-eyebrow">🕵️ Identifica — {dificultad}</p>
        <div className="flex gap-3 text-xs text-mist-400">
          <span>🔥 Racha: {progreso.identifica?.racha ?? 0}</span>
          <span>⭐ Puntaje: {progreso.identifica?.puntaje ?? 0}</span>
        </div>
      </div>

      <div className="lab-card flex flex-col gap-3 p-5">
        {pistas.slice(0, pistasVisibles).map((p, i) => (
          <p key={i} className="text-sm text-mist-200">{p}</p>
        ))}
        {pistasVisibles < pistas.length && !seleccion && (
          <button
            onClick={pedirPista}
            className="focus-ring mt-1 w-fit rounded-lg border border-base-600 px-3 py-1.5 text-xs hover:border-gold hover:text-gold"
          >
            + Pedir otra pista ({pistas.length - pistasVisibles} disponibles)
          </button>
        )}
        <p className="mt-1 text-xs text-mist-400">Puntos si aciertas ahora: {puntosActuales}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {opciones.map((op) => {
          const esCorrecta = op === objetivo.nombreCientifico;
          const esSeleccionada = op === seleccion;
          let estilo = "border-base-600 hover:border-bio";
          if (seleccion) {
            if (esCorrecta) estilo = "border-bio bg-bio/10 text-bio";
            else if (esSeleccionada) estilo = "border-alert bg-alert/10 text-alert";
            else estilo = "border-base-700 opacity-60";
          }
          return (
            <button
              key={op}
              onClick={() => responder(op)}
              className={`focus-ring rounded-lg border px-4 py-2.5 text-left text-sm italic transition ${estilo}`}
            >
              {op}
            </button>
          );
        })}
      </div>

      {seleccion && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-mist-400">
            {seleccion === objetivo.nombreCientifico ? "¡Correcto!" : `Era: ${objetivo.nombreCientifico}`}
          </p>
          <button
            onClick={nuevaRonda}
            className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
          >
            Siguiente caso →
          </button>
        </div>
      )}
    </div>
  );
}
