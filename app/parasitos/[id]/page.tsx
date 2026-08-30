import { notFound } from "next/navigation";
import { parasitos } from "@/lib/data";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return parasitos.map((p) => ({ id: p.id }));
}

export default function Page({ params }: { params: { id: string } }) {
  const organismo = parasitos.find((p) => p.id === params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
