import { virus } from "@/lib/data";
import CategoryBrowser from "@/components/CategoryBrowser";

export const metadata = { title: "Virus — BacteriDex" };

export default function Page() {
  return <CategoryBrowser organismos={virus} titulo="Virología" emoji="🧬" />;
}
