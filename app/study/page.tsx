"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import RequiereSesion from "@/components/RequiereSesion";
import { getSupabaseClient } from "@/lib/supabase/client";
import PDFUploader from "@/components/study/PDFUploader";
import type { StudyDocumento } from "@/lib/study/types";

export default function StudyPage() {
  const { user, cargando, habilitado } = useAuth();
  const [documentos, setDocumentos] = useState<StudyDocumento[]>([]);
  const [cargandoDocs, setCargandoDocs] = useState(true);

  async function cargar() {
    const supabase = getSupabaseClient();
    if (!supabase || !user) return;
    setCargandoDocs(true);
    const { data } = await supabase
      .from("study_documents")
      .select("id, filename, file_url, file_size, page_count, status, error_mensaje, created_at")
      .order("created_at", { ascending: false });
    setDocumentos(data ?? []);
    setCargandoDocs(false);
  }

  useEffect(() => {
    if (user) cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este documento y su material de estudio? Esta acción no se puede deshacer.")) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.from("study_documents").delete().eq("id", id);
    setDocumentos((docs) => docs.filter((d) => d.id !== id));
  }

  if (!habilitado) {
    return (
      <div className="lab-card p-8 text-center text-mist-400">
        BacteriDex Study necesita cuentas de usuario, y no están configuradas en este despliegue todavía.
      </div>
    );
  }

  if (cargando) return null;
  if (!user) {
    return <RequiereSesion mensaje="Inicia sesión para usar BacteriDex Study y guardar tu material generado." />;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="section-eyebrow">🧠 BacteriDex Study</p>
        <h1 className="font-display text-2xl font-bold">Convierte tus PDFs en material de estudio inteligente</h1>
        <p className="text-sm text-mist-400">
          Sube apuntes, diapositivas, libros o separatas de Laboratorio Clínico y genera resúmenes,
          conceptos, flashcards y exámenes automáticamente.
        </p>
      </div>

      <PDFUploader />

      <section>
        <p className="section-eyebrow mb-3">📂 Mis documentos</p>
        {cargandoDocs ? (
          <p className="text-sm text-mist-400">Cargando…</p>
        ) : documentos.length === 0 ? (
          <p className="text-sm text-mist-400">Aún no has analizado ningún PDF.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {documentos.map((d) => (
              <div key={d.id} className="lab-card flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.filename}</p>
                  <p className="text-xs text-mist-400">
                    {new Date(d.created_at).toLocaleDateString("es")} ·{" "}
                    {(d.file_size / (1024 * 1024)).toFixed(1)} MB
                    {d.page_count ? ` · ${d.page_count} páginas` : ""} ·{" "}
                    <EstadoBadge status={d.status} />
                  </p>
                  {d.status === "error" && d.error_mensaje && (
                    <p className="mt-0.5 text-xs text-alert">{d.error_mensaje}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  {d.status === "completado" && (
                    <Link href={`/study/${d.id}`} className="focus-ring chip hover:border-bio hover:text-bio">
                      Abrir
                    </Link>
                  )}
                  <button onClick={() => eliminar(d.id)} className="focus-ring chip hover:border-alert hover:text-alert">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EstadoBadge({ status }: { status: StudyDocumento["status"] }) {
  const label =
    status === "completado" ? "✅ Listo" : status === "error" ? "⚠️ Error" : status === "analizando" ? "🧠 Analizando…" : "Subiendo…";
  return <span>{label}</span>;
}
