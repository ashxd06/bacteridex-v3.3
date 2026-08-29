import { notFound } from "next/navigation";
import Link from "next/link";
import { pruebas, organismosRelacionadosConPrueba } from "@/lib/data";
import { imagenesPruebas, getImagen } from "@/lib/images";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export function generateStaticParams() {
  return pruebas.map((p) => ({ id: p.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const prueba = pruebas.find((p) => p.id === params.id);
  if (!prueba) return notFound();

  const relacionados = organismosRelacionadosConPrueba(prueba.nombre);
  const imagen = getImagen(imagenesPruebas, prueba.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/pruebas" className="section-eyebrow hover:text-bio-glow">
        ← Pruebas de laboratorio
      </Link>
      <h1 className="font-display text-2xl font-bold">{prueba.nombre}</h1>

      {imagen && (
        <div className="max-w-sm">
          <ImagePlaceholder tipo="prueba" descripcion={prueba.nombre} url={imagen} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">¿Qué es?</p>
          <p className="text-sm text-mist-300">{prueba.queEs}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">¿Qué detecta?</p>
          <p className="text-sm text-mist-300">{prueba.queDetecta}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">¿Cómo se interpreta?</p>
          <p className="text-sm text-mist-300">{prueba.comoSeInterpreta}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Diferencia entre</p>
          <ul className="list-inside list-disc text-sm text-mist-300">
            {prueba.diferencia.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-bio/30 bg-bio/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-bio">Positivo</p>
          <p className="mt-1 text-sm text-mist-200">{prueba.positivo}</p>
        </div>
        <div className="rounded-xl border border-alert/30 bg-alert/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-alert">Negativo</p>
          <p className="mt-1 text-sm text-mist-200">{prueba.negativo}</p>
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
    </div>
  );
}
