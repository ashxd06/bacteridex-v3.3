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
  Search,
  Sun,
  Moon,
  User,
  Star,
  StickyNote,
  LogOut,
  ChevronDown,
  Microscope,
  Wrench,
  BookOpen,
  type LucideIcon
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

// ─── Estructura de datos de navegación ────────────────────────────────────────

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

// Grupos con dropdown
const GRUPOS: NavGroup[] = [
  {
    id: "microorganismos",
    label: "Microorganismos",
    icon: Microscope,
    items: [
      { href: "/bacterias",  label: "Bacterias",  icon: Bug         },
      { href: "/virus",      label: "Virus",      icon: Dna         },
      { href: "/hongos",     label: "Hongos",     icon: Sprout      },
      { href: "/parasitos",  label: "Parásitos",  icon: Shell       },
    ]
  },
  {
    id: "herramientas",
    label: "Herramientas",
    icon: Wrench,
    items: [
      { href: "/pruebas",        label: "Pruebas",          icon: FlaskConical   },
      { href: "/medios",         label: "Medios de cultivo", icon: TestTube       },
      { href: "/procedimientos", label: "Procedimientos",   icon: ClipboardList  },
      { href: "/comparador",     label: "Comparar",         icon: Scale          },
      { href: "/identifica",     label: "Identifica",       icon: Fingerprint    },
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

// ─── Hook: detectar click fuera de un elemento ────────────────────────────────

function useClickFuera(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

// ─── Componente: un dropdown del nav ─────────────────────────────────────────

function NavDropdown({ grupo, abierto, onToggle, onCerrar }: {
  grupo: NavGroup;
  abierto: boolean;
  onToggle: () => void;
  onCerrar: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const Icono = grupo.icon;

  useClickFuera(ref, onCerrar);

  // El botón se resalta si alguna ruta hija está activa
  const tieneHijaActiva = grupo.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  // Escape cierra el dropdown
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onCerrar(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [abierto, onCerrar]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        aria-expanded={abierto}
        aria-haspopup="true"
        className={`focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
          tieneHijaActiva || abierto
            ? "bg-bio/15 text-bio"
            : "text-mist-300 hover:bg-base-800 hover:text-mist-100"
        }`}
      >
        <Icono className="h-4 w-4" aria-hidden="true" />
        {grupo.label}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-150 ${abierto ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {abierto && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-base-600 bg-base-800 shadow-xl"
        >
          {grupo.items.map((item) => {
            const activo = pathname === item.href || pathname.startsWith(item.href + "/");
            const ItemIcono = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                onClick={(e) => {
                  if (e.ctrlKey || e.metaKey || e.button !== 0) return;
                  e.preventDefault();
                  onCerrar();
                  router.push(item.href);
                }}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${
                  activo
                    ? "bg-bio/10 text-bio"
                    : "text-mist-300 hover:bg-base-700 hover:text-mist-100"
                }`}
              >
                <ItemIcono className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Navbar principal ─────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { tema, alternar } = useTheme();
  const { user, habilitado, abrirModal, cerrarSesion } = useAuth();

  // Un solo estado para saber qué dropdown está abierto (null = ninguno)
  const [dropdownAbierto, setDropdownAbierto] = useState<string | null>(null);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const refUsuario = useRef<HTMLDivElement>(null);

  useClickFuera(refUsuario, () => setMenuUsuario(false));

  function toggleDropdown(id: string) {
    setDropdownAbierto((prev) => (prev === id ? null : id));
    setMenuUsuario(false);
  }

  // Análisis clínicos — enlace directo (sin dropdown por ahora)
  const activoAnalisis =
    pathname === "/analisis-clinicos" || pathname.startsWith("/analisis-clinicos/");

  const handleUserNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (e.ctrlKey || e.metaKey || e.button !== 0) return;
    e.preventDefault();
    setMenuUsuario(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-base-700/80 bg-base-900/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-bio/15 text-bio">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="9"  cy="10" r="1.4" fill="currentColor" />
              <circle cx="14" cy="13" r="1.8" fill="currentColor" />
              <circle cx="13" cy="8"  r="1"   fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Bacteri<span className="text-bio">Dex</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegación principal">

          {/* Inicio */}
          <Link
            href="/"
            className={`focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
              pathname === "/"
                ? "bg-bio/15 text-bio"
                : "text-mist-300 hover:bg-base-800 hover:text-mist-100"
            }`}
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Inicio
          </Link>

          {/* Dropdowns */}
          {GRUPOS.map((grupo) => (
            <NavDropdown
              key={grupo.id}
              grupo={grupo}
              abierto={dropdownAbierto === grupo.id}
              onToggle={() => toggleDropdown(grupo.id)}
              onCerrar={() => setDropdownAbierto(null)}
            />
          ))}

          {/* Análisis Clínicos — directo */}
          <Link
            href="/analisis-clinicos"
            className={`focus-ring flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
              activoAnalisis
                ? "bg-bio/15 text-bio"
                : "text-mist-300 hover:bg-base-800 hover:text-mist-100"
            }`}
          >
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            Análisis Clínicos
          </Link>
        </nav>

        {/* Acciones derechas */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/buscar"
            className="focus-ring chip hover:border-cian hover:text-cian"
            aria-label="Buscar"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Buscar</span>
          </Link>

          <button
            onClick={alternar}
            className="focus-ring chip hover:border-bio hover:text-bio"
            aria-label="Cambiar tema"
          >
            {tema === "dark"
              ? <Moon className="h-4 w-4" aria-hidden="true" />
              : <Sun  className="h-4 w-4" aria-hidden="true" />}
          </button>

          {habilitado && (
            <>
              {user ? (
                <div ref={refUsuario} className="relative">
                  <button
                    onClick={() => { setMenuUsuario((v) => !v); setDropdownAbierto(null); }}
                    className="focus-ring chip hover:border-bio hover:text-bio"
                    aria-expanded={menuUsuario}
                    aria-haspopup="true"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">
                      {(user.user_metadata?.username as string) || "Mi cuenta"}
                    </span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-150 ${menuUsuario ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>

                  {menuUsuario && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-base-600 bg-base-800 shadow-xl"
                    >
                      <Link
                        href="/perfil"
                        role="menuitem"
                        onClick={(e) => handleUserNav(e, "/perfil")}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-base-700"
                      >
                        <User className="h-4 w-4" aria-hidden="true" /> Mi perfil
                      </Link>
                      <Link
                        href="/favoritos"
                        role="menuitem"
                        onClick={(e) => handleUserNav(e, "/favoritos")}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-base-700"
                      >
                        <Star className="h-4 w-4" aria-hidden="true" /> Mis favoritos
                      </Link>
                      <Link
                        href="/notas"
                        role="menuitem"
                        onClick={(e) => handleUserNav(e, "/notas")}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-base-700"
                      >
                        <StickyNote className="h-4 w-4" aria-hidden="true" /> Mis notas
                      </Link>
                      <Link
                        href="/study"
                        role="menuitem"
                        onClick={(e) => handleUserNav(e, "/study")}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-base-700"
                      >
                        <Brain className="h-4 w-4" aria-hidden="true" /> BacteriDex Study
                      </Link>
                      <button
                        role="menuitem"
                        onClick={() => { setMenuUsuario(false); cerrarSesion(); }}
                        className="flex w-full items-center gap-2 border-t border-base-700 px-4 py-2.5 text-left text-sm text-alert hover:bg-base-700"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden gap-2 sm:flex">
                  <button
                    onClick={() => abrirModal("login")}
                    className="focus-ring chip hover:border-bio hover:text-bio"
                  >
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

