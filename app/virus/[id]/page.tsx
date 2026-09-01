import { notFound } from "next/navigation";
import { virus } from "@/lib/data";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return virus.map((v) => ({ id: v.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const organismo = virus.find((v) => v.id === params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
