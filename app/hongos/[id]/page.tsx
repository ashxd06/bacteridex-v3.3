import { notFound } from "next/navigation";
import { hongos as hongosJSON } from "@/lib/data";
import { getMicroorganismo } from "@/lib/content";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return hongosJSON.map((o) => ({ id: o.id }));
}

export const dynamicParams = true;
export const revalidate = 60;

export default async function Page({ params }: { params: { id: string } }) {
  const organismo = await getMicroorganismo("hongos", params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
