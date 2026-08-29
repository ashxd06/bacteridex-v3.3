"use client";

import { useAuth } from "./AuthProvider";

export default function RequiereSesion({ mensaje }: { mensaje: string }) {
  const { abrirModal } = useAuth();
  return (
    <div className="lab-card flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-3xl">🔒</p>
      <p className="text-sm text-mist-300">{mensaje}</p>
      <div className="flex gap-2">
        <button
          onClick={() => abrirModal("login")}
          className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
        >
          Iniciar sesión
        </button>
        <button
          onClick={() => abrirModal("registro")}
          className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-sm hover:border-bio hover:text-bio"
        >
          Crear cuenta
        </button>
      </div>
    </div>
  );
}
