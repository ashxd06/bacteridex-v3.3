"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getLabConfig } from "@/lib/labConfig";
import { analisisClinicos } from "@/lib/data";
import InformeImprimible from "@/components/resultados/InformeImprimible";
import type { EstadoResultado, InformeLaboratorio, LabConfig, ResultadoLaboratorio } from "@/lib/types";

const ESTADOS: EstadoResultado[] = ["pendiente", "normal", "bajo", "alto", "critico"];

export default function InformeDetallePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, cargando, habilitado } = useAuth();

  const [informe, setInforme] = useState<InformeLaboratorio | null>(null);
  const [items, setItems] = useState<ResultadoLaboratorio[]>([]);
  const [labConfig, setLabConfig] = useState<LabConfig | null>(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardandoCabecera, setGuardandoCabecera] = useState(false);

  const [nuevoAnalisisId, setNuevoAnalisisId] = useState("");
  const [nuevoAnalisisNombre, setNuevoAnalisisNombre] = useState("");
  const [agregando, setAgregando] = useState(false);

  async function cargarTodo() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setCargandoDatos(true);
    setError(null);

    const [{ data: informeData, error: informeError }, { data: itemsData, error: itemsError }, config] =
      await Promise.all([
        supabase.from("resultados_informes").select("*").eq("id", params.id).maybeSingle(),
        supabase.from("resultados_laboratorio").select("*").eq("informe_id", params.id).order("created_at", { ascending: true }),
        getLabConfig()
      ]);

    if (informeError || !informeData) {
      setError("No se encontró el informe (o no tienes acceso).");
      setCargandoDatos(false);
      return;
    }
    setInforme(informeData as InformeLaboratorio);
    if (itemsError) setError("No se pudieron cargar los resultados.");
    else setItems((itemsData as ResultadoLaboratorio[]) ?? []);
    setLabConfig(config);
    setCargandoDatos(false);
  }

  useEffect(() => {
    if (user && params.id) cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  async function guardarCabecera() {
    if (!informe || !user) return;
    setGuardandoCabecera(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase
      .from("resultados_informes")
      .update({
        fecha: informe.fecha,
        codigo_muestra: informe.codigo_muestra,
        paciente_nombre: informe.paciente_nombre,
        paciente_edad: informe.paciente_edad,
        paciente_sexo: informe.paciente_sexo,
        observaciones_generales: informe.observaciones_generales,
        estado_informe: informe.estado_informe,
        updated_by: user.id
      })
      .eq("id", informe.id);
    setGuardandoCabecera(false);
    if (error) setError("No se pudo guardar la cabecera.");
  }

  async function agregarResultado() {
    if (!informe || !user || !nuevoAnalisisNombre.trim()) return;
    setAgregando(true);
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const analisis = analisisClinicos.find((a) => a.id === nuevoAnalisisId);
    const { data, error } = await supabase
      .from("resultados_laboratorio")
      .insert({
        informe_id: informe.id,
        user_id: user.id,
        created_by: user.id,
        fecha: informe.fecha,
        analisis_id: nuevoAnalisisId || null,
        analisis_nombre: nuevoAnalisisNombre.trim(),
        unidad: analisis?.unidades || null,
        rango_referencia: analisis?.valoresReferencia || null,
        estado: "pendiente"
      })
      .select("*")
      .single();
    setAgregando(false);
    if (error || !data) { setError("No se pudo agregar el resultado."); return; }
    setItems([...items, data as ResultadoLaboratorio]);
    setNuevoAnalisisId("");
    setNuevoAnalisisNombre("");
  }

  async function actualizarItem(id: string, cambios: Partial<ResultadoLaboratorio>) {
    setItems(items.map((it) => (it.id === id ? { ...it, ...cambios } : it)));
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    await supabase.from("resultados_laboratorio").update({ ...cambios, updated_by: user.id }).eq("id", id);
  }

  async function eliminarItem(id: string) {
    if (!confirm("¿Eliminar este resultado del informe?")) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("resultados_laboratorio").delete().eq("id", id);
    if (!error) setItems(items.filter((it) => it.id !== id));
  }

  if (!habilitado) return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para ver este informe." />;
  if (cargandoDatos) return <p className="text-sm text-mist-400">Cargando…</p>;
  if (!informe) return <div className="lab-card p-8 text-center text-alert">{error || "Informe no encontrado."}</div>;

  return (
    <div className="flex flex-col gap-8">
      {/* Controles — ocultos al imprimir */}
      <div className="print:hidden flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button onClick={() => router.push("/resultados")} className="section-eyebrow hover:text-bio-glow">
            ← Tus informes
          </button>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="focus-ring chip hover:border-bio hover:text-bio">
              🖨️ Imprimir / Descargar PDF
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-alert">{error}</p>}

        <div className="lab-card flex flex-col gap-3 p-5">
          <p className="section-eyebrow">Datos del informe</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Campo label="Fecha">
              <input type="date" value={informe.fecha} onChange={(e) => setInforme({ ...informe, fecha: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
            </Campo>
            <Campo label="Código de muestra">
              <input value={informe.codigo_muestra ?? ""} onChange={(e) => setInforme({ ...informe, codigo_muestra: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
            </Campo>
            <Campo label="Nombre del paciente (opcional, práctica)">
              <input value={informe.paciente_nombre ?? ""} onChange={(e) => setInforme({ ...informe, paciente_nombre: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
            </Campo>
            <Campo label="Edad">
              <input value={informe.paciente_edad ?? ""} onChange={(e) => setInforme({ ...informe, paciente_edad: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
            </Campo>
            <Campo label="Sexo">
              <input value={informe.paciente_sexo ?? ""} onChange={(e) => setInforme({ ...informe, paciente_sexo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
            </Campo>
            <Campo label="Estado del informe">
              <select value={informe.estado_informe} onChange={(e) => setInforme({ ...informe, estado_informe: e.target.value as InformeLaboratorio["estado_informe"] })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm">
                <option value="borrador">Borrador</option>
                <option value="completado">Completado</option>
              </select>
            </Campo>
          </div>
          <Campo label="Observaciones generales">
            <textarea value={informe.observaciones_generales ?? ""} onChange={(e) => setInforme({ ...informe, observaciones_generales: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} />
          </Campo>
          <button onClick={guardarCabecera} disabled={guardandoCabecera} className="focus-ring w-fit rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60">
            {guardandoCabecera ? "Guardando…" : "Guardar datos del informe"}
          </button>
        </div>

        <div className="lab-card flex flex-col gap-3 p-5">
          <p className="section-eyebrow">Resultados</p>
          {items.map((it) => (
            <div key={it.id} className="grid gap-2 rounded-lg border border-base-600 p-3 sm:grid-cols-6">
              <p className="text-sm font-medium sm:col-span-2">{it.analisis_nombre}</p>
              <input
                value={it.resultado}
                onChange={(e) => actualizarItem(it.id, { resultado: e.target.value })}
                placeholder="Resultado"
                className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
              />
              <input
                value={it.unidad ?? ""}
                onChange={(e) => actualizarItem(it.id, { unidad: e.target.value })}
                placeholder="Unidad"
                className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
              />
              <input
                value={it.rango_referencia ?? ""}
                onChange={(e) => actualizarItem(it.id, { rango_referencia: e.target.value })}
                placeholder="Valores de referencia"
                className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
              />
              <div className="flex items-center gap-2">
                <select
                  value={it.estado}
                  onChange={(e) => actualizarItem(it.id, { estado: e.target.value as EstadoResultado })}
                  className="focus-ring flex-1 rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
                >
                  {ESTADOS.map((e) => (<option key={e} value={e}>{e}</option>))}
                </select>
                <button onClick={() => eliminarItem(it.id)} className="focus-ring chip hover:border-alert hover:text-alert">✕</button>
              </div>
            </div>
          ))}

          <div className="grid gap-2 rounded-lg border border-dashed border-base-600 p-3 sm:grid-cols-3">
            <select
              value={nuevoAnalisisId}
              onChange={(e) => {
                const a = analisisClinicos.find((x) => x.id === e.target.value);
                setNuevoAnalisisId(e.target.value);
                if (a) setNuevoAnalisisNombre(a.nombre);
              }}
              className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
            >
              <option value="">Elegir de la biblioteca de análisis…</option>
              {analisisClinicos.map((a) => (<option key={a.id} value={a.id}>{a.nombre}</option>))}
            </select>
            <input
              value={nuevoAnalisisNombre}
              onChange={(e) => setNuevoAnalisisNombre(e.target.value)}
              placeholder="…o escribe el nombre del análisis"
              className="focus-ring rounded-lg border border-base-600 bg-base-800 px-2 py-1.5 text-sm"
            />
            <button onClick={agregarResultado} disabled={agregando || !nuevoAnalisisNombre.trim()} className="focus-ring chip hover:border-bio hover:text-bio disabled:opacity-50">
              + Agregar a la tabla
            </button>
          </div>
        </div>

        <p className="text-xs text-mist-400">
          Vista previa del informe (esto es exactamente lo que se imprime):
        </p>
      </div>

      {/* Vista previa / lo único que se imprime */}
      <InformeImprimible informe={informe} items={items} labConfig={labConfig} />

      <div className="print:hidden">
        <Link href="/admin/config" className="text-xs text-mist-400 hover:text-bio">
          ¿Eres admin? Configura el nombre del laboratorio, profesional, firma y sello aquí →
        </Link>
      </div>
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
