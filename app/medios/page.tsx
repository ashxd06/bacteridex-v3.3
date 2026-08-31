import Link from "next/link";
import { getMediosDinamicos } from "@/lib/supabase/cms";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Medios de cultivo – BacteriDex" };

export default async function Page() {
  const medios = await getMediosDinamicos();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">🧪 Biblioteca</p>
        <h1 className="font-display text-2xl font-bold">Medios de cultivo</h1>
        <p className="text-sm text-mist-400">{medios.length} medios documentados</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {medios.map((m) => (
          <Link key={m.id} href={/medios/ + m.id} className="lab-card focus-ring p-4">
            <h3 className="font-display font-semibold">{m.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-mist-400">{m.proposito}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
