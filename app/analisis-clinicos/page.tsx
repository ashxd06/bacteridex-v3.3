import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConical, Clock, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Análisis Clínicos — BacteriDex",
  description:
    "Sección de Análisis Clínicos de BacteriDex. Próximamente: protocolos, valores de referencia y técnicas de laboratorio.",
};

// Áreas que se desarrollarán en esta sección — listo para iterar
const AREAS = [
  "Hematología",
  "Bioquímica clínica",
  "Uroanálisis y coprología",
  "Microbiología clínica",
  "Banco de sangre",
  "Citología",
  "Anatomía patológica",
  "Inmunología",
  "Toma de muestras",
  "Bioseguridad",
];

export default function AnalisisClinicosPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado */}
      <div>
        <p className="section-eyebrow mb-2">
          <FlaskConical className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Laboratorio Clínico
        </p>
        <h1 className="font-display text-3xl font-bold">Análisis Clínicos</h1>
        <p className="mt-2 max-w-xl text-sm text-mist-400">
          Próximamente encontrarás aquí protocolos, valores de referencia,
          técnicas e interpretación de resultados organizados por área de
          Laboratorio Clínico.
        </p>
      </div>

      {/* Banner en construcción */}
      <div className="lab-card flex items-start gap-4 p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bio/15 text-bio">
          <Clock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">
            Sección en desarrollo
          </h2>
          <p className="mt-1 text-sm text-mist-400">
            Estamos construyendo el contenido completo de Análisis Clínicos.
            Incluirá guías clínicas, interpretación de resultados, valores
            normales de referencia y casos prácticos organizados por
            especialidad de laboratorio.
          </p>
        </div>
      </div>

      {/* Áreas planificadas */}
      <section>
        <p className="section-eyebrow mb-4">Áreas planificadas</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AREAS.map((area) => (
            <div
              key={area}
              className="flex items-center gap-3 rounded-xl border border-base-700 bg-base-800/40 px-4 py-3 text-sm text-mist-300"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-bio/60"
                aria-hidden="true"
              />
              {area}
            </div>
          ))}
        </div>
      </section>

      {/* Mientras tanto */}
      <section>
        <p className="section-eyebrow mb-4">Mientras tanto, explora</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/pruebas", label: "Pruebas diagnósticas" },
            { href: "/medios", label: "Medios de cultivo" },
            { href: "/procedimientos", label: "Procedimientos" },
            { href: "/bacterias", label: "Bacterias" },
            { href: "/identifica", label: "Identificación" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring chip hover:border-bio hover:text-bio"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Volver */}
      <div>
        <Link
          href="/"
          className="focus-ring inline-flex items-center gap-2 text-sm text-mist-400 hover:text-mist-100"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
