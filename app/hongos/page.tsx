import { getMicroorganismosPorCategoria } from "@/lib/content";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Hongos — BacteriDex" };
export const revalidate = 60;

export default async function Page() {
  const hongos = await getMicroorganismosPorCategoria("hongos");
  return <CategoryBrowser organismos={hongos} titulo="Hongos" emoji="🍄" />;
}
