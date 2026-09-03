"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { analisisClinicos } from "@/lib/data";
import EstadoBadge from "@/components/resultados/EstadoBadge";
import type { EstadoResultado, ResultadoLaboratorio } from "@/lib/types";

type Orden = "fecha_desc" | "fecha_asc" | "analisis";

export default function RegistrosPage() {
  const { user, cargando, habilitado } = useAuth();
  const [registros, setRegistros] = useState<ResultadoLaboratorio[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoResultado>("todos");
  const [orden, setOrden] = useState<Orden>("fecha_desc");

  const [creando, setCreando] = useState(false);
  const [nuevoAnalisisId, setNuevoAnalisisId] = useState("");
  const [nuevoAnalisisNombre, setNuevoAnalisisNombre] = useState("");
  const [nuevoResultado, setNuevoResultado] = useState("");
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  async function cargar() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setCargandoLista(true);
    const { data, error } = await supabase
      .from("resultados_laboratorio")
      .select("*")
      .order("fecha", { ascending: false });
    if (error) setError("No se pudo cargar tu historial.");
    else setRegistros((data as ResultadoLaboratorio[]) ?? []);
    setCargandoLista(false);
  }

  useEffect(() => {
    if (user) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function actualizar(id: string, cambios: Partial<ResultadoLaboratorio>) {
    setRegistros(registros.map((r) => (r.id === id ? { ...r, ...cambios } : r)));
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    await supabase.from("resultados_laboratorio").update({ ...cambios, updated_by: user.id }).eq("id", id);
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("resultados_laboratorio").delete().eq("id", id);
    if (!error) setRegistros(registros.filter((r) => r.id !== id));
  }

  async function crearRegistro() {
    if (!user || !nuevoAnalisisNombre.trim()) return;
    setGuardandoNuevo(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const analisis = analisisClinicos.find((a) => a.id === nuevoAnalisisId);
    const { data, error } = await supabase
      .from("resultados_laboratorio")
      .insert({
        informe_id: null,
        user_id: user.id,
        created_by: user.id,
        fecha: new Date().toISOString().slice(0, 10),
        analisis_id: nuevoAnalisisId || null,
        analisis_nombre: nuevoAnalisisNombre.trim(),
        resultado: nuevoResultado.trim(),
        unidad: analisis?.unidades || null,
        rango_referencia: analisis?.valoresReferencia || null,
        estado: "pendiente"
      })
      .select("*")
      .single();
    setGuardandoNuevo(false);
    if (error || !data) { setError("No se pudo crear el registro."); return; }
    setRegistros([data as ResultadoLaboratorio, ...registros]);
    setNuevoAnalisisId("");
    setNuevoAnalisisNombre("");
    setNuevoResultado("");
    setCreando(false);
    setMensaje("Registro guardado.");
    setTimeout(() => setMensaje(null), 3000);
  }

  const visibles = useMemo(() => {
    let lista = [...registros];
    if (filtroEstado !== "todos") lista = lista.filter((r) => r.estado === filtroEstado);
    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((r) => r.analisis_nombre.toLowerCase().includes(q));
    }
    lista.sort((a, b) => {
      if (orden === "analisis") return a.analisis_nombre.localeCompare(b.analisis_nombre);
      if (orden === "fecha_asc") return a.fecha.localeCompare(b.fecha);
      return b.fecha.localeCompare(a.fecha);
    });
    return lista;
  }, [registros, busqueda, filtroEstado, orden]);

  if (!habilitado) return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para ver y guardar tu historial de resultados." />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow">📚 Registros</p>
          <h1 className="font-display text-2xl font-bold">Tu historial de resultados</h1>
          <p className="text-sm text-mist-400">
            Todos tus resultados guardados, vengan de un informe (
            <Link href="/resultados" className="underline hover:text-bio">/resultados</Link>) o de
            una calculadora. Solo tú puedes verlos y editarlos.
          </p>
        </div>
        <button onClick={() => setCreando((v) => !v)} className="focus-ring w-fit rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow">
          {creando ? "Cancelar" : "+ Nuevo registro"}
        </button>
      </div>

      {mensaje && <div className="rounded-lg border border-bio/40 bg-bio/10 px-4 py-2 text-sm text-bio">{mensaje}</div>}
      {error && <p className="text-xs text-alert">{error}</p>}

      {creando && (
        <div className="lab-card grid gap-2 p-4 sm:grid-cols-4">
          <select
            value={nuevoAnalisisId}
            onChange={(e) => {
              const a = analisisClinicos.find((x) => x.id === e.target.value);
              setNuevoAnalisisId(e.target.value);
              if (a) setNuevoAnalisisNombre(a.nombre);
            }}
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
          >
            <option value="">Elegir análisis…</option>
            {analisisClinicos.map((a) => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
          </select>
          <input value={nuevoAnalisisNombre} onChange={(e) => setNuevoAnalisisNombre(e.target.value)} placeholder="…o escribe el nombre" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm" />
          <input value={nuevoResultado} onChange={(e) => setNuevoResultado(e.target.value)} placeholder="Resultado" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm" />
          <button onClick={crearRegistro} disabled={guardandoNuevo || !nuevoAnalisisNombre.trim()} className="focus-ring chip hover:border-bio hover:text-bio disabled:opacity-50">
            Guardar
          </button>
        </div>
      )}

      <div className="lab-card flex flex-wrap items-center gap-3 p-4">
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por análisis…" className="focus-ring min-w-[200px] flex-1 rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value as "todos" | EstadoResultado)} className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
          <option value="todos">Todos los estados</option>
          <option value="normal">Normal</option>
          <option value="bajo">Bajo</option>
          <option value="alto">Alto</option>
          <option value="critico">Crítico</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <select value={orden} onChange={(e) => setOrden(e.target.value as Orden)} className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
          <option value="fecha_desc">Más recientes primero</option>
          <option value="fecha_asc">Más antiguos primero</option>
          <option value="analisis">Alfabético (análisis)</option>
        </select>
      </div>

      {cargandoLista ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : visibles.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">
          {registros.length === 0 ? "Todavía no tienes registros guardados." : "Ningún registro coincide con el filtro."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibles.map((r) => (
            <div key={r.id} className="lab-card grid gap-2 p-4 sm:grid-cols-6 sm:items-center">
              <div className="sm:col-span-2">
                <p className="text-sm font-medium">{r.analisis_nombre}</p>
                <p className="text-xs text-mist-400">
                  {new Date(r.fecha + "T00:00:00").toLocaleDateString("es")}
                  {r.informe_id && (
                    <>
                      {" · "}
                      <Link href={`/resultados/${r.informe_id}`} className="underline hover:text-bio">informe</Link>
                    </>
                  )}
                </p>
              </div>
              <input value={r.resultado} onChange={(e) => actualizar(r.id, { resultado: e.target.value })} placeholder="Resultado" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm" />
              <input value={r.rango_referencia ?? ""} onChange={(e) => actualizar(r.id, { rango_referencia: e.target.value })} placeholder="Rango de referencia" className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm" />
              <select value={r.estado} onChange={(e) => actualizar(r.id, { estado: e.target.value as EstadoResultado })} className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm">
                <option value="pendiente">Pendiente</option>
                <option value="normal">Normal</option>
                <option value="bajo">Bajo</option>
                <option value="alto">Alto</option>
                <option value="critico">Crítico</option>
              </select>
              <div className="flex items-center justify-between gap-2">
                <EstadoBadge estado={r.estado} />
                <button onClick={() => eliminar(r.id)} className="focus-ring chip hover:border-alert hover:text-alert">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
