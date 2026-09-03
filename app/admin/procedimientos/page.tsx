"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { CATEGORIAS_PROCEDIMIENTOS } from "@/lib/data";
import type { Procedimiento, CategoriaProcedimiento } from "@/lib/types";

interface Fila {
  id: string;
  categoria: CategoriaProcedimiento;
  numero: number;
  data: Procedimiento;
  estado: "activo" | "archivado";
}

function lineas(txt: string): string[] {
  return txt.split("\n").map((l) => l.trim()).filter(Boolean);
}

function procedimientoVacio(categoria: CategoriaProcedimiento): Procedimiento {
  return {
    id: "",
    numero: 0,
    categoria,
    nombre: "",
    objetivo: "",
    fundamento: "",
    tipoMuestra: "",
    materiales: [],
    reactivos: [],
    equipos: [],
    procedimientoGeneral: [],
    interpretacion: "",
    resultadoPositivo: "",
    resultadoNegativo: "",
    erroresFrecuentes: [],
    controlCalidad: "",
    bioseguridad: "",
    limitaciones: "",
    microorganismosRelacionados: [],
    notaProtocolo: "Contenido educativo: no reemplaza el POE/protocolo institucional vigente.",
    fuentes: []
  };
}

export default function AdminProcedimientosPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("activo");
  const [busqueda, setBusqueda] = useState("");

  const [editando, setEditando] = useState<Procedimiento | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [materialesTxt, setMaterialesTxt] = useState("");
  const [reactivosTxt, setReactivosTxt] = useState("");
  const [equiposTxt, setEquiposTxt] = useState("");
  const [procedimientoTxt, setProcedimientoTxt] = useState("");
  const [erroresTxt, setErroresTxt] = useState("");
  const [fuentesTxt, setFuentesTxt] = useState("");
  const [microorganismosTxt, setMicroorganismosTxt] = useState("");

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
    const res = await fetch(`/api/admin/procedimientos?${params.toString()}`, {
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

  function abrirNuevo(categoria: CategoriaProcedimiento) {
    setEditando(procedimientoVacio(categoria));
    setMaterialesTxt(""); setReactivosTxt(""); setEquiposTxt("");
    setProcedimientoTxt(""); setErroresTxt(""); setFuentesTxt(""); setMicroorganismosTxt("");
    setError(null);
  }

  function abrirEdicion(p: Procedimiento) {
    setEditando(p);
    setMaterialesTxt(p.materiales.join("\n"));
    setReactivosTxt(p.reactivos.join("\n"));
    setEquiposTxt(p.equipos.join("\n"));
    setProcedimientoTxt(p.procedimientoGeneral.join("\n"));
    setErroresTxt(p.erroresFrecuentes.join("\n"));
    setFuentesTxt(p.fuentes.join("\n"));
    setMicroorganismosTxt(p.microorganismosRelacionados.join("\n"));
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
    const completo: Procedimiento = {
      ...editando,
      id: editando.id.trim(),
      materiales: lineas(materialesTxt),
      reactivos: lineas(reactivosTxt),
      equipos: lineas(equiposTxt),
      procedimientoGeneral: lineas(procedimientoTxt),
      erroresFrecuentes: lineas(erroresTxt),
      fuentes: lineas(fuentesTxt),
      microorganismosRelacionados: lineas(microorganismosTxt)
    };

    setGuardando(true);
    const token = await obtenerToken();
    const existe = filas.some((f) => f.id === completo.id);
    const res = await fetch(existe ? `/api/admin/procedimientos/${completo.id}` : "/api/admin/procedimientos", {
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
    const res = await fetch(`/api/admin/procedimientos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado })
    });
    if (res.ok) { setMensaje(estado === "archivado" ? "Archivado." : "Restaurado."); setTimeout(() => setMensaje(null), 3000); cargar(); }
  }

  async function eliminar(id: string) {
    if (!confirm(`¿Eliminar "${id}" de forma permanente?`)) return;
    const token = await obtenerToken();
    const res = await fetch(`/api/admin/procedimientos/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
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
        <p className="section-eyebrow">📋 Procedimientos</p>
        <h1 className="font-display text-2xl font-bold">Biblioteca de Laboratorio Clínico</h1>
      </div>

      {mensaje && <div className="rounded-lg border border-bio/40 bg-bio/10 px-4 py-2 text-sm text-bio">{mensaje}</div>}

      <div className="flex flex-wrap gap-2">
        {CATEGORIAS_PROCEDIMIENTOS.map((c) => (
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
          {CATEGORIAS_PROCEDIMIENTOS.map((c) => (<option key={c.id} value={c.id}>{c.emoji} {c.label}</option>))}
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
        <p className="text-sm text-mist-400">No hay procedimientos que coincidan.</p>
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
                <Link href={`/procedimientos/${f.id}`} target="_blank" className="focus-ring chip hover:border-bio hover:text-bio">Ver</Link>
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
              <p className="section-eyebrow">{filas.some((f) => f.id === editando.id) ? "Editar" : "Nuevo"} procedimiento</p>
              <button type="button" onClick={() => setEditando(null)} className="focus-ring chip">Cerrar</button>
            </div>
            {error && <p className="text-xs text-alert">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Id único"><input value={editando.id} disabled={filas.some((f) => f.id === editando.id)} onChange={(e) => setEditando({ ...editando, id: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm disabled:opacity-50" placeholder="ej. proc017" /></Campo>
              <Campo label="Categoría">
                <select value={editando.categoria} onChange={(e) => setEditando({ ...editando, categoria: e.target.value as CategoriaProcedimiento })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
                  {CATEGORIAS_PROCEDIMIENTOS.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                </select>
              </Campo>
              <Campo label="Número (orden)"><input type="number" value={editando.numero} onChange={(e) => setEditando({ ...editando, numero: Number(e.target.value) })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Nombre"><input value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Tipo de muestra"><input value={editando.tipoMuestra} onChange={(e) => setEditando({ ...editando, tipoMuestra: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Preparación previa (opcional)"><input value={editando.preparacionPrevia ?? ""} onChange={(e) => setEditando({ ...editando, preparacionPrevia: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
            </div>

            <Campo label="Objetivo"><textarea value={editando.objetivo} onChange={(e) => setEditando({ ...editando, objetivo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            <Campo label="Fundamento"><textarea value={editando.fundamento} onChange={(e) => setEditando({ ...editando, fundamento: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            <Campo label="Interpretación"><textarea value={editando.interpretacion} onChange={(e) => setEditando({ ...editando, interpretacion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Resultado positivo"><textarea value={editando.resultadoPositivo} onChange={(e) => setEditando({ ...editando, resultadoPositivo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Resultado negativo"><textarea value={editando.resultadoNegativo} onChange={(e) => setEditando({ ...editando, resultadoNegativo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Control de calidad"><textarea value={editando.controlCalidad} onChange={(e) => setEditando({ ...editando, controlCalidad: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Bioseguridad"><textarea value={editando.bioseguridad} onChange={(e) => setEditando({ ...editando, bioseguridad: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Limitaciones"><textarea value={editando.limitaciones} onChange={(e) => setEditando({ ...editando, limitaciones: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
              <Campo label="Nota de protocolo (POE institucional tiene prioridad)"><textarea value={editando.notaProtocolo} onChange={(e) => setEditando({ ...editando, notaProtocolo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Campo label="Materiales (uno por línea)"><textarea value={materialesTxt} onChange={(e) => setMaterialesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Reactivos (uno por línea)"><textarea value={reactivosTxt} onChange={(e) => setReactivosTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Equipos (uno por línea)"><textarea value={equiposTxt} onChange={(e) => setEquiposTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Errores frecuentes (uno por línea)"><textarea value={erroresTxt} onChange={(e) => setErroresTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Fuentes (una por línea)"><textarea value={fuentesTxt} onChange={(e) => setFuentesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={3} /></Campo>
              <Campo label="Ids de microorganismos relacionados (uno por línea)"><textarea value={microorganismosTxt} onChange={(e) => setMicroorganismosTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm font-mono" rows={3} placeholder="b001" /></Campo>
            </div>

            <Campo label="Procedimiento general (un paso por línea)">
              <textarea value={procedimientoTxt} onChange={(e) => setProcedimientoTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={4} />
            </Campo>

            <p className="text-xs text-mist-400">
              La imagen del procedimiento se administra en una fase posterior del CMS; si ya existía, se conserva.
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
