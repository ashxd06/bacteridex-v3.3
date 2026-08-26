import Link from "next/link";
import { CATEGORIAS, todosLosOrganismos, pruebas, medios, procedimientos } from "@/lib/data";
import StatTile from "@/components/StatTile";
import OrganismCard from "@/components/OrganismCard";
import ProgresoResumen from "@/components/ProgresoResumen";

const META_COLECCION = 300;

export default function Home() {
  const top = todosLosOrganismos
    .filter((o) => o.prioridad === "muy-frecuente")
    .sort((a, b) => b.nivelImportancia - a.nivelImportancia)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-10">
      <section className="relative overflow-hidden rounded-2xl border border-base-600 bg-gradient-to-br from-base-800 via-base-900 to-base-950 p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-bio/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-gene/10 blur-3xl" />
        <p className="section-eyebrow">Laboratorio Clínico · Fase 1</p>
        <h1 className="mt-2 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Bacteri<span className="text-bio">Dex</span>
        </h1>
        <p className="mt-3 max-w-xl text-mist-300">
          Tu laboratorio clínico, convertido en una experiencia interactiva. Estudia, compara e
          identifica microorganismos con fichas clínicas reales, pruebas bioquímicas, casos y
          gamificación.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/bacterias"
            className="focus-ring rounded-lg bg-bio px-4 py-2 font-medium text-base-950 transition hover:bg-bio-glow"
          >
            Empezar a estudiar
          </Link>
          <Link
            href="/quiz"
            className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-mist-100 transition hover:border-bio hover:text-bio"
          >
            🎯 Hacer un quiz
          </Link>
        </div>
      </section>

      <ProgresoResumen />

      <section>
        <p className="section-eyebrow mb-3">Colección</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatTile
            emoji="📚"
            label="Microorganismos"
            value={todosLosOrganismos.length}
            total={META_COLECCION}
          />
          {CATEGORIAS.map((c) => (
            <StatTile key={c.id} emoji={c.emoji} label={c.label} value={c.total} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile emoji="🧪" label="Pruebas de laboratorio" value={pruebas.length} />
          <StatTile emoji="🧫" label="Medios de cultivo" value={medios.length} />
          <StatTile emoji="📋" label="Procedimientos" value={procedimientos.length} />
        </div>
      </section>

      <section>
        <p className="section-eyebrow mb-3">Explorar</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[
            { href: "/bacterias", emoji: "🦠", label: "Bacterias" },
            { href: "/virus", emoji: "🧬", label: "Virus" },
            { href: "/hongos", emoji: "🍄", label: "Hongos" },
            { href: "/parasitos", emoji: "🪱", label: "Parásitos" },
            { href: "/pruebas", emoji: "🧪", label: "Pruebas de laboratorio" },
            { href: "/medios", emoji: "🧫", label: "Medios de cultivo" },
            { href: "/procedimientos", emoji: "📋", label: "Procedimientos" },
            { href: "/comparador", emoji: "⚖️", label: "Comparador" },
            { href: "/identifica", emoji: "🕵️", label: "Identifica el microorganismo" },
            { href: "/quiz", emoji: "🎯", label: "Quiz" },
            { href: "/flashcards", emoji: "🧠", label: "Flashcards" },
            { href: "/progreso", emoji: "🏆", label: "Progreso" }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="lab-card focus-ring flex flex-col items-center justify-center gap-2 p-5 text-center"
            >
              <span className="text-2xl">{item.emoji}</span>
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
