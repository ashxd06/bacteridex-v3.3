import { notFound } from "next/navigation";
import { bacterias } from "@/lib/data";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return bacterias.map((b) => ({ id: b.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const organismo = bacterias.find((b) => b.id === params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
