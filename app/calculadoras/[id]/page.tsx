import { notFound } from "next/navigation";
import Link from "next/link";
import { getCalculadoraPorId } from "@/lib/content";
import CalculadoraClient from "@/components/calculadoras/CalculadoraClient";

export const dynamicParams = true;
export const revalidate = 60;

export default async function Page({ params }: { params: { id: string } }) {
  const calculadora = await getCalculadoraPorId(params.id);
  if (!calculadora) return notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/calculadoras" className="section-eyebrow hover:text-bio-glow">
        ← Calculadoras
      </Link>
      <CalculadoraClient calculadora={calculadora} />
      {calculadora.analisisId && (
        <Link href={`/analisis/${calculadora.analisisId}`} className="text-xs text-mist-400 hover:text-bio">
          Ver análisis clínico relacionado →
        </Link>
      )}
    </div>
  );
}
