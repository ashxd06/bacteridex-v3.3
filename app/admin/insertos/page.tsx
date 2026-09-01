"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { listarInsertos, urlPublicaInserto, type InsertoFila } from "@/lib/insertos";
import { analisisClinicos } from "@/lib/data";

const TAMANO_MAXIMO_MB = 10;

export default function AdminInsertosPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [insertos, setInsertos] = useState<InsertoFila[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nombre, setNombre] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [version, setVersion] = useState("");
  const [fecha, setFecha] = useState("");
  const [analisisId, setAnalisisId] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  async function cargar() {
    setCargandoLista(true);
    const data = await listarInsertos();
    setInsertos(data);
    setCargandoLista(false);
  }

  useEffect(() => {
    if (esAdmin) cargar();
  }, [esAdmin]);

  async function obtenerToken() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  function limpiarFormulario() {
    setNombre("");
    setFabricante("");
    setVersion("");
    setFecha("");
    setAnalisisId("");
    setArchivo(null);
  }

  async function subirInserto(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nombre.trim() || !fabricante.trim() || !archivo) {
      setError("Completa nombre, fabricante y selecciona un PDF.");
      return;
    }
    if (archivo.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    if (archivo.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      setError(`El PDF supera el tamaño máximo permitido (${TAMANO_MAXIMO_MB} MB).`);
      return;
    }

    setSubiendo(true);
    const token = await obtenerToken();
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    });

    const respuesta = await fetch("/api/admin/insertos", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nombre: nombre.trim(),
        fabricante: fabricante.trim(),
        version: version.trim() || null,
        fecha: fecha || null,
        analisisId: analisisId || null,
        filename: archivo.name,
        fileBase64
      })
    });
    const json = await respuesta.json();
    setSubiendo(false);

    if (!respuesta.ok) {
      setError(json?.error || "No se pudo subir el inserto.");
      return;
    }

    limpiarFormulario();
    cargar();
  }

  async function cambiarEstado(id: string, estado: "vigente" | "archivado") {
    const token = await obtenerToken();
    const respuesta = await fetch(`/api/admin/insertos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado })
    });
    if (respuesta.ok) cargar();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este inserto de forma permanente? Esta acción no se puede deshacer.")) return;
    const token = await obtenerToken();
    const respuesta = await fetch(`/api/admin/insertos/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (respuesta.ok) cargar();
  }

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        Las cuentas de usuario no están configuradas en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  if (!esAdmin) {
    return (
      <div className="lab-card mx-auto max-w-md p-8 text-center text-mist-400">
        Esta sección es solo para administradores.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Link href="/admin" className="section-eyebrow hover:text-bio-glow">
        ← Panel de administración
      </Link>
      <div>
        <p className="section-eyebrow">📄 Insertos</p>
        <h1 className="font-display text-2xl font-bold">Gestionar insertos</h1>
      </div>

      <form onSubmit={subirInserto} className="lab-card flex flex-col gap-3 p-5">
        <p className="section-eyebrow">+ Nuevo inserto</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre del producto (ej. Glucosa Líquida)"
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
          />
          <input
            value={fabricante}
            onChange={(e) => setFabricante(e.target.value)}
            placeholder="Fabricante"
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
          />
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Versión (opcional)"
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
          />
          <select
            value={analisisId}
            onChange={(e) => setAnalisisId(e.target.value)}
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm sm:col-span-2"
          >
            <option value="">Sin análisis asociado</option>
            {analisisClinicos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
            className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm sm:col-span-2"
          />
        </div>
        {error && <p className="text-xs text-alert">{error}</p>}
        <button
          type="submit"
          disabled={subiendo}
          className="focus-ring w-fit rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60"
        >
          {subiendo ? "Subiendo…" : "Subir inserto"}
        </button>
      </form>

      <section>
        <p className="section-eyebrow mb-3">Insertos existentes</p>
        {cargandoLista ? (
          <p className="text-sm text-mist-400">Cargando…</p>
        ) : insertos.length === 0 ? (
          <p className="text-sm text-mist-400">Aún no hay insertos.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {insertos.map((i) => {
              const url = urlPublicaInserto(i.storage_path);
              return (
                <div key={i.id} className="lab-card flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-medium">
                      {i.nombre} <span className="chip ml-1 text-[10px]">{i.estado}</span>
                    </p>
                    <p className="text-xs text-mist-400">
                      {i.fabricante} {i.version ? `· v${i.version}` : ""} ·{" "}
                      {(i.file_size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {url && (
                      <a href={url} target="_blank" rel="noreferrer" className="focus-ring chip hover:border-bio hover:text-bio">
                        Ver PDF
                      </a>
                    )}
                    <button
                      onClick={() => cambiarEstado(i.id, i.estado === "vigente" ? "archivado" : "vigente")}
                      className="focus-ring chip hover:border-gold hover:text-gold"
                    >
                      {i.estado === "vigente" ? "Archivar" : "Reactivar"}
                    </button>
                    <button onClick={() => eliminar(i.id)} className="focus-ring chip hover:border-alert hover:text-alert">
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
