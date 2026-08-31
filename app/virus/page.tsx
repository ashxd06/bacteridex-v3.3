import { getOrganismosDinamicos } from "@/lib/supabase/cms";
import CategoryBrowser from "@/components/CategoryBrowser";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Virus – BacteriDex" };

export default async function Page() {
  const organismos = await getOrganismosDinamicos("virus");
  return <CategoryBrowser organismos={organismos} titulo="Virus" emoji="🧬" />;
}
