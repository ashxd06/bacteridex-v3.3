"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIAS_PROCEDIMIENTOS } from "@/lib/data";
import type { Procedimiento } from "@/lib/types";

export default function ProcedimientosListClient({ procedimientos }: { procedimientos: Procedimiento[] }) {
  const [categoria, setCategoria] = useState<string>("todas");

  const filtrados =
    categoria === "todas" ? procedimientos : procedimientos.filter((p) => p.categoria === categoria);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">📋 Biblioteca educativa</p>
        <h1 className="font-display text-2xl font-bold">Procedimientos de Laboratorio Clínico</h1>
        <p className="text-sm text-mist-400">
          {procedimientos.length} procedimientos documentados · {filtrados.length} mostrados. Contenido
          educativo: sigue siempre el POE/protocolo vigente de tu laboratorio.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoria("todas")}
          className={`focus-ring chip ${categoria === "todas" ? "border-bio text-bio" : "hover:border-bio hover:text-bio"}`}
        >
          Todas
        </button>
        {CATEGORIAS_PROCEDIMIENTOS.map((c) => (
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
        {filtrados.map((p) => (
          <Link key={p.id} href={`/procedimientos/${p.id}`} className="lab-card focus-ring p-4">
            <span className="chip mb-2 inline-block text-[10px] uppercase tracking-wide">
              {CATEGORIAS_PROCEDIMIENTOS.find((c) => c.id === p.categoria)?.label}
            </span>
            <h3 className="font-display font-semibold">{p.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-mist-400">{p.objetivo}</p>
          </Link>
        ))}
        {filtrados.length === 0 && (
          <div className="lab-card col-span-full p-8 text-center text-mist-400">
            Aún no hay procedimientos en esta categoría. Se irán agregando en próximas actualizaciones.
          </div>
        )}
      </div>
    </div>
  );
}
