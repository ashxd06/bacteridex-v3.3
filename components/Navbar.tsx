"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Bug, Dna, Sprout, Shell, FlaskConical, TestTube, TestTubes,
  ClipboardList, Scale, Fingerprint, Brain, Target, Layers, Trophy,
  Search, Sun, Moon, User, Star, StickyNote, ShieldCheck, LogOut,
  ChevronDown, Menu, X, FileText
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "./AuthProvider";

const categorias = [
  {
    nombre: "Microbiología",
    enlaces: [
      { href: "/bacterias", label: "Bacterias", icon: Bug },
      { href: "/virus", label: "Virus", icon: Dna },
      { href: "/hongos", label: "Hongos", icon: Sprout },
      { href: "/parasitos", label: "Parásitos", icon: Shell },
    ]
  },
  {
    nombre: "Laboratorio",
    enlaces: [
      { href: "/analisis", label: "Análisis clínicos", icon: TestTubes },
      { href: "/pruebas", label: "Pruebas de laboratorio", icon: FlaskConical },
      { href: "/medios", label: "Medios de cultivo", icon: TestTube },
      { href: "/procedimientos", label: "Procedimientos", icon: ClipboardList },
      { href: "/resultados", label: "Resultados de laboratorio", icon: FileText },
    ]
  },
  {
    nombre: "Herramientas",
    enlaces: [
      { href: "/comparador", label: "Comparador", icon: Scale },
      { href: "/identifica", label: "Identifica el microorganismo", icon: Fingerprint },
    ]
  },
  {
    nombre: "Estudio",
    enlaces: [
      { href: "/study", label: "BacteriDex Study", icon: Brain },
      { href: "/quiz", label: "Quiz", icon: Target },
      { href: "/flashcards", label: "Flashcards", icon: Layers },
      { href: "/progreso", label: "Progreso", icon: Trophy },
    ]
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const { tema, alternar } = useTheme();
  const { user, habilitado, abrirModal, cerrarSesion, esAdmin } = useAuth();
  
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  
  const [dropdownActivo, setDropdownActivo] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown si se hace click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setDropdownActivo(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-base-700/80 bg-base-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-2 ml-1 sm:ml-2" onClick={() => setMenuMovilAbierto(false)}>
            <img src="/brand/bacteridex-logo.png" alt="BacteriDex" className="h-12 sm:h-14 w-auto object-contain dark:hidden" />
            <img src="/brand/bacteridex-logo-dark.png" alt="BacteriDex" className="h-12 sm:h-14 w-auto object-contain hidden dark:block" />
          </Link>

          {/* Navegación Desktop */}
          <nav className="hidden lg:flex items-center gap-2" ref={navRef}>
            <Link
              href="/"
              className={`focus-ring px-3 py-2 text-sm font-medium transition-colors hover:text-bio ${pathname === "/" ? "text-bio" : "text-mist-300"}`}
            >
              Inicio
            </Link>
            
            {categorias.map((cat) => {
              const isActiveCategory = cat.enlaces.some(link => pathname.startsWith(link.href));
              const isOpen = dropdownActivo === cat.nombre;
              
              return (
                <div key={cat.nombre} className="relative">
                  <button
                    onClick={() => setDropdownActivo(isOpen ? null : cat.nombre)}
                    className={`focus-ring flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors hover:text-bio ${isActiveCategory ? "text-bio" : "text-mist-300"}`}
                  >
                    {cat.nombre}
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {isOpen && (
                    <div className="absolute left-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-base-600 bg-base-800 shadow-2xl">
                      <div className="flex flex-col py-2">
                        {cat.enlaces.map((link) => {
                          const Icono = link.icon;
                          const isLinkActive = pathname === link.href;
                          return (
                            <Link
                              key={link.href}
                              href={link.href}
                              onClick={() => setDropdownActivo(null)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-base-700 ${isLinkActive ? "bg-base-700/50 text-bio" : "text-mist-200"}`}
                            >
                              <Icono className={`h-4 w-4 ${isLinkActive ? "text-bio" : "text-mist-400"}`} />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ai"
            className="focus-ring chip hidden sm:flex hover:border-bio hover:text-bio"
            aria-label="BacteriDex AI"
          >
            🧠 AI
          </Link>
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
            {tema === "dark" ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
          </button>

          {habilitado && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => {
                      setMenuUsuarioAbierto((v) => !v);
                      setDropdownActivo(null);
                    }}
                    className="focus-ring chip hover:border-bio hover:text-bio hidden sm:flex"
                  >
                    <User className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{(user.user_metadata?.username as string) || "Mi cuenta"}</span>
                  </button>
                  {menuUsuarioAbierto && (
                    <div
                      className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-base-600 bg-base-800 shadow-2xl hidden sm:block"
                      onMouseLeave={() => setMenuUsuarioAbierto(false)}
                    >
                      <Link href="/perfil" onClick={() => setMenuUsuarioAbierto(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-700">
                        <User className="h-4 w-4 text-mist-400" /> Mi perfil
                      </Link>
                      <Link href="/favoritos" onClick={() => setMenuUsuarioAbierto(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-700">
                        <Star className="h-4 w-4 text-mist-400" /> Mis favoritos
                      </Link>
                      <Link href="/notas" onClick={() => setMenuUsuarioAbierto(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-700">
                        <StickyNote className="h-4 w-4 text-mist-400" /> Mis notas
                      </Link>
                      <Link href="/study" onClick={() => setMenuUsuarioAbierto(false)} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-base-700">
                        <Brain className="h-4 w-4 text-mist-400" /> BacteriDex Study
                      </Link>
                      {esAdmin && (
                        <Link href="/admin" onClick={() => setMenuUsuarioAbierto(false)} className="flex items-center gap-3 border-t border-base-700 px-4 py-3 text-sm text-bio hover:bg-base-700">
                          <ShieldCheck className="h-4 w-4" /> Panel Admin
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setMenuUsuarioAbierto(false);
                          cerrarSesion();
                        }}
                        className="flex w-full items-center gap-3 border-t border-base-700 px-4 py-3 text-left text-sm text-alert hover:bg-base-700"
                      >
                        <LogOut className="h-4 w-4" /> Cerrar sesión
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

          {/* Botón de Menú Móvil */}
          <button 
            className="focus-ring chip lg:hidden hover:text-bio hover:border-bio"
            onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
          >
            {menuMovilAbierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Navegación Móvil (Panel lateral / acordeón) */}
      {menuMovilAbierto && (
        <div className="lg:hidden fixed inset-0 top-[60px] z-50 bg-base-950 overflow-y-auto pb-24">
          <div className="flex flex-col p-4 gap-2">
            
            <Link
              href="/"
              onClick={() => setMenuMovilAbierto(false)}
              className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium ${pathname === "/" ? "bg-bio/10 text-bio" : "text-mist-200"}`}
            >
              <Home className="h-5 w-5" /> Inicio
            </Link>

            <Link
              href="/ai"
              onClick={() => setMenuMovilAbierto(false)}
              className={`flex items-center gap-3 rounded-lg p-3 text-sm font-medium ${pathname === "/ai" ? "bg-bio/10 text-bio" : "text-mist-200"}`}
            >
              <span className="text-xl leading-none">🧠</span> BacteriDex AI
            </Link>

            {categorias.map(cat => (
              <div key={cat.nombre} className="flex flex-col border-b border-base-800 pb-2 mb-2">
                <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-mist-500">
                  {cat.nombre}
                </div>
                {cat.enlaces.map(link => {
                  const Icono = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuMovilAbierto(false)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-bio/10 text-bio font-medium" : "text-mist-200 hover:bg-base-800"}`}
                    >
                      <Icono className={`h-5 w-5 ${isActive ? "text-bio" : "text-mist-400"}`} /> {link.label}
                    </Link>
                  )
                })}
              </div>
            ))}

            {/* Opciones de cuenta móvil */}
            <div className="flex flex-col pt-4 mt-2 border-t border-base-700">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-mist-500">Mi Cuenta</div>
              {user ? (
                <>
                  <Link href="/perfil" onClick={() => setMenuMovilAbierto(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mist-200 hover:bg-base-800">
                    <User className="h-5 w-5 text-mist-400" /> Mi perfil
                  </Link>
                  <Link href="/favoritos" onClick={() => setMenuMovilAbierto(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mist-200 hover:bg-base-800">
                    <Star className="h-5 w-5 text-mist-400" /> Mis favoritos
                  </Link>
                  <Link href="/notas" onClick={() => setMenuMovilAbierto(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-mist-200 hover:bg-base-800">
                    <StickyNote className="h-5 w-5 text-mist-400" /> Mis notas
                  </Link>
                  {esAdmin && (
                    <Link href="/admin" onClick={() => setMenuMovilAbierto(false)} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-bio hover:bg-base-800">
                      <ShieldCheck className="h-5 w-5" /> Panel Admin
                    </Link>
                  )}
                  <button onClick={() => { setMenuMovilAbierto(false); cerrarSesion(); }} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-alert hover:bg-base-800 text-left">
                    <LogOut className="h-5 w-5" /> Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 p-2">
                  <button onClick={() => { setMenuMovilAbierto(false); abrirModal("login"); }} className="w-full rounded-lg border border-base-600 py-2.5 text-sm font-medium hover:bg-base-800">
                    Iniciar sesión
                  </button>
                  <button onClick={() => { setMenuMovilAbierto(false); abrirModal("registro"); }} className="w-full rounded-lg bg-bio py-2.5 text-sm font-medium text-base-950 hover:bg-bio-glow">
                    Crear cuenta
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
