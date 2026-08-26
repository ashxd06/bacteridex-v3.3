"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/bacterias", label: "🦠 Bacterias" },
  { href: "/virus", label: "🧬 Virus" },
  { href: "/hongos", label: "🍄 Hongos" },
  { href: "/parasitos", label: "🪱 Parásitos" },
  { href: "/pruebas", label: "🧪 Pruebas" },
  { href: "/medios", label: "🧫 Medios" },
  { href: "/procedimientos", label: "📋 Procedimientos" },
  { href: "/comparador", label: "⚖️ Comparar" },
  { href: "/identifica", label: "🕵️ Identifica" },
  { href: "/quiz", label: "🎯 Quiz" },
  { href: "/flashcards", label: "🧠 Flashcards" },
  { href: "/progreso", label: "🏆 Progreso" }
];

export default function Navbar() {
  const pathname = usePathname();
  const { tema, alternar } = useTheme();
  const { user, habilitado, abrirModal, cerrarSesion } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-base-700/80 bg-base-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-bio/15 text-bio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="9" cy="10" r="1.4" fill="currentColor" />
              <circle cx="14" cy="13" r="1.8" fill="currentColor" />
              <circle cx="13" cy="8" r="1" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Bacteri<span className="text-bio">Dex</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {enlaces.map((e) => {
            const activo = pathname === e.href;
            return (
              <Link
                key={e.href}
                href={e.href}
                className={`focus-ring rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                  activo
                    ? "bg-bio/15 text-bio"
                    : "text-mist-300 hover:bg-base-800 hover:text-mist-100"
                }`}
              >
                {e.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/buscar"
            className="focus-ring chip hover:border-bio hover:text-bio"
            aria-label="Buscar"
          >
            🔎 <span className="hidden sm:inline">Buscar</span>
          </Link>
          <button
            onClick={alternar}
            className="focus-ring chip hover:border-bio hover:text-bio"
            aria-label="Cambiar tema"
          >
            {tema === "dark" ? "🌙" : "☀️"}
          </button>

          {habilitado && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setMenuAbierto((v) => !v)}
                    className="focus-ring chip hover:border-bio hover:text-bio"
                  >
                    👤 <span className="hidden sm:inline">{(user.user_metadata?.username as string) || "Mi cuenta"}</span>
                  </button>
                  {menuAbierto && (
                    <div
                      className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-base-600 bg-base-800 shadow-xl"
                      onMouseLeave={() => setMenuAbierto(false)}
                    >
                      <Link href="/perfil" onClick={() => setMenuAbierto(false)} className="block px-4 py-2.5 text-sm hover:bg-base-700">
                        👤 Mi perfil
                      </Link>
                      <Link href="/favoritos" onClick={() => setMenuAbierto(false)} className="block px-4 py-2.5 text-sm hover:bg-base-700">
                        ⭐ Mis favoritos
                      </Link>
                      <Link href="/notas" onClick={() => setMenuAbierto(false)} className="block px-4 py-2.5 text-sm hover:bg-base-700">
                        📝 Mis notas
                      </Link>
                      <button
                        onClick={() => {
                          setMenuAbierto(false);
                          cerrarSesion();
                        }}
                        className="block w-full border-t border-base-700 px-4 py-2.5 text-left text-sm text-alert hover:bg-base-700"
                      >
                        🚪 Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden gap-2 sm:flex">
                  <button onClick={() => abrirModal("login")} className="focus-ring chip hover:border-bio hover:text-bio">
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => abrirModal("registro")}
                    className="focus-ring rounded-full bg-bio px-3 py-1 text-xs font-medium text-base-950 hover:bg-bio-glow"
                  >
                    Crear cuenta
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
