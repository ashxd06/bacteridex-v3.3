"use client";

import { useMemo, useState } from "react";
import type { ResultadoAnalisis } from "@/lib/study/types";
import StudyFlashcards from "./StudyFlashcards";
import StudyExam from "./StudyExam";

const PESTANAS = [
  "Resumen",
  "Temas",
  "Conceptos",
  "Microorganismos",
  "Tablas",
  "Imágenes",
  "Flashcards",
  "Examen"
] as const;
type Pestana = (typeof PESTANAS)[number];

export default function StudyDashboard({
  resultado,
  filename,
  documentId
}: {
  resultado: ResultadoAnalisis;
  filename: string;
  documentId: string;
}) {
  const [pestana, setPestana] = useState<Pestana>("Resumen");
  const [busqueda, setBusqueda] = useState("");

  const resultadosBusqueda = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return null;
    const encontrados: { texto: string; pagina: number | null }[] = [];
    for (const t of resultado.temas) {
      if (t.titulo.toLowerCase().includes(q) || t.contenido.toLowerCase().includes(q)) {
        encontrados.push({ texto: t.titulo, pagina: t.pagina });
      }
    }
    for (const c of resultado.conceptos_clave) {
      if (c.termino.toLowerCase().includes(q) || c.explicacion.toLowerCase().includes(q)) {
        encontrados.push({ texto: c.termino, pagina: c.pagina });
      }
    }
    return encontrados.slice(0, 20);
  }, [busqueda, resultado]);

  return (
    <div className="flex flex-col gap-6">
      <div className="lab-card p-5">
        <p className="section-eyebrow">📚 Material de estudio</p>
        <h1 className="font-display text-xl font-bold">{filename}</h1>
        {resultado.paginas_analizadas && (
          <p className="text-xs text-mist-400">{resultado.paginas_analizadas} páginas analizadas</p>
        )}
        <p className="mt-3 text-sm text-mist-300">{resultado.resumen_general}</p>
        {resultado.advertencia_confianza && (
          <p className="mt-2 rounded-lg border border-gold/30 bg-gold/10 p-2 text-xs text-gold">
            ⚠️ {resultado.advertencia_confianza}
          </p>
        )}

        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          <Estadistica emoji="📑" valor={resultado.temas.length} label="Temas" />
          <Estadistica emoji="🦠" valor={resultado.microorganismos.length} label="Microorganismos" />
          <Estadistica emoji="🧪" valor={resultado.conceptos_clave.length} label="Conceptos" />
          <Estadistica emoji="📊" valor={resultado.tablas.length} label="Tablas" />
          <Estadistica emoji="🃏" valor={resultado.flashcards.length} label="Flashcards" />
          <Estadistica emoji="❓" valor={resultado.preguntas.length} label="Preguntas" />
        </div>
      </div>

      <input
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="🔎 Buscar dentro de este material…"
        className="focus-ring rounded-lg border border-base-600 bg-base-800 px-4 py-2.5 text-sm placeholder:text-mist-400"
      />
      {resultadosBusqueda && (
        <div className="lab-card flex flex-col gap-1 p-3">
          {resultadosBusqueda.length === 0 ? (
            <p className="text-xs text-mist-400">Sin resultados.</p>
          ) : (
            resultadosBusqueda.map((r, i) => (
              <p key={i} className="text-xs text-mist-300">
                {r.texto} {r.pagina ? <span className="text-mist-400">— página {r.pagina}</span> : null}
              </p>
            ))
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 border-b border-base-700 pb-2">
        {PESTANAS.map((p) => (
          <button
            key={p}
            onClick={() => setPestana(p)}
            className={`focus-ring rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              pestana === p ? "bg-bio/15 text-bio" : "text-mist-400 hover:text-mist-100"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {pestana === "Resumen" && (
        <div className="lab-card p-5 text-sm text-mist-300">{resultado.resumen_general}</div>
      )}

      {pestana === "Temas" && (
        <div className="flex flex-col gap-3">
          {resultado.temas.map((t, i) => (
            <div key={i} className="lab-card p-4">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold">{t.titulo}</p>
                <span className="chip text-[10px]">{t.categoria}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-mist-300">{t.contenido}</p>
              <FuentePagina pagina={t.pagina} />
            </div>
          ))}
        </div>
      )}

      {pestana === "Conceptos" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {resultado.conceptos_clave.map((c, i) => (
            <div key={i} className="lab-card p-4">
              <p className="font-display font-semibold text-bio">{c.termino}</p>
              <p className="mt-1 text-sm text-mist-300">{c.explicacion}</p>
              <FuentePagina pagina={c.pagina} />
            </div>
          ))}
        </div>
      )}

      {pestana === "Microorganismos" && (
        <div className="flex flex-col gap-3">
          {resultado.microorganismos.length === 0 ? (
            <p className="text-sm text-mist-400">No se identificaron microorganismos específicos en este documento.</p>
          ) : (
            resultado.microorganismos.map((m, i) => (
              <div key={i} className="lab-card p-4">
                <p className="font-display italic font-semibold">{m.nombre}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="chip">{m.tipo}</span>
                  {m.gram && <span className="chip">Gram {m.gram}</span>}
                  {m.morfologia && <span className="chip">{m.morfologia}</span>}
                </div>
                <p className="mt-2 text-sm text-mist-300">{m.caracteristicas}</p>
                {m.enfermedades && <p className="mt-1 text-xs text-mist-400"><strong>Enfermedades:</strong> {m.enfermedades}</p>}
                {m.diagnostico && <p className="text-xs text-mist-400"><strong>Diagnóstico:</strong> {m.diagnostico}</p>}
                <FuentePagina pagina={m.pagina} />
              </div>
            ))
          )}
        </div>
      )}

      {pestana === "Tablas" && (
        <div className="flex flex-col gap-4">
          {resultado.tablas.length === 0 ? (
            <p className="text-sm text-mist-400">No se detectaron tablas en este documento.</p>
          ) : (
            resultado.tablas.map((t, i) => (
              <div key={i} className="lab-card overflow-hidden p-4">
                <p className="mb-2 font-display font-semibold">{t.titulo}</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead className="text-mist-400">
                      <tr>
                        {t.encabezados.map((h, hi) => (
                          <th key={hi} className="border-b border-base-700 px-2 py-1.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {t.filas.map((fila, fi) => (
                        <tr key={fi} className="border-b border-base-800">
                          {fila.map((celda, ci) => (
                            <td key={ci} className="px-2 py-1.5 text-mist-300">{celda}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <FuentePagina pagina={t.pagina} />
              </div>
            ))
          )}
        </div>
      )}

      {pestana === "Imágenes" && (
        <div className="flex flex-col gap-3">
          {resultado.imagenes_interpretadas.length === 0 ? (
            <p className="text-sm text-mist-400">No se interpretaron imágenes relevantes en este documento.</p>
          ) : (
            resultado.imagenes_interpretadas.map((img, i) => (
              <div key={i} className="lab-card p-4">
                <p className="text-sm text-mist-200">🖼️ {img.descripcion}</p>
                <p className="mt-1 text-sm text-mist-300">{img.interpretacion}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`chip text-[10px] ${img.tipo === "interpretacion_ia" ? "border-gene/40 text-gene" : "border-bio/40 text-bio"}`}>
                    {img.tipo === "interpretacion_ia" ? "🤖 Interpretación IA" : "📄 Información extraída"}
                  </span>
                  <FuentePagina pagina={img.pagina} />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {pestana === "Flashcards" && <StudyFlashcards flashcards={resultado.flashcards} documentId={documentId} />}
      {pestana === "Examen" && <StudyExam preguntas={resultado.preguntas} />}
    </div>
  );
}

function Estadistica({ emoji, valor, label }: { emoji: string; valor: number; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg font-bold text-mist-100">{emoji} {valor}</p>
      <p className="text-[10px] text-mist-400">{label}</p>
    </div>
  );
}

function FuentePagina({ pagina }: { pagina: number | null }) {
  if (!pagina) return null;
  return <p className="mt-2 text-[11px] text-mist-400">📄 Fuente: PDF — página {pagina}</p>;
}
