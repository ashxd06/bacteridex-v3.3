import { getAnalisisClinicos } from "@/lib/content";
import AnalisisListClient from "@/components/analisis/AnalisisListClient";

export const metadata = { title: "Análisis Clínicos — BacteriDex" };
export const revalidate = 60;

export default async function AnalisisPage() {
  const analisisClinicos = await getAnalisisClinicos();
  return <AnalisisListClient analisisClinicos={analisisClinicos} />;
}
