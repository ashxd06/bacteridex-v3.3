"use client";

import Link from "next/link";
import { Bug, ClipboardList, FileText, Microscope, Brain, Users, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";

const SECCIONES: { icon: LucideIcon; titulo: string; descripcion: string; href?: string }[] = [
  {
    icon: Bug,
    titulo: "Microorganismos",
    descripcion: "Crear, editar y archivar bacterias, virus, hongos y parásitos. (Próximamente)"
  },
  {
    icon: FileText,
    titulo: "Análisis clínicos",
    descripcion: "Consulta la biblioteca de análisis. La edición desde el panel llega en una fase futura.",
    href: "/analisis"
  },
  {
    icon: ClipboardList,
    titulo: "Procedimientos",
    descripcion: "Gestionar la biblioteca de procedimientos de laboratorio. (Próximamente)"
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
    icon: ClipboardList,
    titulo: "Laboratorio Clínico",
    descripcion: "Configura la firma, sello y profesional responsable para los informes PDF.",
    href: "/admin/laboratorio"
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
          Este panel se irá ampliando por fases. Por ahora puedes ver la lista de usuarios; la
          gestión de contenido (microorganismos, análisis, procedimientos, etc.) llega en próximas
          actualizaciones.
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
