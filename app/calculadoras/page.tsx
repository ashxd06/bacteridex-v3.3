import Link from "next/link";
import { getCalculadoras } from "@/lib/content";

export const metadata = { title: "Calculadoras — BacteriDex" };
export const revalidate = 60;

export default async function CalculadorasPage() {
  const calculadoras = await getCalculadoras();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">🧮 Calculadoras</p>
        <h1 className="font-display text-2xl font-bold">Herramientas de cálculo de laboratorio</h1>
        <p className="text-sm text-mist-400">
          {calculadoras.length} calculadora{calculadoras.length === 1 ? "" : "s"} disponible
          {calculadoras.length === 1 ? "" : "s"}. Contenido educativo — verifica siempre la fórmula
          antes de usarla en la práctica real.
        </p>
      </div>

      {calculadoras.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">
          Todavía no hay calculadoras publicadas. Se irán agregando desde el panel de administración.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {calculadoras.map((c) => (
            <Link key={c.id} href={`/calculadoras/${c.id}`} className="lab-card focus-ring p-4">
              <h3 className="font-display font-semibold">{c.nombre}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-mist-400">{c.descripcion}</p>
              {!c.formula.trim() && <span className="chip mt-2 inline-block text-[10px] text-gold">Pendiente</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
