"use client";

import { useMemo, useState } from "react";
import { todosLosOrganismos } from "@/lib/data";
import type { Organismo } from "@/lib/types";

const CAMPOS: { label: string; get: (o: Organismo) => string }[] = [
  { label: "Familia", get: (o) => o.familia },
  { label: "Gram / clasificación", get: (o) => o.gram ?? o.genoma ?? o.tipoHongo ?? o.tipoParasito ?? "—" },
  { label: "Morfología", get: (o) => o.morfologia ?? "—" },
  { label: "Motilidad", get: (o) => o.motilidad ?? "—" },
  { label: "Oxígeno", get: (o) => o.oxigeno ?? "—" },
  { label: "Hábitat", get: (o) => o.habitat },
  { label: "Transmisión", get: (o) => o.transmision },
  { label: "Muestra clínica", get: (o) => o.muestraClinica.join(", ") },
  { label: "Medios de cultivo", get: (o) => o.mediosCultivo.join(", ") || "—" },
  { label: "Pruebas clave", get: (o) => o.pruebas.map((p) => `${p.nombre}: ${p.resultado}`).join(" · ") || "—" },
  { label: "Enfermedades", get: (o) => o.enfermedades.join(", ") },
  { label: "Importancia médica", get: (o) => o.importanciaMedica.queCausa }
];

export default function ComparadorPage() {
  const [seleccion, setSeleccion] = useState<string[]>([]);

  const opciones = useMemo(
    () =>
      [...todosLosOrganismos].sort((a, b) => a.nombreCientifico.localeCompare(b.nombreCientifico)),
    []
  );

  const organismos = seleccion
    .map((id) => todosLosOrganismos.find((o) => o.id === id))
    .filter(Boolean) as Organismo[];

  function alternar(id: string) {
    setSeleccion((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">⚖️ Comparador</p>
        <h1 className="font-display text-2xl font-bold">Compara hasta 3 microorganismos</h1>
        <p className="text-sm text-mist-400">
          Selecciona 2 o 3 fichas para ver sus diferencias lado a lado.
        </p>
      </div>

      <select
        onChange={(e) => e.target.value && alternar(e.target.value)}
        value=""
        className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
      >
        <option value="">+ Agregar microorganismo…</option>
        {opciones
          .filter((o) => !seleccion.includes(o.id))
          .map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombreCientifico}
            </option>
          ))}
      </select>

      {organismos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {organismos.map((o) => (
            <button
              key={o.id}
              onClick={() => alternar(o.id)}
              className="focus-ring chip hover:border-alert hover:text-alert"
            >
              {o.nombreCientifico} ✕
            </button>
          ))}
        </div>
      )}

      {organismos.length >= 2 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr>
                <th className="w-40 text-left text-xs uppercase tracking-wide text-mist-400">
                  Característica
                </th>
                {organismos.map((o) => (
                  <th key={o.id} className="px-3 text-left font-display italic text-mist-100">
                    {o.nombreCientifico}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAMPOS.map((campo) => (
                <tr key={campo.label} className="lab-card">
                  <td className="rounded-l-xl px-3 py-3 text-xs font-medium text-mist-400">
                    {campo.label}
                  </td>
                  {organismos.map((o) => (
                    <td key={o.id} className="px-3 py-3 text-mist-200">
                      {campo.get(o)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="lab-card p-8 text-center text-mist-400">
          Selecciona al menos 2 microorganismos para comparar.
        </div>
      )}
    </div>
  );
}
