import Chat from "@/components/ai/Chat";

export const metadata = {
  title: "BacteriDex AI — Tu asistente de laboratorio",
  description: "Asistente inteligente para estudiar microbiología y laboratorio clínico.",
};

export default function AIPage({
  searchParams
}: {
  searchParams: { organismo?: string; q?: string };
}) {
  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
          <p className="section-eyebrow">🤖 IA Educativa</p>
          <h1 className="font-display text-2xl font-bold">BacteriDex AI</h1>
          <p className="text-sm text-mist-400">Tu asistente inteligente de Laboratorio Clínico.</p>
        </div>
      </div>

      <Chat 
        initialContext={searchParams.organismo} 
        initialQuery={searchParams.q}
      />
    </div>
  );
}
