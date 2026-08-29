"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import StudyDashboard from "@/components/study/StudyDashboard";
import type { ResultadoAnalisis } from "@/lib/study/types";

export default function StudyDocumentoPage({ params }: { params: { id: string } }) {
  const { user, cargando, habilitado } = useAuth();
  const [resultado, setResultado] = useState<ResultadoAnalisis | null>(null);
  const [filename, setFilename] = useState("");
  const [estado, setEstado] = useState<"cargando" | "listo" | "no-encontrado" | "procesando" | "error">("cargando");

  useEffect(() => {
    async function cargar() {
      const supabase = getSupabaseClient();
      if (!supabase || !user) return;

      const { data: doc } = await supabase
        .from("study_documents")
        .select("filename, status, error_mensaje")
        .eq("id", params.id)
        .maybeSingle();

      if (!doc) {
        setEstado("no-encontrado");
        return;
      }
      setFilename(doc.filename);

      if (doc.status === "analizando" || doc.status === "subiendo") {
        setEstado("procesando");
        return;
      }
      if (doc.status === "error") {
        setEstado("error");
        return;
      }

      const { data: contenido } = await supabase
        .from("study_content")
        .select("content")
        .eq("document_id", params.id)
        .eq("section", "material_completo")
        .maybeSingle();

      if (!contenido) {
        setEstado("no-encontrado");
        return;
      }

      try {
        setResultado(JSON.parse(contenido.content));
        setEstado("listo");
      } catch {
        setEstado("error");
      }
    }
    if (user) cargar();
  }, [user, params.id]);

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        BacteriDex Study no está configurado en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;
  if (!user) return <RequiereSesion mensaje="Inicia sesión para ver este material de estudio." />;

  if (estado === "cargando") return <p className="text-sm text-mist-400">Cargando…</p>;

  if (estado === "no-encontrado") {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        No encontramos este documento, o no tienes acceso a él.
        <div className="mt-3">
          <Link href="/study" className="focus-ring text-bio hover:text-bio-glow">← Volver a Study</Link>
        </div>
      </div>
    );
  }

  if (estado === "procesando") {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        Este documento todavía se está analizando. Vuelve en un momento.
      </div>
    );
  }

  if (estado === "error" || !resultado) {
    return (
      <div className="lab-card p-8 text-center text-alert">
        Hubo un problema al procesar este documento. Puedes eliminarlo desde "Mis documentos" e
        intentar subirlo de nuevo.
      </div>
    );
  }

  return <StudyDashboard resultado={resultado} filename={filename} documentId={params.id} />;
}
