"use client";

import { useEffect, useState } from "react";
import { listarInsertos, urlPublicaInserto, type InsertoFila } from "@/lib/insertos";

// Los insertos viven en Supabase (tabla pública `insertos`) y se listan con
// el cliente del navegador, igual que en app/insertos/page.tsx. Este
// componente se extrajo de app/analisis/[id]/page.tsx para poder convertir
// esa página en un Server Component (necesario para leer el análisis desde
// lib/content.ts) sin perder esta parte interactiva.
export default function InsertosRelacionados({ analisisId }: { analisisId: string }) {
  const [insertos, setInsertos] = useState<InsertoFila[]>([]);

  useEffect(() => {
    listarInsertos().then((data) =>
      setInsertos(data.filter((i) => i.analisis_id === analisisId && i.estado === "vigente"))
    );
  }, [analisisId]);

  if (insertos.length === 0) return null;

  return (
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
  );
}
