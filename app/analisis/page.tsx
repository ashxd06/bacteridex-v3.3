"use client";

import { useState } from "react";
import Link from "next/link";
import { analisisClinicos, CATEGORIAS_ANALISIS } from "@/lib/data";

export default function AnalisisPage() {
  const [categoria, setCategoria] = useState<string>("todas");

  const filtrados =
    categoria === "todas" ? analisisClinicos : analisisClinicos.filter((a) => a.categoria === categoria);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">🧬 Análisis Clínicos</p>
        <h1 className="font-display text-2xl font-bold">Biblioteca de análisis de laboratorio</h1>
        <p className="text-sm text-mist-400">
          {analisisClinicos.length} análisis documentados · {filtrados.length} mostrados. Los
          valores de referencia y parámetros de método son generales — el inserto vigente del
          fabricante del reactivo siempre tiene prioridad.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoria("todas")}
          className={`focus-ring chip ${categoria === "todas" ? "border-bio text-bio" : "hover:border-bio hover:text-bio"}`}
        >
          Todas
        </button>
        {CATEGORIAS_ANALISIS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoria(c.id)}
            className={`focus-ring chip ${categoria === c.id ? "border-bio text-bio" : "hover:border-bio hover:text-bio"}`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtrados.map((a) => (
          <Link key={a.id} href={`/analisis/${a.id}`} className="lab-card focus-ring p-4">
            <span className="chip mb-2 inline-block text-[10px] uppercase tracking-wide">
              {CATEGORIAS_ANALISIS.find((c) => c.id === a.categoria)?.label}
            </span>
            <h3 className="font-display font-semibold">{a.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-mist-400">{a.descripcion}</p>
          </Link>
        ))}
        {filtrados.length === 0 && (
          <div className="lab-card col-span-full p-8 text-center text-mist-400">
            Aún no hay análisis en esta categoría. Se irán agregando en próximas actualizaciones.
          </div>
        )}
      </div>
    </div>
  );
}
