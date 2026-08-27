"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Organismo } from "@/lib/types";
import ImagePlaceholder from "./ImagePlaceholder";
import { imagenesMicroscopica, imagenesAgar, getImagen } from "@/lib/images";
import { useAuth } from "./AuthProvider";
import { useFavoritosNube, registrarVisita } from "@/lib/hooks/useFavoritosNube";
import {
  cargarProgreso,
  guardarProgreso,
  marcarPasoRegistro,
  porcentajeRegistro,
  toggleFavorito,
  type EstadoProgreso,
  type RegistroOrganismo,
  estadoInicial
} from "@/lib/progress";

const pasos: { key: keyof RegistroOrganismo; label: string }[] = [
  { key: "leyoFicha", label: "Leer ficha" },
  { key: "identificoGram", label: "Identificar Gram/clasificación" },
  { key: "identificoMorfologia", label: "Identificar morfología" },
  { key: "reconocioImagen", label: "Reconocer imagen" },
  { key: "identificoPruebas", label: "Identificar pruebas" },
  { key: "resolvioQuiz", label: "Resolver quiz" },
  { key: "resolvioCaso", label: "Resolver caso clínico" }
];

export default function OrganismDetail({ organismo }: { organismo: Organismo }) {
  const [estado, setEstado] = useState<EstadoProgreso>(estadoInicial());
  const [listo, setListo] = useState(false);
  const [casoAbierto, setCasoAbierto] = useState<number | null>(null);
  const [respuestaCaso, setRespuestaCaso] = useState<Record<number, boolean>>({});
  const [verMas, setVerMas] = useState(false);
  const { user, habilitado, abrirModal } = useAuth();
  const { esFavorito: esFavoritoNube, alternar: alternarFavoritoNube } = useFavoritosNube();
  const [errorFavorito, setErrorFavorito] = useState<string | null>(null);

  useEffect(() => {
    const cargado = cargarProgreso();
    setEstado(cargado);
    setListo(true);
    const actualizado = marcarPasoRegistro(cargado, organismo.id, "leyoFicha");
    setEstado(actualizado);
    guardarProgreso(actualizado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organismo.id]);

  useEffect(() => {
    if (user) registrarVisita(user.id, organismo.id, organismo.categoria);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, organismo.id]);

  function marcar(paso: keyof RegistroOrganismo) {
    const actualizado = marcarPasoRegistro(estado, organismo.id, paso);
    setEstado(actualizado);
    guardarProgreso(actualizado);
  }

  async function favorito() {
    if (habilitado && !user) {
      setErrorFavorito("Necesitas iniciar sesión para guardar favoritos.");
      return;
    }
    if (habilitado && user) {
      setErrorFavorito(null);
      const { error } = await alternarFavoritoNube(organismo.id, organismo.categoria);
      if (error) setErrorFavorito(error);
      return;
    }
    // Supabase no configurado: se conserva el comportamiento local original.
    const actualizado = toggleFavorito(estado, organismo.id);
    setEstado(actualizado);
    guardarProgreso(actualizado);
  }

  const registro = estado.registros[organismo.id];
  const porcentaje = listo ? porcentajeRegistro(registro) : 0;
  const esFavorito = habilitado
    ? (user ? esFavoritoNube(organismo.id) : false)
    : listo && estado.favoritos.includes(organismo.id);
  const imagenMicroscopica = getImagen(imagenesMicroscopica, organismo.id);
  const imagenAgar = getImagen(imagenesAgar, organismo.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="lab-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={`/${organismo.categoria}`}
              className="section-eyebrow hover:text-bio-glow"
            >
              ← {organismo.subgrupo}
            </Link>
            <h1 className="mt-1 font-display text-2xl font-bold italic sm:text-3xl">
              {organismo.nombreCientifico}
            </h1>
            {organismo.nombreComun && (
              <p className="text-sm text-mist-400">{organismo.nombreComun}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="chip font-mono">
              #{String(organismo.numero).padStart(3, "0")}
            </span>
            <button
              onClick={favorito}
              className="focus-ring chip hover:border-gold hover:text-gold"
              aria-pressed={esFavorito}
            >
              {esFavorito ? "★ En favoritos" : "☆ Favorito"}
            </button>
          </div>
        </div>

        {errorFavorito && (
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 p-3 text-xs text-mist-200">
            <span>{errorFavorito}</span>
            {!user && (
              <div className="flex gap-2">
                <button
                  onClick={() => abrirModal("login")}
                  className="focus-ring rounded-md bg-bio px-2.5 py-1 font-medium text-base-950"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => abrirModal("registro")}
                  className="focus-ring rounded-md border border-base-600 px-2.5 py-1 hover:border-bio hover:text-bio"
                >
                  Crear cuenta
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-5">
          <div className="mb-1 flex items-center justify-between text-xs text-mist-400">
            <span>REGISTRO</span>
            <span>{porcentaje}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-base-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-bio-dim to-bio transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>

      <section>
        <p className="section-eyebrow mb-3">📷 Galería científica</p>
        <div className="grid grid-cols-2 gap-3">
          <div onClick={() => marcar("reconocioImagen")} className="cursor-pointer">
            <ImagePlaceholder
              tipo="microscopia"
              descripcion={`Microscópica — ${organismo.nombreCientifico}`}
              url={imagenMicroscopica}
            />
            <p className="mt-1 text-center text-[10px] text-mist-400">🔬 Microscópica</p>
          </div>
          <div onClick={() => marcar("reconocioImagen")} className="cursor-pointer">
            <ImagePlaceholder
              tipo="colonia"
              descripcion={`Agar — ${organismo.nombreCientifico}`}
              url={imagenAgar}
            />
            <p className="mt-1 text-center text-[10px] text-mist-400">🧫 Agar</p>
          </div>
        </div>
      </section>

      <section>
        <p className="section-eyebrow mb-3">🔬 Datos</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <Dato label="Familia" valor={organismo.familia} />
          <Dato label="Género" valor={organismo.genero} />
          <Dato label="Especie" valor={organismo.especie} />
          {organismo.gram && organismo.gram !== "no-aplica" && (
            <Dato
              label="Gram"
              valor={organismo.gram === "positivo" ? "Positivo" : organismo.gram === "negativo" ? "Negativo" : organismo.gram}
              onClick={() => marcar("identificoGram")}
            />
          )}
          {organismo.morfologia && (
            <Dato label="Morfología" valor={organismo.morfologia} onClick={() => marcar("identificoMorfologia")} />
          )}
          {organismo.agrupacion && <Dato label="Agrupación" valor={organismo.agrupacion} />}
          {organismo.oxigeno && <Dato label="Oxígeno" valor={organismo.oxigeno} />}
          {organismo.esporulacion && <Dato label="Esporulación" valor={organismo.esporulacion} />}
          {organismo.motilidad && <Dato label="Motilidad" valor={organismo.motilidad} />}
          {organismo.capsula && <Dato label="Cápsula" valor={organismo.capsula} />}
          {organismo.genoma && <Dato label="Genoma" valor={organismo.genoma} />}
          {organismo.cadena && <Dato label="Cadena" valor={organismo.cadena} />}
          {organismo.envuelto !== undefined && (
            <Dato label="Envuelto" valor={organismo.envuelto ? "Sí" : "No"} />
          )}
          {organismo.tipoHongo && <Dato label="Tipo de hongo" valor={organismo.tipoHongo} />}
          {organismo.tipoParasito && <Dato label="Tipo de parásito" valor={organismo.tipoParasito} />}
          <Dato label="Hábitat" valor={organismo.habitat} ancho />
          <Dato label="Transmisión" valor={organismo.transmision} ancho />
        </div>
        {organismo.cicloBiologico && (
          <div className="mt-3 lab-card p-4">
            <p className="section-eyebrow mb-1">Ciclo biológico</p>
            <p className="text-sm text-mist-200">{organismo.cicloBiologico}</p>
          </div>
        )}
        {organismo.formaDiagnostica && (
          <div className="mt-3 lab-card p-4">
            <p className="section-eyebrow mb-1">Forma diagnóstica</p>
            <p className="text-sm text-mist-200">{organismo.formaDiagnostica}</p>
          </div>
        )}
      </section>

      <section>
        <p className="section-eyebrow mb-3">🧪 Muestra clínica habitual</p>
        <div className="flex flex-wrap gap-2">
          {organismo.muestraClinica.map((m) => (
            <span key={m} className="chip">{m}</span>
          ))}
        </div>
      </section>

      {organismo.pruebas.length > 0 && (
        <section onClick={() => marcar("identificoPruebas")}>
          <p className="section-eyebrow mb-3">🧫 Pruebas de laboratorio</p>
          <div className="overflow-hidden rounded-xl border border-base-600">
            <table className="w-full text-left text-sm">
              <thead className="bg-base-800 text-mist-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Prueba</th>
                  <th className="px-4 py-2 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {organismo.pruebas.map((p) => (
                  <tr key={p.nombre} className="border-t border-base-700">
                    <td className="px-4 py-2 font-mono text-mist-200">{p.nombre}</td>
                    <td className="px-4 py-2 text-mist-300">{p.resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(organismo.mediosCultivo.length > 0 || organismo.colonia) && (
        <section>
          <p className="section-eyebrow mb-3">🧫 Medios de cultivo y colonia</p>
          <div className="flex flex-wrap gap-2">
            {organismo.mediosCultivo.map((m) => (
              <span key={m} className="chip">{m}</span>
            ))}
          </div>
          {organismo.colonia && (
            <p className="mt-3 text-sm text-mist-300">{organismo.colonia}</p>
          )}
        </section>
      )}

      <section className="lab-card p-5">
        <p className="section-eyebrow mb-3">🩺 Importancia médica</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Bloque icono="🩺" pregunta="¿Qué causa?" texto={organismo.importanciaMedica.queCausa} />
          <Bloque icono="🫁" pregunta="¿Qué órganos afecta?" texto={organismo.importanciaMedica.organosAfectados} />
          <Bloque icono="👤" pregunta="¿Quiénes tienen mayor riesgo?" texto={organismo.importanciaMedica.poblacionRiesgo} />
          <Bloque icono="⚠️" pregunta="¿Por qué es importante?" texto={organismo.importanciaMedica.porQueImporta} />
          <Bloque icono="🔬" pregunta="¿Cómo se diagnostica?" texto={organismo.importanciaMedica.comoSeDiagnostica} />
        </div>
        <div className="mt-4">
          <button
            onClick={() => setVerMas((v) => !v)}
            className="focus-ring text-sm font-medium text-bio hover:text-bio-glow"
          >
            📖 {verMas ? "Ocultar" : "Ver más"}
          </button>
          {verMas && (
            <div className="mt-3 flex flex-wrap gap-2">
              {organismo.enfermedades.map((e) => (
                <span key={e} className="chip">{e}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {organismo.casosClinicos && organismo.casosClinicos.length > 0 && (
        <section>
          <p className="section-eyebrow mb-3">📚 Casos clínicos</p>
          <div className="flex flex-col gap-3">
            {organismo.casosClinicos.map((c, i) => (
              <div key={i} className="lab-card p-4">
                <p className="font-display font-semibold">{c.titulo}</p>
                <p className="mt-1 text-sm text-mist-300">
                  <strong>Síntomas:</strong> {c.sintomas.join(", ")}
                </p>
                <p className="text-sm text-mist-300">
                  <strong>Muestra:</strong> {c.muestra}
                </p>
                <p className="text-sm text-mist-300">
                  <strong>Hallazgos:</strong> {c.hallazgos}
                </p>
                <p className="mt-2 text-sm font-medium text-mist-100">{c.pregunta}</p>
                {casoAbierto === i ? (
                  <div className="mt-2 rounded-lg border border-bio/30 bg-bio/10 p-3 text-sm">
                    <p className="font-semibold text-bio">{c.respuesta}</p>
                    <p className="mt-1 text-mist-300">{c.explicacion}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setCasoAbierto(i);
                      setRespuestaCaso((r) => ({ ...r, [i]: true }));
                      marcar("resolvioCaso");
                    }}
                    className="focus-ring mt-2 rounded-lg bg-base-700 px-3 py-1.5 text-sm hover:bg-base-600"
                  >
                    Ver respuesta
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <p className="section-eyebrow mb-2">📚 Fuentes</p>
        <div className="flex flex-wrap gap-2">
          {organismo.fuentes.map((f) => (
            <span key={f} className="chip">{f}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function Dato({ label, valor, ancho, onClick }: { label: string; valor: string; ancho?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`lab-card p-3 ${ancho ? "col-span-2 sm:col-span-3 lg:col-span-2" : ""} ${onClick ? "cursor-pointer" : ""}`}
    >
      <p className="text-[10px] uppercase tracking-wide text-mist-400">{label}</p>
      <p className="mt-0.5 text-sm text-mist-100">{valor}</p>
    </div>
  );
}

function Bloque({ icono, pregunta, texto }: { icono: string; pregunta: string; texto: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-sm font-medium text-mist-200">
        <span>{icono}</span> {pregunta}
      </p>
      <p className="mt-1 text-sm text-mist-400">{texto}</p>
    </div>
  );
}
