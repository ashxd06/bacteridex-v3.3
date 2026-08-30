"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";

interface UsuarioFila {
  id: string;
  username: string;
  role: "user" | "admin";
  created_at: string;
}

export default function AdminUsuariosPage() {
  const { user, esAdmin, cargando, habilitado } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioFila[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabaseClient();
      if (!supabase || !esAdmin) return;
      const { data: sesion } = await supabase.auth.getSession();
      const token = sesion.session?.access_token;
      const respuesta = await fetch("/api/admin/usuarios", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await respuesta.json();
      if (!respuesta.ok) {
        setError(json?.error || "No se pudo cargar la lista de usuarios.");
      } else {
        setUsuarios(json.usuarios ?? []);
      }
      setCargandoLista(false);
    }
    if (esAdmin) cargar();
  }, [esAdmin]);

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
    <div className="flex flex-col gap-6">
      <Link href="/admin" className="section-eyebrow hover:text-bio-glow">
        ← Panel de administración
      </Link>
      <div>
        <p className="section-eyebrow">👥 Usuarios</p>
        <h1 className="font-display text-2xl font-bold">Cuentas registradas</h1>
        <p className="text-sm text-mist-400">
          Vista de solo lectura por ahora. Para cambiar el rol de una cuenta, hazlo desde el SQL
          Editor de Supabase (ver <code>supabase/schema.sql</code>).
        </p>
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      {cargandoLista ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-base-600">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-base-800 text-mist-400">
              <tr>
                <th className="px-4 py-2 font-medium">Usuario</th>
                <th className="px-4 py-2 font-medium">Rol</th>
                <th className="px-4 py-2 font-medium">Registrado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-t border-base-700">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">
                    <span className={`chip ${u.role === "admin" ? "border-bio text-bio" : ""}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-2 text-mist-400">
                    {new Date(u.created_at).toLocaleDateString("es")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
