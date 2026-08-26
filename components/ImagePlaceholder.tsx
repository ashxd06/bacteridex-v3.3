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
  url
}: {
  tipo: string;
  descripcion: string;
  url?: string | null;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={descripcion}
        className="aspect-square w-full rounded-2xl border border-base-600 object-cover"
      />
    );
  }

  return (
    <div className="lab-card flex aspect-square flex-col items-center justify-center gap-2 p-4 text-center">
      <span className="text-3xl opacity-70">{iconoPorTipo[tipo] ?? "🧫"}</span>
      <p className="text-xs text-mist-400">{descripcion}</p>
      <span className="chip text-[10px] uppercase tracking-wide">Sin imagen disponible</span>
    </div>
  );
}
