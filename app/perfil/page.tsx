"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import { getOrganismoPorId } from "@/lib/data";

interface FilaHistorial {
  organismo_id: string;
  categoria: string;
  visitado_en: string;
}

export default function PerfilPage() {
  const { user, cargando, habilitado, cerrarSesion } = useAuth();
  const [historial, setHistorial] = useState<FilaHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabaseClient();
      if (!supabase || !user) {
        setCargandoHistorial(false);
        return;
      }
      const { data } = await supabase
        .from("history")
        .select("organismo_id, categoria, visitado_en")
        .order("visitado_en", { ascending: false })
        .limit(10);
      setHistorial(data ?? []);
      setCargandoHistorial(false);
    }
    cargar();
  }, [user]);

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        Las cuentas de usuario no están configuradas en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;

  if (!user) {
    return <RequiereSesion mensaje="Inicia sesión para ver tu perfil." />;
  }

  const username = (user.user_metadata?.username as string) || "Estudiante";
  const fechaRegistro = user.created_at
    ? new Date(user.created_at).toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <p className="section-eyebrow">👤 Mi perfil</p>
        <h1 className="font-display text-2xl font-bold">{username}</h1>
        <p className="text-sm text-mist-400">{user.email}</p>
      </div>

      <div className="lab-card grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-mist-400">Miembro desde</p>
          <p className="mt-0.5 text-sm">{fechaRegistro ?? "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-mist-400">Correo</p>
          <p className="mt-0.5 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/favoritos" className="lab-card focus-ring flex-1 p-4 text-center">
          <span className="text-xl">⭐</span>
          <p className="mt-1 text-sm font-medium">Mis favoritos</p>
        </Link>
        <Link href="/notas" className="lab-card focus-ring flex-1 p-4 text-center">
          <span className="text-xl">📝</span>
          <p className="mt-1 text-sm font-medium">Mis notas</p>
        </Link>
      </div>

      <section>
        <p className="section-eyebrow mb-3">🕘 Historial reciente</p>
        {cargandoHistorial ? (
          <p className="text-sm text-mist-400">Cargando…</p>
        ) : historial.length === 0 ? (
          <p className="text-sm text-mist-400">
            Aún no hay historial. Visita fichas de microorganismos para que aparezcan aquí.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {historial.map((h) => {
              const o = getOrganismoPorId(h.organismo_id);
              return (
                <Link
                  key={h.organismo_id}
                  href={`/${h.categoria}/${h.organismo_id}`}
                  className="lab-card focus-ring flex items-center justify-between p-3"
                >
                  <span className="text-sm italic">{o?.nombreCientifico ?? h.organismo_id}</span>
                  <span className="text-xs text-mist-400">
                    {new Date(h.visitado_en).toLocaleDateString("es")}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <button
        onClick={cerrarSesion}
        className="focus-ring mt-2 w-fit rounded-lg border border-alert/40 px-4 py-2 text-sm text-alert hover:bg-alert/10"
      >
        🚪 Cerrar sesión
      </button>
    </div>
  );
}
