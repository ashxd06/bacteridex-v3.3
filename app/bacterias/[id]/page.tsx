import { notFound } from "next/navigation";
import { bacterias as bacteriasJSON } from "@/lib/data";
import { getMicroorganismo } from "@/lib/content";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return bacteriasJSON.map((o) => ({ id: o.id }));
}

export const dynamicParams = true;
export const revalidate = 60;

export default async function Page({ params }: { params: { id: string } }) {
  const organismo = await getMicroorganismo("bacterias", params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
