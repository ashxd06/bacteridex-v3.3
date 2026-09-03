"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { EstadoInforme, InformeLaboratorio } from "@/lib/types";

export default function ResultadosPage() {
  const { user, cargando, habilitado } = useAuth();
  const [informes, setInformes] = useState<InformeLaboratorio[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoInforme>("todos");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setCargandoLista(true);
    const { data, error } = await supabase
      .from("resultados_informes")
      .select("*")
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) setError("No se pudieron cargar tus informes.");
    else setInformes((data as InformeLaboratorio[]) ?? []);
    setCargandoLista(false);
  }

  useEffect(() => {
    if (user) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function crearInforme() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setCreando(true);
    setError(null);
    const { data, error } = await supabase
      .from("resultados_informes")
      .insert({ user_id: user.id, created_by: user.id, fecha: new Date().toISOString().slice(0, 10) })
      .select("id")
      .single();
    setCreando(false);
    if (error || !data) {
      setError("No se pudo crear el informe.");
      return;
    }
    window.location.href = `/resultados/${data.id}`;
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este informe y todos sus resultados? Esta acción no se puede deshacer.")) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("resultados_informes").delete().eq("id", id);
    if (!error) cargar();
  }

  if (!habilitado) {
    return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  }
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para ver y crear tus informes de resultados." />;

  const filtrados = informes.filter((i) => {
    if (filtroEstado !== "todos" && i.estado_informe !== filtroEstado) return false;
    if (!busqueda.trim()) return true;
    const q = busqueda.trim().toLowerCase();
    return [i.codigo_muestra, i.paciente_nombre].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-eyebrow">🧾 Resultados de laboratorio</p>
          <h1 className="font-display text-2xl font-bold">Tus informes</h1>
          <p className="text-sm text-mist-400">
            Crea informes de práctica con formato profesional: encabezado, tabla de resultados,
            firma y sello. Contenido educativo — no sustituye un informe clínico real.
          </p>
        </div>
        <button
          onClick={crearInforme}
          disabled={creando}
          className="focus-ring w-fit rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60"
        >
          {creando ? "Creando…" : "+ Nuevo informe"}
        </button>
      </div>

      <Link href="/registros" className="text-xs text-mist-400 hover:text-bio">
        Ver también tu historial de registros sueltos (incluye resultados guardados desde calculadoras) →
      </Link>

      {error && <p className="text-xs text-alert">{error}</p>}

      <div className="lab-card flex flex-wrap items-center gap-3 p-4">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por paciente o código de muestra…"
          className="focus-ring min-w-[220px] flex-1 rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as "todos" | EstadoInforme)}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        >
          <option value="todos">Todos los estados</option>
          <option value="borrador">Borrador</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {cargandoLista ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">
          {informes.length === 0 ? "Todavía no has creado ningún informe." : "Ningún informe coincide con la búsqueda."}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((i) => (
            <Link key={i.id} href={`/resultados/${i.id}`} className="lab-card focus-ring flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">
                  {i.paciente_nombre || "Sin nombre de paciente"}{" "}
                  <span className="chip ml-1 text-[10px]">{i.estado_informe}</span>
                </p>
                <p className="text-xs text-mist-400">
                  {new Date(i.fecha + "T00:00:00").toLocaleDateString("es")}
                  {i.codigo_muestra ? ` · Código: ${i.codigo_muestra}` : ""}
                </p>
              </div>
              <button
                onClick={(e) => { e.preventDefault(); eliminar(i.id); }}
                className="focus-ring chip hover:border-alert hover:text-alert"
              >
                Eliminar
              </button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
