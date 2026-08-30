"use client";

import { useMemo, useState } from "react";
import type { Organismo } from "@/lib/types";
import OrganismCard from "./OrganismCard";

const PRIORIDADES = [
  { id: "muy-frecuente", label: "🔴 Muy frecuente" },
  { id: "frecuente", label: "🟠 Frecuente" },
  { id: "importancia-clinica", label: "🟡 Importancia clínica" },
  { id: "especializado", label: "🔵 Especializado" },
  { id: "raro", label: "🟣 Raro" }
];

export default function CategoryBrowser({
  organismos,
  titulo,
  emoji
}: {
  organismos: Organismo[];
  titulo: string;
  emoji: string;
}) {
  const [query, setQuery] = useState("");
  const [subgrupo, setSubgrupo] = useState<string>("todos");
  const [prioridad, setPrioridad] = useState<string>("todas");

  const subgrupos = useMemo(
    () => Array.from(new Set(organismos.map((o) => o.subgrupo))).sort(),
    [organismos]
  );

  const filtrados = organismos.filter((o) => {
    const coincideQuery =
      !query ||
      o.nombreCientifico.toLowerCase().includes(query.toLowerCase()) ||
      o.familia.toLowerCase().includes(query.toLowerCase());
    const coincideSubgrupo = subgrupo === "todos" || o.subgrupo === subgrupo;
    const coincidePrioridad = prioridad === "todas" || o.prioridad === prioridad;
    return coincideQuery && coincideSubgrupo && coincidePrioridad;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">{emoji} Colección</p>
        <h1 className="font-display text-2xl font-bold">{titulo}</h1>
        <p className="text-sm text-mist-400">{filtrados.length} de {organismos.length} registros</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o familia…"
          className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm placeholder:text-mist-400 sm:max-w-xs"
        />
        <select
          value={subgrupo}
          onChange={(e) => setSubgrupo(e.target.value)}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        >
          <option value="todos">Todos los subgrupos</option>
          {subgrupos.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        >
          <option value="todas">Toda prioridad</option>
          {PRIORIDADES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">
          No hay registros que coincidan con estos filtros. Prueba a limpiar la búsqueda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((o) => (
            <OrganismCard key={o.id} organismo={o} />
          ))}
        </div>
      )}
    </div>
  );
}
