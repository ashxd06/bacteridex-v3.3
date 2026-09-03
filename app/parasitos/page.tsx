import { getMicroorganismosPorCategoria } from "@/lib/content";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Parásitos — BacteriDex" };
export const revalidate = 60;

export default async function Page() {
  const parasitos = await getMicroorganismosPorCategoria("parasitos");
  return <CategoryBrowser organismos={parasitos} titulo="Parásitos" emoji="🪱" />;
}
