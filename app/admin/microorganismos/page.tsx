"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Organismo, Categoria, Prioridad } from "@/lib/types";

interface Fila {
  id: string;
  categoria: Categoria;
  numero: number;
  data: Organismo;
  estado: "activo" | "archivado";
  updated_at: string;
}

const CATEGORIAS: { id: Categoria; label: string; emoji: string }[] = [
  { id: "bacterias", label: "Bacterias", emoji: "🦠" },
  { id: "virus", label: "Virus", emoji: "🧬" },
  { id: "hongos", label: "Hongos", emoji: "🍄" },
  { id: "parasitos", label: "Parásitos", emoji: "🪱" }
];

const PRIORIDADES: Prioridad[] = ["muy-frecuente", "frecuente", "importancia-clinica", "especializado", "raro"];

function lineas(txt: string): string[] {
  return txt.split("\n").map((l) => l.trim()).filter(Boolean);
}

function organismoVacio(categoria: Categoria): Organismo {
  return {
    id: "",
    numero: 0,
    categoria,
    subgrupo: "",
    nombreCientifico: "",
    familia: "",
    genero: "",
    especie: "",
    habitat: "",
    transmision: "",
    muestraClinica: [],
    pruebas: [],
    mediosCultivo: [],
    importanciaMedica: {
      queCausa: "",
      organosAfectados: "",
      poblacionRiesgo: "",
      porQueImporta: "",
      comoSeDiagnostica: ""
    },
    enfermedades: [],
    nivelImportancia: 3,
    nivelFrecuencia: 3,
    prioridad: "especializado",
    imagenes: [],
    fuentes: []
  };
}

