import { notFound } from "next/navigation";
import { hongos } from "@/lib/data";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return hongos.map((h) => ({ id: h.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const organismo = hongos.find((h) => h.id === params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
