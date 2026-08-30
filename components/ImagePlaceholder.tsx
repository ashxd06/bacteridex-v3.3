"use client";

import { useState } from "react";

const iconoPorTipo: Record<string, string> = {
  microscopia: "🔬",
  colonia: "🧫",
  tincion: "🎨",
  prueba: "🧪",
  ilustracion: "🧬"
};

export default function ImagePlaceholder({
  tipo,
  descripcion,
  url,
  candidatos,
  onAbrir
}: {
  tipo: string;
  descripcion: string;
  url?: string | null;
  // Rutas alternativas a probar en orden (una por extensión soportada) cuando
  // no hay una URL manual explícita. Ver lib/images.ts (candidatosMicroscopica
  // / candidatosAgar) para cómo se generan a partir del nombre científico.
  candidatos?: string[];
  // Se llama con la URL que efectivamente cargó, para poder ampliarla en un
  // visor. Si no se pasa, la imagen simplemente no es clicable para ampliar.
  onAbrir?: (src: string) => void;
}) {
  const [indice, setIndice] = useState(0);
  const [agotado, setAgotado] = useState(false);

  // Prioridad 1: URL manual explícita (lib/images.ts, ya confirmada por el autor).
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={descripcion}
        onClick={() => onAbrir?.(url)}
        className={`aspect-square w-full rounded-2xl border border-base-600 object-cover ${
          onAbrir ? "cursor-zoom-in" : ""
        }`}
      />
    );
  }

  // Prioridad 2: detección automática por carpeta/nombre del microorganismo.
  if (candidatos && candidatos.length > 0 && !agotado) {
    const actual = candidatos[indice];
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={actual}
        alt={descripcion}
        onClick={() => onAbrir?.(actual)}
        onError={() => {
          if (indice + 1 < candidatos.length) {
            setIndice((i) => i + 1);
          } else {
            setAgotado(true);
          }
        }}
        className={`aspect-square w-full rounded-2xl border border-base-600 object-cover ${
          onAbrir ? "cursor-zoom-in" : ""
        }`}
      />
    );
  }

  // Sin URL manual ni archivo automático encontrado: comportamiento actual.
  return (
    <div className="lab-card flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center">
      <span className="text-3xl opacity-70">{iconoPorTipo[tipo] ?? "🧫"}</span>
      <p className="text-xs text-mist-400">{descripcion}</p>
      <span className="chip text-[10px] uppercase tracking-wide">Sin imagen disponible</span>
    </div>
  );
}
