import { getMicroorganismosPorCategoria } from "@/lib/content";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Bacterias — BacteriDex" };
export const revalidate = 60;

export default async function Page() {
  const bacterias = await getMicroorganismosPorCategoria("bacterias");
  return <CategoryBrowser organismos={bacterias} titulo="Bacterias" emoji="🦠" />;
}
