"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getLabConfig } from "@/lib/labConfig";
import type { LabConfig } from "@/lib/types";

export default function AdminConfigLaboratorioPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [config, setConfig] = useState<LabConfig | null>(null);
  const [cargandoConfig, setCargandoConfig] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    if (esAdmin) {
      getLabConfig().then((c) => {
        setConfig(c);
        setCargandoConfig(false);
      });
    }
  }, [esAdmin]);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setError(null);
    setGuardando(true);
    const supabase = getSupabaseClient();
    const token = supabase ? (await supabase.auth.getSession()).data.session?.access_token : null;
    const res = await fetch("/api/admin/config-laboratorio", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        laboratorio_nombre: config.laboratorio_nombre,
        laboratorio_info: config.laboratorio_info,
        logo_url: config.logo_url,
        profesional_nombre: config.profesional_nombre,
        profesional_profesion: config.profesional_profesion,
        profesional_registro: config.profesional_registro,
        profesional_cargo: config.profesional_cargo,
        firma_url: config.firma_url,
        sello_url: config.sello_url
      })
    });
    const json = await res.json();
    setGuardando(false);
    if (!res.ok) { setError(json?.error || "No se pudo guardar."); return; }
    setMensaje("Configuración guardada.");
    setTimeout(() => setMensaje(null), 3000);
  }

  if (!habilitado) return <div className="lab-card p-8 text-center text-mist-400">Las cuentas de usuario no están configuradas en este despliegue todavía.</div>;
  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  if (!esAdmin) return <div className="lab-card mx-auto max-w-md p-8 text-center text-mist-400">Esta sección es solo para administradores.</div>;
  if (cargandoConfig || !config) return <p className="text-sm text-mist-400">Cargando…</p>;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="section-eyebrow hover:text-bio-glow">← Panel de administración</Link>
      <div>
        <p className="section-eyebrow">⚙️ Configuración del laboratorio</p>
        <h1 className="font-display text-2xl font-bold">Encabezado, profesional, firma y sello</h1>
        <p className="text-sm text-mist-400">
          Estos datos aparecen en el encabezado y la validación (firma/sello) de todos los informes
          de <Link href="/resultados" className="underline hover:text-bio">/resultados</Link>. Pega
          la URL de una imagen ya subida (logo, firma, sello) — la subida de archivos directa llega
          en una fase posterior del CMS.
        </p>
      </div>

      {mensaje && <div className="rounded-lg border border-bio/40 bg-bio/10 px-4 py-2 text-sm text-bio">{mensaje}</div>}

      <form onSubmit={guardar} className="lab-card flex flex-col gap-4 p-6">
        {error && <p className="text-xs text-alert">{error}</p>}

        <p className="section-eyebrow">Laboratorio</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Nombre del laboratorio">
            <input value={config.laboratorio_nombre} onChange={(e) => setConfig({ ...config, laboratorio_nombre: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" />
          </Campo>
          <Campo label="URL del logo (opcional)">
            <input value={config.logo_url ?? ""} onChange={(e) => setConfig({ ...config, logo_url: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="https://…" />
          </Campo>
        </div>
        <Campo label="Información institucional (dirección, contacto, etc. — opcional)">
          <textarea value={config.laboratorio_info ?? ""} onChange={(e) => setConfig({ ...config, laboratorio_info: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" rows={2} />
        </Campo>

        <p className="section-eyebrow mt-2">Profesional responsable</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="Nombre"><input value={config.profesional_nombre ?? ""} onChange={(e) => setConfig({ ...config, profesional_nombre: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
          <Campo label="Profesión"><input value={config.profesional_profesion ?? ""} onChange={(e) => setConfig({ ...config, profesional_profesion: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="Licenciado/a en Laboratorio Clínico" /></Campo>
          <Campo label="Registro profesional"><input value={config.profesional_registro ?? ""} onChange={(e) => setConfig({ ...config, profesional_registro: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
          <Campo label="Cargo"><input value={config.profesional_cargo ?? ""} onChange={(e) => setConfig({ ...config, profesional_cargo: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" /></Campo>
        </div>

        <p className="section-eyebrow mt-2">Firma y sello</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo label="URL de la firma (imagen con fondo transparente recomendada)">
            <input value={config.firma_url ?? ""} onChange={(e) => setConfig({ ...config, firma_url: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="https://…" />
          </Campo>
          <Campo label="URL del sello (imagen con fondo transparente recomendada)">
            <input value={config.sello_url ?? ""} onChange={(e) => setConfig({ ...config, sello_url: e.target.value })} className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm" placeholder="https://…" />
          </Campo>
        </div>
        <p className="text-xs text-mist-400">
          Sin estas URLs, el informe muestra un sello y una firma de marcador de posición (no datos
          reales) para que la composición se vea completa igualmente.
        </p>

        <button type="submit" disabled={guardando} className="focus-ring w-fit rounded-lg bg-bio px-5 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60">
          {guardando ? "Guardando…" : "Guardar configuración"}
        </button>
      </form>
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
