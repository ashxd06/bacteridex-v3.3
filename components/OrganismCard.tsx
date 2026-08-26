import Link from "next/link";
import type { Organismo } from "@/lib/types";

const colorPrioridad: Record<string, string> = {
  "muy-frecuente": "text-alert bg-alert/10 border-alert/30",
  frecuente: "text-gold bg-gold/10 border-gold/30",
  "importancia-clinica": "text-bio bg-bio/10 border-bio/30",
  especializado: "text-gene bg-gene/10 border-gene/30",
  raro: "text-mist-300 bg-base-700 border-base-600"
};

const labelPrioridad: Record<string, string> = {
  "muy-frecuente": "🔴 Muy frecuente",
  frecuente: "🟠 Frecuente",
  "importancia-clinica": "🟡 Importancia clínica",
  especializado: "🔵 Especializado",
  raro: "🟣 Raro"
};

export default function OrganismCard({ organismo }: { organismo: Organismo }) {
  return (
    <Link
      href={`/${organismo.categoria}/${organismo.id}`}
      className="lab-card focus-ring group flex flex-col gap-3 p-4"
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-mist-400">
          #{String(organismo.numero).padStart(3, "0")}
        </span>
        <span className={`chip border ${colorPrioridad[organismo.prioridad]}`}>
          {labelPrioridad[organismo.prioridad]}
        </span>
      </div>

      <div>
        <h3 className="font-display text-base font-semibold italic leading-snug text-mist-100 group-hover:text-bio">
          {organismo.nombreCientifico}
        </h3>
        <p className="text-xs text-mist-400">{organismo.subgrupo}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {organismo.gram && organismo.gram !== "no-aplica" && (
          <span className="chip">Gram {organismo.gram === "positivo" ? "+" : "−"}</span>
        )}
        {organismo.genoma && <span className="chip">{organismo.genoma}</span>}
        {organismo.tipoHongo && <span className="chip">{organismo.tipoHongo}</span>}
        {organismo.tipoParasito && <span className="chip">{organismo.tipoParasito}</span>}
      </div>

      <p className="line-clamp-2 text-xs text-mist-300">
        {organismo.importanciaMedica.queCausa}
      </p>

      <div className="mt-auto flex items-center justify-between pt-1 text-xs text-mist-400">
        <span>{"⭐".repeat(organismo.nivelImportancia)}</span>
        <span>{"🧪".repeat(organismo.nivelFrecuencia)}</span>
      </div>
    </Link>
  );
}
