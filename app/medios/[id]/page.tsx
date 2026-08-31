import { notFound } from "next/navigation";
import Link from "next/link";
import { getMedioDinamico } from "@/lib/supabase/cms";
import { imagenesMedios, getImagen } from "@/lib/images";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const medio = await getMedioDinamico(params.id);
  if (!medio) return notFound();

  const imagen = getImagen(imagenesMedios, medio.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/medios" className="section-eyebrow hover:text-bio-glow">
        « Medios de cultivo
      </Link>
      <h1 className="font-display text-2xl font-bold">{medio.nombre}</h1>

      {imagen && (
        <div className="max-w-sm">
          <ImagePlaceholder tipo="colonia" descripcion={medio.nombre} url={imagen} />
        </div>
      )}

      <div className="lab-card p-4">
        <p className="section-eyebrow mb-1">Propósito</p>
        <p className="text-sm text-mist-300">{medio.proposito}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-2">Permite crecer</p>
          <div className="flex flex-wrap gap-2">
            {medio.permite.length > 0 ? (
              medio.permite.map((p) => <span key={p} className="chip">{p}</span>)
            ) : (
              <span className="text-sm text-mist-400">No especificado</span>
            )}
          </div>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-2">Inhibe</p>
          <div className="flex flex-wrap gap-2">
            {medio.inhibe.length > 0 ? (
              medio.inhibe.map((p) => <span key={p} className="chip">{p}</span>)
            ) : (
              <span className="text-sm text-mist-400">No especificado</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Tipo</p>
          <p className="text-sm text-mist-300">{medio.tipo}</p>
        </div>
        <div className="lab-card p-4">
          <p className="section-eyebrow mb-1">Apariencia de colonias</p>
          <p className="text-sm text-mist-300">{medio.aparienciaColonias}</p>
        </div>
      </div>
    </div>
  );
}
