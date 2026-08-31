import { getOrganismosDinamicos } from "@/lib/supabase/cms";
import CategoryBrowser from "@/components/CategoryBrowser";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Bacterias – BacteriDex" };

export default async function Page() {
  const organismos = await getOrganismosDinamicos("bacterias");
  return <CategoryBrowser organismos={organismos} titulo="Bacterias" emoji="🦠" />;
}
