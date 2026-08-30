"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { useFavoritosNube } from "@/lib/hooks/useFavoritosNube";
import { getOrganismoPorId } from "@/lib/data";
import OrganismCard from "@/components/OrganismCard";

export default function FavoritosPage() {
  const { user, cargando, habilitado } = useAuth();
  const { favoritos, cargando: cargandoFav, error } = useFavoritosNube();

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        Las cuentas de usuario no están configuradas en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;

  if (!user) {
    return <RequiereSesion mensaje="Necesitas iniciar sesión para guardar y ver tus favoritos." />;
  }

  const organismos = favoritos
    .map((f) => getOrganismoPorId(f.organismo_id))
    .filter((o): o is NonNullable<typeof o> => !!o);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">⭐ Mi cuenta</p>
        <h1 className="font-display text-2xl font-bold">Mis favoritos</h1>
        <p className="text-sm text-mist-400">Guardados en tu cuenta, disponibles desde cualquier dispositivo.</p>
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      {cargandoFav ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : organismos.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">
          Aún no tienes favoritos. Abre cualquier ficha y toca ☆ para guardarla aquí.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {organismos.map((o) => (
            <OrganismCard key={o.id} organismo={o} />
          ))}
        </div>
      )}

      <Link href="/bacterias" className="focus-ring w-fit text-sm text-bio hover:text-bio-glow">
        ← Seguir explorando
      </Link>
    </div>
  );
}