export default function AdminMicroorganismosPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("activo");
  const [busqueda, setBusqueda] = useState("");

  const [editando, setEditando] = useState<Organismo | null>(null);
  const [guardando, setGuardando] = useState(false);

  // Textareas de campos tipo lista / anidados (se convierten al guardar).
  const [muestraClinicaTxt, setMuestraClinicaTxt] = useState("");
  const [mediosCultivoTxt, setMediosCultivoTxt] = useState("");
  const [enfermedadesTxt, setEnfermedadesTxt] = useState("");
  const [fuentesTxt, setFuentesTxt] = useState("");
  const [pruebasTxt, setPruebasTxt] = useState("");

  async function obtenerToken() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function cargar() {
    setCargandoLista(true);
    setError(null);
    const token = await obtenerToken();
    const params = new URLSearchParams();
    if (filtroCategoria !== "todas") params.set("categoria", filtroCategoria);
    if (filtroEstado !== "todos") params.set("estado", filtroEstado);
    if (busqueda.trim()) params.set("q", busqueda.trim());
    const res = await fetch(`/api/admin/microorganismos?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (res.ok) setFilas(json.items ?? []);
    else setError(json?.error || "No se pudo cargar la lista.");
    setCargandoLista(false);
  }

  useEffect(() => {
    if (esAdmin) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin, filtroCategoria, filtroEstado]);

  function abrirNuevo(categoria: Categoria) {
    setEditando(organismoVacio(categoria));
    setMuestraClinicaTxt("");
    setMediosCultivoTxt("");
    setEnfermedadesTxt("");
    setFuentesTxt("");
    setPruebasTxt("");
    setError(null);
  }

  function abrirEdicion(o: Organismo) {
    setEditando(o);
    setMuestraClinicaTxt((o.muestraClinica ?? []).join("\n"));
    setMediosCultivoTxt((o.mediosCultivo ?? []).join("\n"));
    setEnfermedadesTxt((o.enfermedades ?? []).join("\n"));
    setFuentesTxt((o.fuentes ?? []).join("\n"));
    setPruebasTxt((o.pruebas ?? []).map((p) => `${p.nombre} :: ${p.resultado}`).join("\n"));
    setError(null);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setError(null);

    if (!editando.id.trim() || !editando.nombreCientifico.trim()) {
      setError("El id y el nombre científico son obligatorios.");
      return;
    }

    const completo: Organismo = {
      ...editando,
      id: editando.id.trim(),
      muestraClinica: lineas(muestraClinicaTxt),
      mediosCultivo: lineas(mediosCultivoTxt),
      enfermedades: lineas(enfermedadesTxt),
      fuentes: lineas(fuentesTxt),
      pruebas: lineas(pruebasTxt).map((linea) => {
        const [nombre, ...resto] = linea.split("::");
        return { nombre: (nombre ?? "").trim(), resultado: resto.join("::").trim() };
      })
    };

    setGuardando(true);
    const token = await obtenerToken();
    const existe = filas.some((f) => f.id === completo.id);
    const res = await fetch(
      existe ? `/api/admin/microorganismos/${completo.id}` : "/api/admin/microorganismos",
      {
        method: existe ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: completo })
      }
    );
    const json = await res.json();
    setGuardando(false);

    if (!res.ok) {
      setError(json?.error || "No se pudo guardar.");
      return;
    }

    setMensaje("Guardado correctamente.");
    setTimeout(() => setMensaje(null), 3000);
    setEditando(null);
    cargar();
  }

  async function cambiarEstado(id: string, estado: "activo" | "archivado") {
    const token = await obtenerToken();
    const res = await fetch(`/api/admin/microorganismos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado })
    });
    if (res.ok) {
      setMensaje(estado === "archivado" ? "Microorganismo archivado." : "Microorganismo restaurado.");
      setTimeout(() => setMensaje(null), 3000);
      cargar();
    }
  }

  async function eliminar(id: string) {
    if (!confirm(`¿Eliminar "${id}" de forma permanente? Esta acción no se puede deshacer.`)) return;
    const token = await obtenerToken();
    const res = await fetch(`/api/admin/microorganismos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setMensaje("Microorganismo eliminado.");
      setTimeout(() => setMensaje(null), 3000);
      cargar();
    }
  }

  if (!habilitado) {
    return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  }
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  if (!esAdmin) {
    return <div className="lab-card mx-auto max-w-md p-8 text-center text-mist-400">Esta sección es solo para administradores.</div>;
  }

  const buscarConEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") cargar();
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="section-eyebrow hover:text-bio-glow">
        ← Panel de administración
      </Link>
      <div>
        <p className="section-eyebrow">🦠 Microorganismos</p>
        <h1 className="font-display text-2xl font-bold">Bacterias, virus, hongos y parásitos</h1>
      </div>

      {mensaje && <div className="rounded-lg border border-bio/40 bg-bio/10 px-4 py-2 text-sm text-bio">{mensaje}</div>}

      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            onClick={() => abrirNuevo(c.id)}
            className="focus-ring chip hover:border-bio hover:text-bio"
          >
            + Nuevo en {c.label}
          </button>
        ))}
      </div>

      <div className="lab-card flex flex-wrap items-center gap-3 p-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={buscarConEnter}
          placeholder="Buscar por nombre, género, familia o id…"
          className="focus-ring min-w-[220px] flex-1 rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        />
        <button onClick={cargar} className="focus-ring chip hover:border-bio hover:text-bio">
          Buscar
        </button>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        >
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        >
          <option value="activo">Activos</option>
          <option value="archivado">Archivados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {cargandoLista ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : filas.length === 0 ? (
        <p className="text-sm text-mist-400">No hay microorganismos que coincidan.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filas.map((f) => (
            <div key={f.id} className="lab-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">
                  {f.data.nombreCientifico}{" "}
                  <span className="chip ml-1 text-[10px]">{f.categoria}</span>{" "}
                  {f.estado === "archivado" && <span className="chip ml-1 text-[10px] text-gold">archivado</span>}
                </p>
                <p className="text-xs text-mist-400">{f.data.subgrupo} · id: {f.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/${f.categoria}/${f.id}`} target="_blank" className="focus-ring chip hover:border-bio hover:text-bio">
                  Ver
                </Link>
                <button onClick={() => abrirEdicion(f.data)} className="focus-ring chip hover:border-bio hover:text-bio">
                  Editar
                </button>
                <button
                  onClick={() => cambiarEstado(f.id, f.estado === "activo" ? "archivado" : "activo")}
                  className="focus-ring chip hover:border-gold hover:text-gold"
                >
                  {f.estado === "activo" ? "Archivar" : "Restaurar"}
                </button>
                <button onClick={() => eliminar(f.id)} className="focus-ring chip hover:border-alert hover:text-alert">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <form onSubmit={guardar} className="lab-card my-8 flex w-full max-w-3xl flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <p className="section-eyebrow">{filas.some((f) => f.id === editando.id) ? "Editar" : "Nuevo"} microorganismo</p>
              <button type="button" onClick={() => setEditando(null)} className="focus-ring chip">Cerrar</button>
            </div>

            {error && <p className="text-xs text-alert">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Id único (sin espacios)">
                <input
                  value={editando.id}
                  disabled={filas.some((f) => f.id === editando.id)}
                  onChange={(e) => setEditando({ ...editando, id: e.target.value })}
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm disabled:opacity-50"
                  placeholder="ej. b047"
                />
              </Campo>
              <Campo label="Categoría">
                <select
                  value={editando.categoria}
                  onChange={(e) => setEditando({ ...editando, categoria: e.target.value as Categoria })}
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                >
                  {CATEGORIAS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Número (orden en el listado)">
                <input
                  type="number"
                  value={editando.numero}
                  onChange={(e) => setEditando({ ...editando, numero: Number(e.target.value) })}
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                />
              </Campo>
              <Campo label="Subgrupo">
                <input
                  value={editando.subgrupo}
                  onChange={(e) => setEditando({ ...editando, subgrupo: e.target.value })}
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                />
              </Campo>
              <Campo label="Nombre científico">
                <input
                  value={editando.nombreCientifico}
                  onChange={(e) => setEditando({ ...editando, nombreCientifico: e.target.value })}
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                />
              </Campo>
              <Campo label="Nombre común (opcional)">
                <input
                  value={editando.nombreComun ?? ""}
                  onChange={(e) => setEditando({ ...editando, nombreComun: e.target.value })}
                  className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                />
              </Campo>
              <Campo label="Familia">
                <input value={editando.familia} onChange={(e) => setEditando({ ...editando, familia: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
              </Campo>
              <Campo label="Género">
                <input value={editando.genero} onChange={(e) => setEditando({ ...editando, genero: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
              </Campo>
              <Campo label="Especie">
                <input value={editando.especie} onChange={(e) => setEditando({ ...editando, especie: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
              </Campo>
              <Campo label="Prioridad">
                <select value={editando.prioridad} onChange={(e) => setEditando({ ...editando, prioridad: e.target.value as Prioridad })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
                  {PRIORIDADES.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </Campo>
              <Campo label="Nivel de importancia (1-5)">
                <input type="number" min={1} max={5} value={editando.nivelImportancia} onChange={(e) => setEditando({ ...editando, nivelImportancia: Number(e.target.value) as Organismo["nivelImportancia"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
              </Campo>
              <Campo label="Nivel de frecuencia (1-5)">
                <input type="number" min={1} max={5} value={editando.nivelFrecuencia} onChange={(e) => setEditando({ ...editando, nivelFrecuencia: Number(e.target.value) as Organismo["nivelFrecuencia"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
              </Campo>
            </div>

            {editando.categoria === "bacterias" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo label="Gram"><input value={editando.gram ?? ""} onChange={(e) => setEditando({ ...editando, gram: e.target.value as Organismo["gram"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="positivo / negativo / variable / no-aplica" /></Campo>
                <Campo label="Morfología"><input value={editando.morfologia ?? ""} onChange={(e) => setEditando({ ...editando, morfologia: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
                <Campo label="Agrupación"><input value={editando.agrupacion ?? ""} onChange={(e) => setEditando({ ...editando, agrupacion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
                <Campo label="Oxígeno"><input value={editando.oxigeno ?? ""} onChange={(e) => setEditando({ ...editando, oxigeno: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
                <Campo label="Esporulación"><input value={editando.esporulacion ?? ""} onChange={(e) => setEditando({ ...editando, esporulacion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
                <Campo label="Motilidad"><input value={editando.motilidad ?? ""} onChange={(e) => setEditando({ ...editando, motilidad: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              </div>
            )}
            {editando.categoria === "virus" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo label="Genoma"><input value={editando.genoma ?? ""} onChange={(e) => setEditando({ ...editando, genoma: e.target.value as Organismo["genoma"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="ADN / ARN" /></Campo>
                <Campo label="Cadena"><input value={editando.cadena ?? ""} onChange={(e) => setEditando({ ...editando, cadena: e.target.value as Organismo["cadena"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="simple / doble" /></Campo>
                <Campo label="¿Envuelto?">
                  <select value={editando.envuelto ? "si" : "no"} onChange={(e) => setEditando({ ...editando, envuelto: e.target.value === "si" })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </Campo>
              </div>
            )}
            {editando.categoria === "hongos" && (
              <Campo label="Tipo de hongo">
                <input value={editando.tipoHongo ?? ""} onChange={(e) => setEditando({ ...editando, tipoHongo: e.target.value as Organismo["tipoHongo"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="levadura / moho / dimorfico" />
              </Campo>
            )}
            {editando.categoria === "parasitos" && (
              <div className="grid gap-3 sm:grid-cols-3">
                <Campo label="Tipo de parásito"><input value={editando.tipoParasito ?? ""} onChange={(e) => setEditando({ ...editando, tipoParasito: e.target.value as Organismo["tipoParasito"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
                <Campo label="Ciclo biológico"><input value={editando.cicloBiologico ?? ""} onChange={(e) => setEditando({ ...editando, cicloBiologico: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
                <Campo label="Forma diagnóstica"><input value={editando.formaDiagnostica ?? ""} onChange={(e) => setEditando({ ...editando, formaDiagnostica: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              </div>
            )}

            <Campo label="Hábitat"><textarea value={editando.habitat} onChange={(e) => setEditando({ ...editando, habitat: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            <Campo label="Transmisión"><textarea value={editando.transmision} onChange={(e) => setEditando({ ...editando, transmision: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            <Campo label="Colonia (opcional)"><textarea value={editando.colonia ?? ""} onChange={(e) => setEditando({ ...editando, colonia: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Muestra clínica (una por línea)"><textarea value={muestraClinicaTxt} onChange={(e) => setMuestraClinicaTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Medios de cultivo (uno por línea)"><textarea value={mediosCultivoTxt} onChange={(e) => setMediosCultivoTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Enfermedades (una por línea)"><textarea value={enfermedadesTxt} onChange={(e) => setEnfermedadesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Fuentes (una por línea)"><textarea value={fuentesTxt} onChange={(e) => setFuentesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
            </div>

            <Campo label='Pruebas (una por línea, formato "nombre :: resultado")'>
              <textarea value={pruebasTxt} onChange={(e) => setPruebasTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm font-mono" rows={4} placeholder="Catalasa :: Positiva" />
            </Campo>

            <p className="section-eyebrow">Importancia médica</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Qué causa"><textarea value={editando.importanciaMedica.queCausa} onChange={(e) => setEditando({ ...editando, importanciaMedica: { ...editando.importanciaMedica, queCausa: e.target.value } })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Órganos afectados"><textarea value={editando.importanciaMedica.organosAfectados} onChange={(e) => setEditando({ ...editando, importanciaMedica: { ...editando.importanciaMedica, organosAfectados: e.target.value } })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Población en riesgo"><textarea value={editando.importanciaMedica.poblacionRiesgo} onChange={(e) => setEditando({ ...editando, importanciaMedica: { ...editando.importanciaMedica, poblacionRiesgo: e.target.value } })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Por qué importa"><textarea value={editando.importanciaMedica.porQueImporta} onChange={(e) => setEditando({ ...editando, importanciaMedica: { ...editando.importanciaMedica, porQueImporta: e.target.value } })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Cómo se diagnostica"><textarea value={editando.importanciaMedica.comoSeDiagnostica} onChange={(e) => setEditando({ ...editando, importanciaMedica: { ...editando.importanciaMedica, comoSeDiagnostica: e.target.value } })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            </div>

            <p className="text-xs text-mist-400">
              Las imágenes (microscópica / agar) y los casos clínicos se administran en una fase posterior del
              CMS; los que ya existían en este registro se conservan aunque no aparezcan aquí.
            </p>

            <button type="submit" disabled={guardando} className="focus-ring w-fit rounded-lg bg-bio px-5 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60">
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-mist-400">
      {label}
      {children}
    </label>
  );
}
