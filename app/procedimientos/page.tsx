import { getProcedimientosLab } from "@/lib/content";
import ProcedimientosListClient from "@/components/procedimientos/ProcedimientosListClient";

export const metadata = { title: "Procedimientos — BacteriDex" };
export const revalidate = 60;

export default async function ProcedimientosPage() {
  const procedimientos = await getProcedimientosLab();
  return <ProcedimientosListClient procedimientos={procedimientos} />;
}
