import Link from "next/link";
import { pruebas } from "@/lib/data";

export const metadata = { title: "Pruebas de laboratorio — BacteriDex" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">🧪 Biblioteca</p>
        <h1 className="font-display text-2xl font-bold">Pruebas de laboratorio</h1>
        <p className="text-sm text-mist-400">{pruebas.length} pruebas documentadas</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pruebas.map((p) => (
          <Link key={p.id} href={`/pruebas/${p.id}`} className="lab-card focus-ring p-4">
            <h3 className="font-display font-semibold">{p.nombre}</h3>
            <p className="mt-1 line-clamp-2 text-xs text-mist-400">{p.queEs}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
