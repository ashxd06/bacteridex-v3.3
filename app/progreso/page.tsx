"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { todosLosOrganismos } from "@/lib/data";
import {
  cargarProgreso,
  porcentajeRegistro,
  type EstadoProgreso,
  estadoInicial
} from "@/lib/progress";

const MEDALLAS = [
  { id: "gram", nombre: "Maestro de Gram", emoji: "🏆", meta: (e: EstadoProgreso) => Object.values(e.registros).filter((r) => r.identificoGram).length >= 10 },
  { id: "cocos", nombre: "Cazador de cocos", emoji: "🏆", meta: (e: EstadoProgreso) => Object.keys(e.registros).length >= 5 },
  { id: "quiz", nombre: "Rey del quiz", emoji: "🏆", meta: (e: EstadoProgreso) => e.xp >= 100 },
  { id: "flash", nombre: "Estudiante constante", emoji: "🏆", meta: (e: EstadoProgreso) => Object.keys(e.flashcardsEstado).length >= 10 },
  { id: "nivel5", nombre: "Nivel 5 alcanzado", emoji: "🏆", meta: (e: EstadoProgreso) => e.nivel >= 5 }
];

export default function ProgresoPage() {
  const [estado, setEstado] = useState<EstadoProgreso>(estadoInicial());
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setEstado(cargarProgreso());
    setListo(true);
  }, []);

  const registrosCompletos = Object.entries(estado.registros).filter(
    ([, r]) => porcentajeRegistro(r) === 100
  ).length;

  const favoritos = todosLosOrganismos.filter((o) => estado.favoritos.includes(o.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="section-eyebrow">🏆 Progreso</p>
        <h1 className="font-display text-2xl font-bold">Tu avance en BacteriDex</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="lab-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-bio">{listo ? estado.xp : 0}</p>
          <p className="text-xs text-mist-400">XP total</p>
        </div>
        <div className="lab-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-gene">{listo ? estado.nivel : 1}</p>
          <p className="text-xs text-mist-400">Nivel</p>
        </div>
        <div className="lab-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-gold">
            {listo ? Object.keys(estado.registros).length : 0}
          </p>
          <p className="text-xs text-mist-400">Fichas iniciadas</p>
        </div>
        <div className="lab-card p-4 text-center">
          <p className="font-display text-2xl font-bold text-mist-100">
            {listo ? registrosCompletos : 0}
          </p>
          <p className="text-xs text-mist-400">Registros al 100%</p>
        </div>
      </div>

      <section>
        <p className="section-eyebrow mb-3">Medallas</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {MEDALLAS.map((m) => {
            const conseguida = listo && m.meta(estado);
            return (
              <div
                key={m.id}
                className={`lab-card flex flex-col items-center gap-1 p-4 text-center ${
                  conseguida ? "" : "opacity-40 grayscale"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs">{m.nombre}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <p className="section-eyebrow mb-3">Favoritos</p>
        {favoritos.length === 0 ? (
          <p className="text-sm text-mist-400">
            Aún no marcaste favoritos. Ábrelos desde cualquier ficha con el botón ☆.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {favoritos.map((o) => (
              <Link
                key={o.id}
                href={`/${o.categoria}/${o.id}`}
                className="chip hover:border-gold hover:text-gold"
              >
                {o.nombreCientifico}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
