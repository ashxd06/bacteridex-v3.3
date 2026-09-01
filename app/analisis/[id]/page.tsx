"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { analisisClinicos, CATEGORIAS_ANALISIS, procedimientos } from "@/lib/data";
import { listarInsertos, urlPublicaInserto, type InsertoFila } from "@/lib/insertos";

export default function Page({ params }: { params: { id: string } }) {
  const analisis = analisisClinicos.find((a) => a.id === params.id);
  const [insertos, setInsertos] = useState<InsertoFila[]>([]);

  useEffect(() => {
    if (!analisis) return;
    listarInsertos().then((data) =>
      setInsertos(data.filter((i) => i.analisis_id === analisis.id && i.estado === "vigente"))
    );
  }, [analisis]);

  if (!analisis) return notFound();

  const categoria = CATEGORIAS_ANALISIS.find((c) => c.id === analisis.categoria);
  const procedimientosRelacionados = procedimientos.filter((p) =>
    analisis.procedimientosRelacionados.includes(p.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <Link href="/analisis" className="section-eyebrow hover:text-bio-glow">
        ← Análisis Clínicos
      </Link>
      <div>
        <span className="chip mb-2 inline-block">{categoria?.emoji} {categoria?.label}</span>
        <h1 className="font-display text-2xl font-bold">{analisis.nombre}</h1>
      </div>

      <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-mist-200">
        <strong className="text-gold">Nota:</strong> {analisis.notaProtocolo}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Descripción</p>
          <p className="text-sm text-mist-300">{analisis.descripcion}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Utilidad clínica</p>
          <p className="text-sm text-mist-300">{analisis.utilidad}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Tipo de muestra</p>
          <p className="text-sm text-mist-300">{analisis.tipoMuestra}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Condiciones de la muestra</p>
          <p className="text-sm text-mist-300">{analisis.condicionesMuestra}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Método</p>
          <p className="text-sm text-mist-300">{analisis.metodo}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-2">Parámetros</p>
          <div className="flex flex-wrap gap-2">
            {analisis.parametros.map((p) => (
              <span key={p} className="chip">{p}</span>
            ))}
            {analisis.longitudOnda && <span className="chip">λ {analisis.longitudOnda}</span>}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListaChips titulo="Reactivos" items={analisis.reactivos} />
        <ListaChips titulo="Materiales" items={analisis.materiales} />
      </div>

      <section>
        <p className="section-eyebrow mb-3">Procedimiento general</p>
        <ol className="flex flex-col gap-2">
          {analisis.procedimientoGeneral.map((paso, i) => (
            <li key={i} className="lab-card flex gap-3 p-3 text-sm text-mist-200">
              <span className="chip h-fit shrink-0">{i + 1}</span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
      </section>

      {analisis.formula && (
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">🧮 Fórmula</p>
          <p className="font-mono text-sm text-mist-200">{analisis.formula}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Unidades</p>
          <p className="text-sm text-mist-300">{analisis.unidades}</p>
        </div>
        <div className="rounded-xl border border-bio/30 bg-bio/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bio">Valores de referencia</p>
          <p className="mt-1 text-sm text-mist-200">{analisis.valoresReferencia}</p>
        </div>
      </div>

      <ListaChips titulo="⚠️ Consideraciones" items={analisis.consideraciones} />

      {insertos.length > 0 && (
        <div>
          <p className="section-eyebrow mb-3">📄 Insertos relacionados</p>
          <div className="flex flex-wrap gap-2">
            {insertos.map((i) => {
              const url = urlPublicaInserto(i.storage_path);
              return url ? (
                <a
                  key={i.id}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="chip hover:border-bio hover:text-bio"
                >
                  {i.nombre} ({i.fabricante})
                </a>
              ) : null;
            })}
          </div>
        </div>
      )}

      {procedimientosRelacionados.length > 0 && (
        <div>
          <p className="section-eyebrow mb-3">Procedimientos relacionados</p>
          <div className="flex flex-wrap gap-2">
            {procedimientosRelacionados.map((p) => (
              <Link key={p.id} href={`/procedimientos/${p.id}`} className="chip hover:border-bio hover:text-bio">
                {p.nombre}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="section-eyebrow mb-2">📚 Fuentes</p>
        <div className="flex flex-wrap gap-2">
          {analisis.fuentes.map((f) => (
            <span key={f} className="chip">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ListaChips({ titulo, items }: { titulo: string; items: string[] }) {
  return (
    <div className="lab-card p-4">
      <p className="section-eyebrow mb-2">{titulo}</p>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((it) => <span key={it} className="chip">{it}</span>)
        ) : (
          <span className="text-sm text-mist-400">No especificado</span>
        )}
      </div>
    </div>
  );
}
