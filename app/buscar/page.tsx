"use client";

import { useState } from "react";
import Link from "next/link";
import { buscarGlobal } from "@/lib/data";

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const resultados = buscarGlobal(query);

  const hrefPara = (r: (typeof resultados)[number]) => {
    if (r.tipo === "organismo") return `/${r.categoria}/${r.id}`;
    if (r.tipo === "prueba") return `/pruebas/${r.id}`;
    if (r.tipo === "procedimiento") return `/procedimientos/${r.id}`;
    if (r.tipo === "analisis") return `/analisis/${r.id}`;
    return `/medios/${r.id}`;
  };

  const iconoPara = (tipo: string) =>
    tipo === "organismo" ? "🧫" : tipo === "prueba" ? "🧪" : tipo === "procedimiento" ? "📋" : tipo === "analisis" ? "🧬" : "🧫";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">🔎 Buscador global</p>
        <h1 className="font-display text-2xl font-bold">Encuentra cualquier cosa en BacteriDex</h1>
        <p className="text-sm text-mist-400">
          Busca por nombre científico, prueba de laboratorio, medio de cultivo, procedimiento,
          muestra clínica o enfermedad. Ej: "novobiocina", "catalasa", "hemocultivo".
        </p>
      </div>

      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Escribe para buscar…"
        className="focus-ring w-full rounded-xl border border-base-600 bg-base-800 px-4 py-3 text-base placeholder:text-mist-400 focus:border-cian"
      />

      {query && (
        <p className="text-xs text-mist-400">{resultados.length} resultados</p>
      )}

      <div className="flex flex-col gap-2">
        {resultados.map((r) => (
          <Link
            key={`${r.tipo}-${r.id}`}
            href={hrefPara(r)}
            className="lab-card focus-ring flex items-center justify-between p-4"
          >
            <div>
              <p className="font-medium italic">{r.titulo}</p>
              <p className="text-xs text-mist-400">{r.subtitulo}</p>
            </div>
            <span className="text-lg">{iconoPara(r.tipo)}</span>
          </Link>
        ))}
        {query && resultados.length === 0 && (
          <div className="lab-card p-8 text-center text-mist-400">
            Sin resultados para "{query}".
          </div>
        )}
      </div>
    </div>
  );
}
