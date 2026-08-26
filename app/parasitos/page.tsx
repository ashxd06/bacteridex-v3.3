import { parasitos } from "@/lib/data";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Parásitos — BacteriDex" };

export default function Page() {
  return <CategoryBrowser organismos={parasitos} titulo="Parasitología" emoji="🪱" />;
}
