"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getOrganismoPorId, todosLosOrganismos } from "@/lib/data";

interface Nota {
  id: string;
  organismo_id: string | null;
  titulo: string;
  contenido: string;
  created_at: string;
  updated_at: string;
}

export default function NotasPage() {
  const { user, cargando, habilitado } = useAuth();
  const [notas, setNotas] = useState<Nota[]>([]);
  const [cargandoNotas, setCargandoNotas] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [organismoId, setOrganismoId] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargarNotas() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setCargandoNotas(true);
    const { data, error } = await supabase
      .from("notes")
      .select("id, organismo_id, titulo, contenido, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (error) setError("No se pudieron cargar tus notas.");
    else setNotas(data ?? []);
    setCargandoNotas(false);
  }

  useEffect(() => {
    if (user) cargarNotas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function limpiarFormulario() {
    setTitulo("");
    setContenido("");
    setOrganismoId("");
    setEditandoId(null);
  }

  async function guardarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!titulo.trim() || !contenido.trim()) {
      setError("Escribe un título y contenido para tu nota.");
      return;
    }
    const supabase = getSupabaseClient();
    if (!supabase) return;
    setGuardando(true);
    setError(null);

    if (editandoId) {
      const { error } = await supabase
        .from("notes")
        .update({
          titulo: titulo.trim(),
          contenido: contenido.trim(),
          organismo_id: organismoId || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", editandoId);
      if (error) setError("No se pudo actualizar la nota.");
    } else {
      const { error } = await supabase.from("notes").insert({
        user_id: user.id,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        organismo_id: organismoId || null
      });
      if (error) setError("No se pudo guardar la nota.");
    }

    setGuardando(false);
    if (!error) {
      limpiarFormulario();
      cargarNotas();
    }
  }

  function editar(n: Nota) {
    setEditandoId(n.id);
    setTitulo(n.titulo);
    setContenido(n.contenido);
    setOrganismoId(n.organismo_id ?? "");
  }

  async function eliminar(id: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) setError("No se pudo eliminar la nota.");
    else {
      setNotas((n) => n.filter((x) => x.id !== id));
      if (editandoId === id) limpiarFormulario();
    }
  }

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        Las cuentas de usuario no están configuradas en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;
  if (!user) {
    return <RequiereSesion mensaje="Necesitas iniciar sesión para crear y ver tus notas." />;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="section-eyebrow">📝 Mi cuenta</p>
        <h1 className="font-display text-2xl font-bold">Mis notas</h1>
        <p className="text-sm text-mist-400">Apuntes personales, opcionalmente ligados a una ficha.</p>
      </div>

      <form onSubmit={guardarNota} className="lab-card flex flex-col gap-3 p-5">
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título de la nota"
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        />
        <select
          value={organismoId}
          onChange={(e) => setOrganismoId(e.target.value)}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        >
          <option value="">Sin relacionar a un microorganismo</option>
          {todosLosOrganismos.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombreCientifico}
            </option>
          ))}
        </select>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu apunte…"
          rows={4}
          className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
        />
        {error && <p className="text-xs text-alert">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={guardando}
            className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-60"
          >
            {guardando ? "Guardando…" : editandoId ? "Actualizar nota" : "Guardar nota"}
          </button>
          {editandoId && (
            <button
              type="button"
              onClick={limpiarFormulario}
              className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-sm hover:border-alert hover:text-alert"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {cargandoNotas ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : notas.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">Aún no tienes notas guardadas.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {notas.map((n) => {
            const organismo = n.organismo_id ? getOrganismoPorId(n.organismo_id) : null;
            return (
              <div key={n.id} className="lab-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display font-semibold">{n.titulo}</p>
                    {organismo && <p className="text-xs italic text-bio">{organismo.nombreCientifico}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2 text-xs">
                    <button onClick={() => editar(n)} className="focus-ring text-mist-400 hover:text-bio">
                      Editar
                    </button>
                    <button onClick={() => eliminar(n.id)} className="focus-ring text-mist-400 hover:text-alert">
                      Eliminar
                    </button>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-mist-300">{n.contenido}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
