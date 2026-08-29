import { notFound } from "next/navigation";
import Link from "next/link";
import { procedimientos, CATEGORIAS_PROCEDIMIENTOS, todosLosOrganismos } from "@/lib/data";
import { imagenesProcedimientos, getImagen } from "@/lib/images";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export function generateStaticParams() {
  return procedimientos.map((p) => ({ id: p.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const proc = procedimientos.find((p) => p.id === params.id);
  if (!proc) return notFound();

  const categoria = CATEGORIAS_PROCEDIMIENTOS.find((c) => c.id === proc.categoria);
  const relacionados = todosLosOrganismos.filter((o) => proc.microorganismosRelacionados.includes(o.id));
  const imagen = getImagen(imagenesProcedimientos, proc.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/procedimientos" className="section-eyebrow hover:text-bio-glow">
        ← Procedimientos
      </Link>
      <div>
        <span className="chip mb-2 inline-block">{categoria?.emoji} {categoria?.label}</span>
        <h1 className="font-display text-2xl font-bold">{proc.nombre}</h1>
      </div>

      {imagen && (
        <div className="max-w-sm">
          <ImagePlaceholder tipo="ilustracion" descripcion={proc.nombre} url={imagen} />
        </div>
      )}

      <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-sm text-mist-200">
        <strong className="text-gold">Nota:</strong> {proc.notaProtocolo}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Objetivo</p>
          <p className="text-sm text-mist-300">{proc.objetivo}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Fundamento</p>
          <p className="text-sm text-mist-300">{proc.fundamento}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Tipo de muestra</p>
          <p className="text-sm text-mist-300">{proc.tipoMuestra}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Preparación previa</p>
          <p className="text-sm text-mist-300">{proc.preparacionPrevia || "No requiere preparación especial adicional."}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <ListaChips titulo="Materiales" items={proc.materiales} />
        <ListaChips titulo="Reactivos" items={proc.reactivos} />
        <ListaChips titulo="Equipos" items={proc.equipos} />
      </div>

      <section>
        <p className="section-eyebrow mb-3">Procedimiento general</p>
        <ol className="flex flex-col gap-2">
          {proc.procedimientoGeneral.map((paso, i) => (
            <li key={i} className="lab-card flex gap-3 p-3 text-sm text-mist-200">
              <span className="chip h-fit shrink-0">{i + 1}</span>
              <span>{paso}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="lab-card p-4">
        <p className="section-eyebrow mb-1">Interpretación</p>
        <p className="text-sm text-mist-300">{proc.interpretacion}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-bio/30 bg-bio/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bio">Resultado positivo</p>
          <p className="mt-1 text-sm text-mist-200">{proc.resultadoPositivo}</p>
        </div>
        <div className="rounded-xl border border-alert/30 bg-alert/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-alert">Resultado negativo</p>
          <p className="mt-1 text-sm text-mist-200">{proc.resultadoNegativo}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ListaChips titulo="⚠️ Errores frecuentes" items={proc.erroresFrecuentes} />
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Control de calidad</p>
          <p className="text-sm text-mist-300">{proc.controlCalidad}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">🧤 Bioseguridad</p>
          <p className="text-sm text-mist-300">{proc.bioseguridad}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Limitaciones</p>
          <p className="text-sm text-mist-300">{proc.limitaciones}</p>
        </div>
      </div>

      {relacionados.length > 0 && (
        <div>
          <p className="section-eyebrow mb-3">Microorganismos relacionados</p>
          <div className="flex flex-wrap gap-2">
            {relacionados.map((o) => (
              <Link key={o.id} href={`/${o.categoria}/${o.id}`} className="chip hover:border-bio hover:text-bio">
                {o.nombreCientifico}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="section-eyebrow mb-2">📚 Fuentes</p>
        <div className="flex flex-wrap gap-2">
          {proc.fuentes.map((f) => (
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
