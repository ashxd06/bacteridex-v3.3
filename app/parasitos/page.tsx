import { getOrganismosDinamicos } from "@/lib/supabase/cms";
import CategoryBrowser from "@/components/CategoryBrowser";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Parásitos – BacteriDex" };

export default async function Page() {
  const organismos = await getOrganismosDinamicos("parasitos");
  return <CategoryBrowser organismos={organismos} titulo="Parásitos" emoji="🪱" />;
}
