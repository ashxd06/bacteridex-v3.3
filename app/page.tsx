import Link from "next/link";
import {
  Bug,
  Dna,
  Sprout,
  Shell,
  TestTubes,
  FlaskConical,
  TestTube,
  ClipboardList,
  FileText,
  Scale,
  Fingerprint,
  Brain,
  Target,
  Layers,
  Trophy,
  Calculator,
  History
} from "lucide-react";
import { pruebas, medios } from "@/lib/data";
import { getTodosLosMicroorganismos, getAnalisisClinicos, getProcedimientosLab, getCalculadoras } from "@/lib/content";
import type { Categoria } from "@/lib/types";
import StatTile from "@/components/StatTile";
import OrganismCard from "@/components/OrganismCard";
import ProgresoResumen from "@/components/ProgresoResumen";
import Logo from "@/components/Logo";

const META_COLECCION = 300;

const CATEGORIAS_UI: { id: Categoria; label: string; emoji: string }[] = [
  { id: "bacterias", label: "Bacterias", emoji: "🦠" },
  { id: "virus", label: "Virus", emoji: "🧬" },
  { id: "hongos", label: "Hongos", emoji: "🍄" },
  { id: "parasitos", label: "Parásitos", emoji: "🪱" }
];

export const revalidate = 60;

export default async function Home() {
  // Estadísticas reales: si el CMS (Fase A) ya tiene contenido en Supabase,
  // estos números lo reflejan; si no, caen al mismo JSON de siempre (ver
  // lib/content.ts). Nunca se muestran cifras inventadas o fijas.
  const [todosLosOrganismos, analisisClinicos, procedimientos, calculadoras] = await Promise.all([
    getTodosLosMicroorganismos(),
    getAnalisisClinicos(),
    getProcedimientosLab(),
    getCalculadoras()
  ]);

  const top = todosLosOrganismos
    .filter((o) => o.prioridad === "muy-frecuente")
    .sort((a, b) => b.nivelImportancia - a.nivelImportancia)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-2xl border border-base-600 bg-gradient-to-br from-base-800 via-base-900 to-base-950 p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cian/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-gene/10 blur-3xl" />
        <div className="mb-3">
          <Logo className="h-10 w-10" />
        </div>
        <p className="section-eyebrow">Laboratorio Clínico · Enciclopedia interactiva</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Bacteri<span className="text-cian">Dex</span>
        </h1>
        <p className="mt-3 max-w-xl text-mist-300">
          Tu laboratorio clínico, convertido en una experiencia interactiva. Estudia, compara e
          identifica microorganismos con fichas clínicas reales, pruebas bioquímicas, casos y
          gamificación.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/bacterias"
            className="focus-ring rounded-lg bg-cian px-4 py-2 font-medium text-base-950 transition hover:bg-cian-glow"
          >
            Empezar a estudiar
          </Link>
          <Link
            href="/quiz"
            className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-mist-100 transition hover:border-cian hover:text-cian"
          >
            <Target className="mr-1.5 inline h-4 w-4" aria-hidden="true" /> Hacer un quiz
          </Link>
        </div>
      </section>

      <ProgresoResumen />

      <section>
        <p className="section-eyebrow mb-3">Colección</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile emoji="📚" label="Microorganismos" value={todosLosOrganismos.length} total={META_COLECCION} />
          {CATEGORIAS_UI.map((c) => (
            <StatTile
              key={c.id}
              emoji={c.emoji}
              label={c.label}
              value={todosLosOrganismos.filter((o) => o.categoria === c.id).length}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile emoji="🧪" label="Pruebas de laboratorio" value={pruebas.length} />
          <StatTile emoji="🧫" label="Medios de cultivo" value={medios.length} />
          <StatTile emoji="📋" label="Procedimientos" value={procedimientos.length} />
          <StatTile emoji="🧬" label="Análisis clínicos" value={analisisClinicos.length} />
          <StatTile emoji="🧮" label="Calculadoras" value={calculadoras.length} />
        </div>
      </section>

      <section>
        <p className="section-eyebrow mb-3">Explorar</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[
            { href: "/bacterias", icon: Bug, label: "Bacterias" },
            { href: "/virus", icon: Dna, label: "Virus" },
            { href: "/hongos", icon: Sprout, label: "Hongos" },
            { href: "/parasitos", icon: Shell, label: "Parásitos" },
            { href: "/analisis", icon: TestTubes, label: "Análisis clínicos" },
            { href: "/pruebas", icon: FlaskConical, label: "Pruebas de laboratorio" },
            { href: "/medios", icon: TestTube, label: "Medios de cultivo" },
            { href: "/procedimientos", icon: ClipboardList, label: "Procedimientos" },
            { href: "/insertos", icon: FileText, label: "Insertos" },
            { href: "/resultados", icon: ClipboardList, label: "Resultados" },
            { href: "/registros", icon: History, label: "Registros" },
            { href: "/calculadoras", icon: Calculator, label: "Calculadoras" },
            { href: "/comparador", icon: Scale, label: "Comparador" },
            { href: "/identifica", icon: Fingerprint, label: "Identifica el microorganismo" },
            { href: "/study", icon: Brain, label: "BacteriDex Study (PDF → estudio)" },
            { href: "/quiz", icon: Target, label: "Quiz" },
            { href: "/flashcards", icon: Layers, label: "Flashcards" },
            { href: "/progreso", icon: Trophy, label: "Progreso" }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="lab-card focus-ring flex flex-col items-center justify-center gap-2 p-5 text-center"
            >
              <item.icon className="h-6 w-6 text-cian" aria-hidden="true" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <p className="section-eyebrow">🔥 Top del laboratorio — domina esto primero</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((o) => (
            <OrganismCard key={o.id} organismo={o} />
          ))}
        </div>
      </section>
    </div>
  );
}
