"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CATEGORIAS_ANALISIS } from "@/lib/data";
import type { AnalisisClinico, CategoriaAnalisis } from "@/lib/types";

interface Fila {
  id: string;
  categoria: CategoriaAnalisis;
  numero: number;
  data: AnalisisClinico;
  estado: "activo" | "archivado";
}

function lineas(txt: string): string[] {
  return txt.split("\n").map((l) => l.trim()).filter(Boolean);
}

function analisisVacio(categoria: CategoriaAnalisis): AnalisisClinico {
  return {
    id: "",
    numero: 0,
    categoria,
    nombre: "",
    descripcion: "",
    utilidad: "",
    tipoMuestra: "",
    condicionesMuestra: "",
    reactivos: [],
    materiales: [],
    metodo: "",
    parametros: [],
    procedimientoGeneral: [],
    unidades: "",
    valoresReferencia: "",
    consideraciones: [],
    procedimientosRelacionados: [],
    notaProtocolo: "El inserto vigente del fabricante del reactivo siempre tiene prioridad sobre este contenido educativo.",
    fuentes: []
  };
}

export default function AdminAnalisisPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("activo");
  const [busqueda, setBusqueda] = useState("");

  const [editando, setEditando] = useState<AnalisisClinico | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [reactivosTxt, setReactivosTxt] = useState("");
  const [materialesTxt, setMaterialesTxt] = useState("");
  const [parametrosTxt, setParametrosTxt] = useState("");
  const [procedimientoTxt, setProcedimientoTxt] = useState("");
  const [consideracionesTxt, setConsideracionesTxt] = useState("");
  const [fuentesTxt, setFuentesTxt] = useState("");
  const [procedimientosRelTxt, setProcedimientosRelTxt] = useState("");

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
    const res = await fetch(`/api/admin/analisis-cms?${params.toString()}`, {
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

  function abrirNuevo(categoria: CategoriaAnalisis) {
    setEditando(analisisVacio(categoria));
    setReactivosTxt(""); setMaterialesTxt(""); setParametrosTxt("");
    setProcedimientoTxt(""); setConsideracionesTxt(""); setFuentesTxt(""); setProcedimientosRelTxt("");
    setError(null);
  }

  function abrirEdicion(a: AnalisisClinico) {
    setEditando(a);
    setReactivosTxt(a.reactivos.join("\n"));
    setMaterialesTxt(a.materiales.join("\n"));
    setParametrosTxt(a.parametros.join("\n"));
    setProcedimientoTxt(a.procedimientoGeneral.join("\n"));
    setConsideracionesTxt(a.consideraciones.join("\n"));
    setFuentesTxt(a.fuentes.join("\n"));
    setProcedimientosRelTxt(a.procedimientosRelacionados.join("\n"));
    setError(null);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setError(null);
    if (!editando.id.trim() || !editando.nombre.trim()) {
      setError("El id y el nombre son obligatorios.");
      return;
    }
    const completo: AnalisisClinico = {
      ...editando,
      id: editando.id.trim(),
      reactivos: lineas(reactivosTxt),
      materiales: lineas(materialesTxt),
      parametros: lineas(parametrosTxt),
      procedimientoGeneral: lineas(procedimientoTxt),
      consideraciones: lineas(consideracionesTxt),
      fuentes: lineas(fuentesTxt),
      procedimientosRelacionados: lineas(procedimientosRelTxt)
    };

    setGuardando(true);
    const token = await obtenerToken();
    const existe = filas.some((f) => f.id === completo.id);
    const res = await fetch(existe ? `/api/admin/analisis-cms/${completo.id}` : "/api/admin/analisis-cms", {
      method: existe ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ data: completo })
    });
    const json = await res.json();
    setGuardando(false);
    if (!res.ok) { setError(json?.error || "No se pudo guardar."); return; }
    setMensaje("Guardado correctamente.");
    setTimeout(() => setMensaje(null), 3000);
    setEditando(null);
    cargar();
  }

  async function cambiarEstado(id: string, estado: "activo" | "archivado") {
    const token = await obtenerToken();
    const res = await fetch(`/api/admin/analisis-cms/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado })
    });
    if (res.ok) { setMensaje(estado === "archivado" ? "Archivado." : "Restaurado."); setTimeout(() => setMensaje(null), 3000); cargar(); }
  }

  async function eliminar(id: string) {
    if (!confirm(`¿Eliminar "${id}" de forma permanente?`)) return;
    const token = await obtenerToken();
    const res = await fetch(`/api/admin/analisis-cms/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setMensaje("Eliminado."); setTimeout(() => setMensaje(null), 3000); cargar(); }
  }

  if (!habilitado) return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  if (!esAdmin) return <div className="lab-card mx-auto max-w-md p-8 text-center text-mist-400">Esta sección es solo para administradores.</div>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="section-eyebrow hover:text-bio-glow">← Panel de administración</Link>
      <div>
        <p className="section-eyebrow">🧬 Análisis clínicos</p>
        <h1 className="font-display text-2xl font-bold">Biblioteca de análisis</h1>
      </div>

      {mensaje && <div className="rounded-lg border border-bio/40 bg-bio/10 px-4 py-2 text-sm text-bio">{mensaje}</div>}

      <div className="flex flex-wrap gap-2">
        {CATEGORIAS_ANALISIS.map((c) => (
          <button key={c.id} onClick={() => abrirNuevo(c.id)} className="focus-ring chip hover:border-bio hover:text-bio">
            + Nuevo en {c.label}
          </button>
        ))}
      </div>

      <div className="lab-card flex flex-wrap items-center gap-3 p-4">
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} onKeyDown={(e) => e.key === "Enter" && cargar()} placeholder="Buscar por nombre o id…" className="focus-ring min-w-[220px] flex-1 rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
        <button onClick={cargar} className="focus-ring chip hover:border-bio hover:text-bio">Buscar</button>
        <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS_ANALISIS.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.label}</option>))}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
          <option value="activo">Activos</option>
          <option value="archivado">Archivados</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {cargandoLista ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : filas.length === 0 ? (
        <p className="text-sm text-mist-400">No hay análisis que coincidan.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filas.map((f) => (
            <div key={f.id} className="lab-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">
                  {f.data.nombre} <span className="chip ml-1 text-[10px]">{f.categoria}</span>{" "}
                  {f.estado === "archivado" && <span className="chip ml-1 text-[10px] text-gold">archivado</span>}
                </p>
                <p className="text-xs text-mist-400">id: {f.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/analisis/${f.id}`} target="_blank" className="focus-ring chip hover:border-bio hover:text-bio">Ver</Link>
                <button onClick={() => abrirEdicion(f.data)} className="focus-ring chip hover:border-bio hover:text-bio">Editar</button>
                <button onClick={() => cambiarEstado(f.id, f.estado === "activo" ? "archivado" : "activo")} className="focus-ring chip hover:border-gold hover:text-gold">
                  {f.estado === "activo" ? "Archivar" : "Restaurar"}
                </button>
                <button onClick={() => eliminar(f.id)} className="focus-ring chip hover:border-alert hover:text-alert">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editando && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4">
          <form onSubmit={guardar} className="lab-card my-8 flex w-full max-w-3xl flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <p className="section-eyebrow">{filas.some((f) => f.id === editando.id) ? "Editar" : "Nuevo"} análisis</p>
              <button type="button" onClick={() => setEditando(null)} className="focus-ring chip">Cerrar</button>
            </div>
            {error && <p className="text-xs text-alert">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Id único"><input value={editando.id} disabled={filas.some((f) => f.id === editando.id)} onChange={(e) => setEditando({ ...editando, id: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm disabled:opacity-50" placeholder="ej. an011" /></Campo>
              <Campo label="Categoría">
                <select value={editando.categoria} onChange={(e) => setEditando({ ...editando, categoria: e.target.value as CategoriaAnalisis })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
                  {CATEGORIAS_ANALISIS.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                </select>
              </Campo>
              <Campo label="Número (orden)"><input type="number" value={editando.numero} onChange={(e) => setEditando({ ...editando, numero: Number(e.target.value) })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Nombre"><input value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
            </div>

            <Campo label="Descripción"><textarea value={editando.descripcion} onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            <Campo label="Utilidad clínica"><textarea value={editando.utilidad} onChange={(e) => setEditando({ ...editando, utilidad: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Tipo de muestra"><input value={editando.tipoMuestra} onChange={(e) => setEditando({ ...editando, tipoMuestra: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Condiciones de la muestra"><input value={editando.condicionesMuestra} onChange={(e) => setEditando({ ...editando, condicionesMuestra: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Método"><input value={editando.metodo} onChange={(e) => setEditando({ ...editando, metodo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Longitud de onda (opcional)"><input value={editando.longitudOnda ?? ""} onChange={(e) => setEditando({ ...editando, longitudOnda: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Unidades"><input value={editando.unidades} onChange={(e) => setEditando({ ...editando, unidades: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Fórmula (opcional)"><input value={editando.formula ?? ""} onChange={(e) => setEditando({ ...editando, formula: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm font-mono" /></Campo>
            </div>

            <Campo label="Valores de referencia (educativos — el inserto del fabricante tiene prioridad)">
              <textarea value={editando.valoresReferencia} onChange={(e) => setEditando({ ...editando, valoresReferencia: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} />
            </Campo>
            <Campo label="Nota de protocolo">
              <textarea value={editando.notaProtocolo} onChange={(e) => setEditando({ ...editando, notaProtocolo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} />
            </Campo>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Reactivos (uno por línea)"><textarea value={reactivosTxt} onChange={(e) => setReactivosTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Materiales (uno por línea)"><textarea value={materialesTxt} onChange={(e) => setMaterialesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Parámetros (uno por línea)"><textarea value={parametrosTxt} onChange={(e) => setParametrosTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Consideraciones (una por línea)"><textarea value={consideracionesTxt} onChange={(e) => setConsideracionesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Fuentes (una por línea)"><textarea value={fuentesTxt} onChange={(e) => setFuentesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Ids de procedimientos relacionados (uno por línea)"><textarea value={procedimientosRelTxt} onChange={(e) => setProcedimientosRelTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm font-mono" rows={3} placeholder="proc001" /></Campo>
            </div>

            <Campo label="Procedimiento general (un paso por línea)">
              <textarea value={procedimientoTxt} onChange={(e) => setProcedimientoTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={4} />
            </Campo>

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
