import { notFound } from "next/navigation";
import { parasitos as parasitosJSON } from "@/lib/data";
import { getMicroorganismo } from "@/lib/content";
import OrganismDetail from "@/components/OrganismDetail";

export function generateStaticParams() {
  return parasitosJSON.map((o) => ({ id: o.id }));
}

export const dynamicParams = true;
export const revalidate = 60;

export default async function Page({ params }: { params: { id: string } }) {
  const organismo = await getMicroorganismo("parasitos", params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
