"use client";

import Link from "next/link";
import { Bug, ClipboardList, FileText, Microscope, Brain, Users, Settings, Calculator, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";

const SECCIONES: { icon: LucideIcon; titulo: string; descripcion: string; href?: string }[] = [
  {
    icon: Bug,
    titulo: "Microorganismos",
    descripcion: "Crear, editar, archivar y eliminar bacterias, virus, hongos y parásitos.",
    href: "/admin/microorganismos"
  },
  {
    icon: FileText,
    titulo: "Análisis clínicos",
    descripcion: "Crear, editar, archivar y eliminar análisis de laboratorio.",
    href: "/admin/analisis"
  },
  {
    icon: FileText,
    titulo: "Insertos",
    descripcion: "Subir, archivar y eliminar insertos de fabricante (PDF).",
    href: "/admin/insertos"
  },
  {
    icon: ClipboardList,
    titulo: "Procedimientos",
    descripcion: "Crear, editar, archivar y eliminar procedimientos de laboratorio.",
    href: "/admin/procedimientos"
  },
  {
    icon: Calculator,
    titulo: "Calculadoras",
    descripcion: "Crear calculadoras con variables y fórmula, opcionalmente ligadas a un análisis.",
    href: "/admin/calculadoras"
  },
  {
    icon: Microscope,
    titulo: "Microscopía",
    descripcion: "Subir y categorizar imágenes de microscopía. (Próximamente)"
  },
  {
    icon: Brain,
    titulo: "Study",
    descripcion: "Gestionar contenido público de BacteriDex Study. (Próximamente)"
  },
  {
    icon: Settings,
    titulo: "Configuración del laboratorio",
    descripcion: "Nombre del laboratorio, profesional, firma y sello usados en /resultados.",
    href: "/admin/config"
  },
  {
    icon: Users,
    titulo: "Usuarios",
    descripcion: "Ver la lista de cuentas registradas y su rol.",
    href: "/admin/usuarios"
  }
];

export default function AdminPage() {
  const { user, perfil, esAdmin, cargando, habilitado } = useAuth();

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        Las cuentas de usuario no están configuradas en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;

  if (!user) {
    return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  }

  if (!esAdmin) {
    return (
      <div className="lab-card mx-auto max-w-md p-8 text-center">
        <p className="text-3xl">🔒</p>
        <h1 className="mt-2 font-display text-lg font-bold">Acceso restringido</h1>
        <p className="mt-2 text-sm text-mist-400">
          Esta sección es solo para administradores. Tu cuenta ({perfil?.username ?? user.email})
          no tiene permisos de administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="section-eyebrow">👑 Panel de administración</p>
        <h1 className="font-display text-2xl font-bold">Hola, {perfil?.username}</h1>
        <p className="text-sm text-mist-400">
          Ya puedes crear, editar, archivar y eliminar microorganismos, análisis clínicos y
          procedimientos. Microscopía, calculadoras y registros llegan en próximas fases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((s) => {
          const Icono = s.icon;
          const contenido = (
            <div className={`lab-card flex flex-col gap-2 p-5 ${!s.href ? "opacity-60" : ""}`}>
              <Icono className="h-6 w-6 text-bio" aria-hidden="true" />
              <p className="font-display font-semibold">{s.titulo}</p>
              <p className="text-xs text-mist-400">{s.descripcion}</p>
            </div>
          );
          return s.href ? (
            <Link key={s.titulo} href={s.href} className="focus-ring">
              {contenido}
            </Link>
          ) : (
            <div key={s.titulo}>{contenido}</div>
          );
        })}
      </div>
    </div>
  );
}
