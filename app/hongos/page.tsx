import { getOrganismosDinamicos } from "@/lib/supabase/cms";
import CategoryBrowser from "@/components/CategoryBrowser";

export const dynamic = 'force-dynamic';
export const metadata = { title: "Hongos – BacteriDex" };

export default async function Page() {
  const organismos = await getOrganismosDinamicos("hongos");
  return <CategoryBrowser organismos={organismos} titulo="Hongos" emoji="🍄" />;
}
