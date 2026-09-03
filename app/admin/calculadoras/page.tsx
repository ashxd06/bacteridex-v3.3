"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { formulaValida } from "@/lib/calc/evaluar";
import type { Calculadora, VariableCalculadora } from "@/lib/types";

interface Fila {
  id: string;
  numero: number;
  analisis_id: string | null;
  data: Calculadora;
  estado: "activo" | "archivado";
}

interface AnalisisOpcion { id: string; nombre: string }

function calculadoraVacia(): Calculadora {
  return {
    id: "",
    numero: 0,
    nombre: "",
    descripcion: "",
    analisisId: null,
    variables: [],
    formula: "",
    unidadResultado: "",
    interpretacion: "",
    notaAdvertencia: "Resultado con fines educativos. Verifica siempre la fórmula y las unidades contra una fuente confiable antes de usarlo clínicamente.",
    fuentes: []
  };
}

function lineas(txt: string): string[] {
  return txt.split("\n").map((l) => l.trim()).filter(Boolean);
}

export default function AdminCalculadorasPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [filas, setFilas] = useState<Fila[]>([]);
  const [analisisOpciones, setAnalisisOpciones] = useState<AnalisisOpcion[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>("activo");

  const [editando, setEditando] = useState<Calculadora | null>(null);
  const [fuentesTxt, setFuentesTxt] = useState("");
  const [guardando, setGuardando] = useState(false);

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
    if (filtroEstado !== "todos") params.set("estado", filtroEstado);
    const res = await fetch(`/api/admin/calculadoras?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    if (res.ok) setFilas(json.items ?? []);
    else setError(json?.error || "No se pudo cargar la lista.");
    setCargandoLista(false);
  }

  async function cargarAnalisisOpciones() {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { data } = await supabase.from("cms_analisis").select("id, data").eq("estado", "activo");
    setAnalisisOpciones((data ?? []).map((f: { id: string; data: { nombre: string } }) => ({ id: f.id, nombre: f.data.nombre })));
  }

  useEffect(() => {
    if (esAdmin) {
      cargar();
      cargarAnalisisOpciones();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin, filtroEstado]);

  function abrirNuevo() {
    setEditando(calculadoraVacia());
    setFuentesTxt("");
    setError(null);
  }

  function abrirEdicion(c: Calculadora) {
    setEditando(c);
    setFuentesTxt(c.fuentes.join("\n"));
    setError(null);
  }

  function actualizarVariable(i: number, cambios: Partial<VariableCalculadora>) {
    if (!editando) return;
    const vars = [...editando.variables];
    vars[i] = { ...vars[i], ...cambios };
    setEditando({ ...editando, variables: vars });
  }

  function agregarVariable() {
    if (!editando) return;
    setEditando({ ...editando, variables: [...editando.variables, { id: "", label: "", unidad: "" }] });
  }

  function quitarVariable(i: number) {
    if (!editando) return;
    setEditando({ ...editando, variables: editando.variables.filter((_, idx) => idx !== i) });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando) return;
    setError(null);

    if (!editando.id.trim() || !editando.nombre.trim()) {
      setError("El id y el nombre son obligatorios.");
      return;
    }
    if (editando.variables.some((v) => !v.id.trim() || !v.label.trim())) {
      setError("Cada variable necesita un símbolo y una etiqueta.");
      return;
    }
    if (!formulaValida(editando.formula)) {
      setError('La fórmula tiene un error de sintaxis (usa los símbolos de las variables, ej. "peso / (talla^2)").');
      return;
    }

    const completo: Calculadora = { ...editando, id: editando.id.trim(), fuentes: lineas(fuentesTxt) };

    setGuardando(true);
    const token = await obtenerToken();
    const existe = filas.some((f) => f.id === completo.id);
    const res = await fetch(existe ? `/api/admin/calculadoras/${completo.id}` : "/api/admin/calculadoras", {
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
    const res = await fetch(`/api/admin/calculadoras/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado })
    });
    if (res.ok) { setMensaje(estado === "archivado" ? "Archivada." : "Restaurada."); setTimeout(() => setMensaje(null), 3000); cargar(); }
  }

  async function eliminar(id: string) {
    if (!confirm(`¿Eliminar "${id}" de forma permanente?`)) return;
    const token = await obtenerToken();
    const res = await fetch(`/api/admin/calculadoras/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) { setMensaje("Eliminada."); setTimeout(() => setMensaje(null), 3000); cargar(); }
  }

  if (!habilitado) return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  if (!esAdmin) return <div className="lab-card mx-auto max-w-md p-8 text-center text-mist-400">Esta sección es solo para administradores.</div>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="section-eyebrow hover:text-bio-glow">← Panel de administración</Link>
      <div>
        <p className="section-eyebrow">🧮 Calculadoras</p>
        <h1 className="font-display text-2xl font-bold">Herramientas de cálculo de laboratorio</h1>
        <p className="text-sm text-mist-400">
          Cada calculadora se evalúa con una fórmula matemática segura (mathjs), nunca con código.
          Si dejas la fórmula vacía, la calculadora queda marcada como &quot;pendiente&quot; y no
          calcula nada — no se inventan fórmulas clínicas aquí.
        </p>
      </div>

      {mensaje && <div className="rounded-lg border border-bio/40 bg-bio/10 px-4 py-2 text-sm text-bio">{mensaje}</div>}

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={abrirNuevo} className="focus-ring chip hover:border-bio hover:text-bio">+ Nueva calculadora</button>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
          <option value="activo">Activas</option>
          <option value="archivado">Archivadas</option>
          <option value="todos">Todas</option>
        </select>
      </div>

      {cargandoLista ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : filas.length === 0 ? (
        <p className="text-sm text-mist-400">No hay calculadoras todavía.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filas.map((f) => (
            <div key={f.id} className="lab-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">
                  {f.data.nombre}{" "}
                  {!f.data.formula.trim() && <span className="chip ml-1 text-[10px] text-gold">pendiente</span>}
                  {f.estado === "archivado" && <span className="chip ml-1 text-[10px] text-gold">archivada</span>}
                </p>
                <p className="text-xs text-mist-400">id: {f.id}{f.analisis_id ? ` · análisis: ${f.analisis_id}` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/calculadoras/${f.id}`} target="_blank" className="focus-ring chip hover:border-bio hover:text-bio">Ver</Link>
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
              <p className="section-eyebrow">{filas.some((f) => f.id === editando.id) ? "Editar" : "Nueva"} calculadora</p>
              <button type="button" onClick={() => setEditando(null)} className="focus-ring chip">Cerrar</button>
            </div>
            {error && <p className="text-xs text-alert">{error}</p>}

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Id único"><input value={editando.id} disabled={filas.some((f) => f.id === editando.id)} onChange={(e) => setEditando({ ...editando, id: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm disabled:opacity-50" placeholder="ej. imc" /></Campo>
              <Campo label="Nombre"><input value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Número (orden)"><input type="number" value={editando.numero} onChange={(e) => setEditando({ ...editando, numero: Number(e.target.value) })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Análisis relacionado (opcional)">
                <select value={editando.analisisId ?? ""} onChange={(e) => setEditando({ ...editando, analisisId: e.target.value || null })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
                  <option value="">— Ninguno —</option>
                  {analisisOpciones.map((a) => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
                </select>
              </Campo>
            </div>

            <Campo label="Descripción"><textarea value={editando.descripcion} onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>

            <p className="section-eyebrow">Variables de entrada</p>
            <div className="flex flex-col gap-2">
              {editando.variables.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <input value={v.id} onChange={(e) => actualizarVariable(i, { id: e.target.value })} placeholder="símbolo (ej. peso)" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm font-mono" />
                  <input value={v.label} onChange={(e) => actualizarVariable(i, { label: e.target.value })} placeholder="etiqueta (ej. Peso corporal)" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm" />
                  <input value={v.unidad ?? ""} onChange={(e) => actualizarVariable(i, { unidad: e.target.value })} placeholder="unidad (ej. kg)" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm" />
                  <button type="button" onClick={() => quitarVariable(i)} className="focus-ring chip hover:border-alert hover:text-alert">✕</button>
                </div>
              ))}
              <button type="button" onClick={agregarVariable} className="focus-ring w-fit chip hover:border-bio hover:text-bio">+ Agregar variable</button>
            </div>

            <Campo label='Fórmula (usa los símbolos de arriba, ej. "peso / (talla^2)"; déjala vacía = pendiente)'>
              <input value={editando.formula} onChange={(e) => setEditando({ ...editando, formula: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm font-mono" placeholder="peso / (talla^2)" />
            </Campo>
            {editando.formula.trim() && !formulaValida(editando.formula) && (
              <p className="text-xs text-alert">Sintaxis inválida — revisa paréntesis y operadores.</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Unidad del resultado"><input value={editando.unidadResultado} onChange={(e) => setEditando({ ...editando, unidadResultado: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
              <Campo label="Fuentes (una por línea)"><textarea value={fuentesTxt} onChange={(e) => setFuentesTxt(e.target.value)} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            </div>

            <Campo label="Interpretación (cómo leer el resultado, opcional)"><textarea value={editando.interpretacion} onChange={(e) => setEditando({ ...editando, interpretacion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>
            <Campo label="Nota / advertencia"><textarea value={editando.notaAdvertencia} onChange={(e) => setEditando({ ...editando, notaAdvertencia: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} /></Campo>

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
