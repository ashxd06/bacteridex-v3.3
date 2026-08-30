import { bacterias, virus, hongos, parasitos, pruebas, medios, procedimientos } from "@/lib/data";

export const metadata = { title: "Acerca de — BacteriDex" };

export default function AcercaPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="section-eyebrow">ℹ️ Acerca de</p>
        <h1 className="font-display text-2xl font-bold">Acerca de BacteriDex</h1>
      </div>

      <div className="lab-card p-6">
        <p className="text-sm text-mist-200">
          BacteriDex es una enciclopedia interactiva de Laboratorio Clínico pensada para
          estudiantes y profesionales del área. Combina un atlas de microbiología, una biblioteca
          de procedimientos y pruebas bioquímicas, y herramientas de estudio activo (quiz,
          flashcards con repetición espaciada, comparador y modo de identificación) para que
          aprender deje de ser solo memorizar listas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MiniStat label="Bacterias" value={bacterias.length} />
        <MiniStat label="Virus" value={virus.length} />
        <MiniStat label="Hongos" value={hongos.length} />
        <MiniStat label="Parásitos" value={parasitos.length} />
        <MiniStat label="Pruebas" value={pruebas.length} />
        <MiniStat label="Medios" value={medios.length} />
        <MiniStat label="Procedimientos" value={procedimientos.length} />
      </div>

      <div className="lab-card p-6">
        <p className="section-eyebrow mb-2">Calidad del contenido</p>
        <p className="text-sm text-mist-300">
          No se inventan datos científicos, imágenes ni fuentes. Cuando una prueba o resultado
          depende del método, fabricante o protocolo institucional, se indica explícitamente. Se
          diferencia entre identificación presuntiva, confirmatoria, tamizaje, diagnóstico y
          pruebas de susceptibilidad antimicrobiana. El contenido es educativo y no reemplaza el
          POE de ningún laboratorio ni una indicación clínica profesional.
        </p>
      </div>

      <div className="lab-card p-6 text-center">
        <p className="text-sm text-mist-400">Creado por</p>
        <p className="mt-1 font-display text-xl font-semibold text-mist-100">Alex Arenas (Satoshi)</p>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="lab-card p-3 text-center">
      <p className="font-display text-xl font-bold text-bio">{value}</p>
      <p className="text-[11px] text-mist-400">{label}</p>
    </div>
  );
}
