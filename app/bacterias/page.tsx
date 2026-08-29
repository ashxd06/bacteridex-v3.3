import { bacterias } from "@/lib/data";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Bacterias — BacteriDex" };

export default function Page() {
  return <CategoryBrowser organismos={bacterias} titulo="Bacterias" emoji="🦠" />;
}
