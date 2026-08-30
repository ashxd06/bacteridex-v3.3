"use client";

import { useEffect, useState } from "react";
import { cargarProgreso, type EstadoProgreso, estadoInicial } from "@/lib/progress";

export default function ProgresoResumen() {
  const [estado, setEstado] = useState<EstadoProgreso>(estadoInicial());
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setEstado(cargarProgreso());
    setListo(true);
  }, []);

  const xpDesdeNivel = estado.xp - (estado.nivel - 1) * 100;

  return (
    <div className="lab-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-gene/15 font-display text-xl font-bold text-gene">
          {listo ? estado.nivel : "—"}
        </div>
        <div>
          <p className="section-eyebrow">Nivel de estudiante</p>
          <p className="font-display text-lg font-semibold">{listo ? estado.xp : 0} XP total</p>
        </div>
      </div>
      <div className="flex-1 sm:max-w-xs">
        <div className="mb-1 flex justify-between text-xs text-mist-400">
          <span>Progreso al nivel {listo ? estado.nivel + 1 : 2}</span>
          <span>{listo ? xpDesdeNivel : 0}/100 XP</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-base-700">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gene-dim to-gene"
            style={{ width: `${listo ? Math.min(100, xpDesdeNivel) : 0}%` }}
          />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-mist-300">
        <span className="text-lg">🔥</span> {listo ? estado.racha : 0} días de racha
      </div>
    </div>
  );
}
