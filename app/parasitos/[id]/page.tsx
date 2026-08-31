import { notFound } from "next/navigation";
import { getOrganismoDinamico } from "@/lib/supabase/cms";
import OrganismDetail from "@/components/OrganismDetail";

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const organismo = await getOrganismoDinamico("parasitos", params.id);
  if (!organismo) return notFound();
  return <OrganismDetail organismo={organismo} />;
}
