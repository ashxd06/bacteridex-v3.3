"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Target, Layers, Trophy, User, type LucideIcon } from "lucide-react";
import { useAuth } from "./AuthProvider";

const items: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/quiz", label: "Quiz", icon: Target },
  { href: "/flashcards", label: "Cards", icon: Layers },
  { href: "/progreso", label: "Progreso", icon: Trophy }
];

export default function MobileNav() {
  const pathname = usePathname();
  const { user, habilitado, abrirModal } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-base-700 bg-base-900/95 backdrop-blur lg:hidden print:hidden">
      <div className="mx-auto flex max-w-6xl justify-between px-2 py-1.5">
        {items.map((item) => {
          const activo = pathname === item.href;
          const Icono = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] ${
                activo ? "text-bio" : item.href === "/buscar" ? "text-cian" : "text-mist-300"
              }`}
            >
              <Icono className="h-5 w-5" aria-hidden="true" />
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
              <User className="h-5 w-5" aria-hidden="true" />
              Cuenta
            </Link>
          ) : (
            <button
              onClick={() => abrirModal("login")}
              className="focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] text-mist-300"
            >
              <User className="h-5 w-5" aria-hidden="true" />
              Entrar
            </button>
          ))}
      </div>
    </nav>
  );
}
