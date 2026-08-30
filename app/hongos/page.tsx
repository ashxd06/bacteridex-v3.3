import { hongos } from "@/lib/data";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Hongos — BacteriDex" };

export default function Page() {
  return <CategoryBrowser organismos={hongos} titulo="Micología" emoji="🍄" />;
}
