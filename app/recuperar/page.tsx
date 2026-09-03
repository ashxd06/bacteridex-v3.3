"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

export default function RecuperarPage() {
  const { abrirModal, modalAbierto } = useAuth();

  useEffect(() => {
    // Si Supabase ya procesó el enlace de recuperación, el AuthProvider abre
    // el modal automáticamente (evento PASSWORD_RECOVERY). Esto es un respaldo
    // por si el usuario llega aquí manualmente.
    if (!modalAbierto) abrirModal("recuperar");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-3xl">🔑</p>
      <h1 className="mt-2 font-display text-xl font-bold">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-mist-400">
        Completa el formulario para restablecer tu contraseña.
      </p>
      <button
        onClick={() => abrirModal("recuperar")}
        className="focus-ring mt-4 rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
      >
        Abrir formulario
      </button>
    </div>
  );
}
