"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const items = [
  { href: "/", label: "Inicio", icon: "🏠" },
  { href: "/buscar", label: "Buscar", icon: "🔎" },
  { href: "/quiz", label: "Quiz", icon: "🎯" },
  { href: "/flashcards", label: "Cards", icon: "🧠" },
  { href: "/progreso", label: "Progreso", icon: "🏆" }
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user, habilitado, abrirModal } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-base-700 bg-base-900/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-6xl justify-between px-2 py-1.5">
        {items.map((item) => {
          const activo = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] ${
                activo ? "text-bio" : "text-mist-300"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        {habilitado &&
          (user ? (
            <Link
              href="/perfil"
              className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] ${
                pathname === "/perfil" ? "text-bio" : "text-mist-300"
              }`}
            >
              <span className="text-lg leading-none">👤</span>
              Cuenta
            </Link>
          ) : (
            <button
              onClick={() => abrirModal("login")}
              className="focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] text-mist-300"
            >
              <span className="text-lg leading-none">👤</span>
              Entrar
            </button>
          ))}
      </div>
    </nav>
  );
}
