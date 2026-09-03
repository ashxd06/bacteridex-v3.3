import type { EstadoResultado } from "@/lib/types";

const ESTILOS: Record<EstadoResultado, string> = {
  normal: "border-verde/50 bg-verde/10 text-verde",
  bajo: "border-gold/50 bg-gold/10 text-gold",
  alto: "border-gold/50 bg-gold/10 text-gold",
  critico: "border-alert/60 bg-alert/10 text-alert font-semibold",
  pendiente: "border-base-600 bg-base-800 text-mist-400"
};

const ETIQUETAS: Record<EstadoResultado, string> = {
  normal: "Normal",
  bajo: "Bajo",
  alto: "Alto",
  critico: "Crítico",
  pendiente: "Pendiente"
};

export default function EstadoBadge({ estado }: { estado: EstadoResultado }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs ${ESTILOS[estado]}`}>
      {ETIQUETAS[estado]}
    </span>
  );
}
