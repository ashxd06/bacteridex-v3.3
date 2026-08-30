"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Bug,
  Dna,
  Sprout,
  Shell,
  FlaskConical,
  TestTube,
  ClipboardList,
  Scale,
  Fingerprint,
  Brain,
  Target,
  Layers,
  Trophy,
  Microscope,
  Wrench,
  BookOpen,
  User,
  X,
  Shield,
  Star,
  StickyNote,
  type LucideIcon
} from "lucide-react";
import { useAuth } from "./AuthProvider";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

const GRUPOS: NavGroup[] = [
  {
    id: "microorganismos",
    label: "Microorg.",
    icon: Microscope,
    items: [
      { href: "/bacterias", label: "Bacterias",  icon: Bug    },
      { href: "/virus",     label: "Virus",      icon: Dna    },
      { href: "/hongos",    label: "Hongos",     icon: Sprout },
      { href: "/parasitos", label: "Parásitos",  icon: Shell  },
    ]
  },
  {
    id: "herramientas",
    label: "Herramientas",
    icon: Wrench,
    items: [
      { href: "/pruebas",        label: "Pruebas",      icon: FlaskConical  },
      { href: "/medios",         label: "Medios",       icon: TestTube      },
      { href: "/procedimientos", label: "Procedim.",    icon: ClipboardList },
      { href: "/comparador",     label: "Comparar",     icon: Scale         },
      { href: "/identifica",     label: "Identifica",   icon: Fingerprint   },
    ]
  },
  {
    id: "study",
    label: "Study",
    icon: BookOpen,
    items: [
      { href: "/study",      label: "Study",      icon: Brain  },
      { href: "/quiz",       label: "Quiz",       icon: Target },
      { href: "/flashcards", label: "Flashcards", icon: Layers },
      { href: "/progreso",   label: "Progreso",   icon: Trophy },
    ]
  }
];

// ─── Sheet (panel desde abajo) ────────────────────────────────────────────────

function Sheet({ grupo, onCerrar }: { grupo: NavGroup; onCerrar: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  // Escape cierra el sheet
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onCerrar]);

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-base-950/60 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        ref={ref}
        role="dialog"
        aria-label={grupo.label}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-base-600 bg-base-900 pb-safe"
      >
        {/* Handle bar */}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="font-display text-sm font-semibold text-mist-100">
            {grupo.label}
          </span>
          <button
            onClick={onCerrar}
            className="focus-ring rounded-lg p-1.5 text-mist-400 hover:bg-base-800 hover:text-mist-100"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 px-4 pb-6">
          {grupo.items.map((item) => {
            const activo =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icono = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`focus-ring flex flex-col items-center gap-1.5 rounded-xl px-2 py-4 text-xs transition-colors ${
                  activo
                    ? "bg-bio/15 text-bio"
                    : "bg-base-800/50 text-mist-300 hover:bg-base-700 hover:text-mist-100"
                }`}
              >
                <Icono className="h-6 w-6" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ─── MobileNav ────────────────────────────────────────────────────────────────

export default function MobileNav() {
  const pathname = usePathname();
  const { user, esAdmin, habilitado, abrirModal } = useAuth();
  const [sheetAbierto, setSheetAbierto] = useState<string | null>(null);

  const grupoActivo = (grupo: NavGroup) =>
    grupo.items.some(
      (item) => pathname === item.href || pathname.startsWith(item.href + "/")
    );

  // Cierra el sheet automáticamente al cambiar de ruta
  useEffect(() => {
    setSheetAbierto(null);
  }, [pathname]);

  return (
    <>
      {/* Sheet activo */}
      {sheetAbierto && (() => {
        const grupo = GRUPOS.find((g) => g.id === sheetAbierto);
        return grupo ? (
          <Sheet grupo={grupo} onCerrar={() => setSheetAbierto(null)} />
        ) : null;
      })()}

      {/* Barra inferior */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-base-700 bg-base-900/95 backdrop-blur lg:hidden"
        aria-label="Navegación móvil"
      >
        <div className="mx-auto flex max-w-6xl justify-around px-2 py-1.5">

          {/* Inicio */}
          <Link
            href="/"
            className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] ${
              pathname === "/" ? "text-bio" : "text-mist-300"
            }`}
          >
            <Home className="h-5 w-5" aria-hidden="true" />
            Inicio
          </Link>

          {/* Grupos con sheet */}
          {GRUPOS.map((grupo) => {
            const activo = sheetAbierto === grupo.id || grupoActivo(grupo);
            const Icono = grupo.icon;
            return (
              <button
                key={grupo.id}
                onClick={() =>
                  setSheetAbierto((prev) => (prev === grupo.id ? null : grupo.id))
                }
                aria-expanded={sheetAbierto === grupo.id}
                className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] ${
                  activo ? "text-bio" : "text-mist-300"
                }`}
              >
                <Icono className="h-5 w-5" aria-hidden="true" />
                {grupo.label}
              </button>
            );
          })}

          {/* Usuario */}
          {habilitado &&
            (user ? (
              <button
                onClick={() =>
                  setSheetAbierto((prev) => (prev === "cuenta" ? null : "cuenta"))
                }
                aria-expanded={sheetAbierto === "cuenta"}
                className={`focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[11px] ${
                  sheetAbierto === "cuenta" || pathname === "/perfil" ? "text-bio" : "text-mist-300"
                }`}
              >
                <User className="h-5 w-5" aria-hidden="true" />
                Cuenta
              </button>
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

      {/* Sheet para Cuenta */}
      {sheetAbierto === "cuenta" && user && (
        <>
          <div
            className="fixed inset-0 z-40 bg-base-950/60 backdrop-blur-sm"
            onClick={() => setSheetAbierto(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-label="Menú de Cuenta"
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-base-600 bg-base-900 pb-safe"
          >
            <div className="flex items-center justify-between px-5 py-3">
              <span className="font-display text-sm font-semibold text-mist-100">
                Mi Cuenta
              </span>
              <button
                onClick={() => setSheetAbierto(null)}
                className="focus-ring rounded-lg p-1.5 text-mist-400 hover:bg-base-800 hover:text-mist-100"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col px-4 pb-6 gap-2">
              <Link href="/perfil" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-base-800">
                <User className="h-5 w-5 text-mist-300" /> Mi perfil
              </Link>
              <Link href="/favoritos" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-base-800">
                <Star className="h-5 w-5 text-mist-300" /> Mis favoritos
              </Link>
              <Link href="/notas" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-base-800">
                <StickyNote className="h-5 w-5 text-mist-300" /> Mis notas
              </Link>
              <Link href="/study" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-base-800">
                <Brain className="h-5 w-5 text-mist-300" /> BacteriDex Study
              </Link>
              {esAdmin && (
                <Link href="/admin" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gold hover:bg-base-800">
                  <Shield className="h-5 w-5" /> Panel Admin
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}


