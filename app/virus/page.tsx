import { getMicroorganismosPorCategoria } from "@/lib/content";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Virus — BacteriDex" };
export const revalidate = 60;

export default async function Page() {
  const virus = await getMicroorganismosPorCategoria("virus");
  return <CategoryBrowser organismos={virus} titulo="Virus" emoji="🧬" />;
}
