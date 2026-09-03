"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ProveedorId } from "@/lib/study/ai/tipos";
import { NOMBRE_PROVEEDOR } from "@/lib/study/ai/tipos";

const TAMANO_MAXIMO_MB = 32; // límite de documentos PDF de la API de Claude
type Estado = "inicial" | "subiendo" | "analizando" | "completado" | "error";

const MENSAJES_ANALIZANDO = [
  "Extrayendo texto e imágenes…",
  "Analizando el contenido con IA…",
  "Organizando el material de estudio…",
  "Generando conceptos, flashcards y preguntas…"
];

const PROVEEDORES: { id: ProveedorId; label: string; emoji: string; recomendado?: boolean }[] = [
  { id: "claude", label: "Claude", emoji: "⭐", recomendado: true },
  { id: "gemini", label: "Gemini", emoji: "⚡" },
  { id: "openai", label: "OpenAI", emoji: "🧠" }
];

export default function PDFUploader() {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [proveedor, setProveedor] = useState<ProveedorId>("claude");
  const [estado, setEstado] = useState<Estado>("inicial");
  const [mensaje, setMensaje] = useState(MENSAJES_ANALIZANDO[0]);
  const [progreso, setProgreso] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorProveedor, setErrorProveedor] = useState<ProveedorId | null>(null);
  const [arrastrando, setArrastrando] = useState(false);

  function validar(f: File): string | null {
    if (f.type !== "application/pdf") return "Solo se aceptan archivos PDF.";
    if (f.size > TAMANO_MAXIMO_MB * 1024 * 1024) {
      return `El PDF supera el tamaño máximo permitido (${TAMANO_MAXIMO_MB} MB).`;
    }
    return null;
  }

  function elegirArchivo(f: File) {
    const problema = validar(f);
    if (problema) {
      setError(problema);
      setArchivo(null);
      return;
    }
    setError(null);
    setArchivo(f);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    const f = e.dataTransfer.files?.[0];
    if (f) elegirArchivo(f);
  }, []);

  async function analizar() {
    if (!archivo || !user) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("BacteriDex Study no está disponible en este momento.");
      return;
    }

    setError(null);
    setErrorProveedor(null);
    setEstado("subiendo");
    setProgreso(10);

    const rutaStorage = `${user.id}/${Date.now()}-${archivo.name.replace(/[^\w.\-]/g, "_")}`;

    const { error: subidaError } = await supabase.storage.from("study-pdfs").upload(rutaStorage, archivo, {
      contentType: "application/pdf",
      upsert: false
    });
    if (subidaError) {
      setError("No se pudo subir el PDF. Inténtalo de nuevo.");
      setEstado("error");
      return;
    }

    setProgreso(30);

    const { data: documento, error: insertError } = await supabase
      .from("study_documents")
      .insert({
        user_id: user.id,
        filename: archivo.name,
        storage_path: rutaStorage,
        file_size: archivo.size,
        status: "analizando"
      })
      .select("id")
      .single();

    if (insertError || !documento) {
      setError("No se pudo registrar el documento.");
      setEstado("error");
      return;
    }

    setEstado("analizando");
    setMensaje(`🤖 Analizando con ${NOMBRE_PROVEEDOR[proveedor]}…`);
    let paso = 0;
    const intervalo = setInterval(() => {
      paso = (paso + 1) % MENSAJES_ANALIZANDO.length;
      setMensaje(MENSAJES_ANALIZANDO[paso]);
      setProgreso((p) => Math.min(90, p + 12));
    }, 3500);

    try {
      const { data: sesion } = await supabase.auth.getSession();
      const token = sesion.session?.access_token;
      const respuesta = await fetch("/api/study/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ documentId: documento.id, proveedor })
      });
      const json = await respuesta.json();
      clearInterval(intervalo);

      if (!respuesta.ok) {
        setError(json?.error || "Hubo un problema al procesar el documento.");
        setErrorProveedor((json?.provider as ProveedorId) || proveedor);
        setEstado("error");
        return;
      }

      setProgreso(100);
      setEstado("completado");
      const notas: string[] = json?.notas || [];
      setMensaje(notas.length > 0 ? `${notas.join(" ")} ✓ Documento analizado correctamente` : "✓ Documento analizado correctamente");
      setTimeout(() => router.push(`/study/${documento.id}`), 1300);
    } catch {
      clearInterval(intervalo);
      setError("No se pudo conectar con el servidor. Verifica tu conexión.");
      setErrorProveedor(proveedor);
      setEstado("error");
    }
  }

  function quitarArchivo() {
    setArchivo(null);
    setError(null);
    setErrorProveedor(null);
    setEstado("inicial");
    if (inputRef.current) inputRef.current.value = "";
  }

  function elegirOtraIA() {
    setError(null);
    setErrorProveedor(null);
    setEstado("inicial");
  }

  if (estado === "subiendo" || estado === "analizando" || estado === "completado") {
    return (
      <div className="lab-card flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-3xl animate-pulseGlow">{estado === "completado" ? "✅" : "🧠"}</p>
        <p className="text-sm font-medium text-mist-100">
          {estado === "subiendo" ? "Subiendo tu PDF…" : mensaje}
        </p>
        <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-base-700">
          <div className="h-full rounded-full bg-bio transition-all" style={{ width: `${progreso}%` }} />
        </div>
        {estado !== "completado" && (
          <p className="text-xs text-mist-400">Esto puede tardar uno o dos minutos en documentos largos.</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={onDrop}
        className={`lab-card flex flex-col items-center gap-3 border-dashed p-10 text-center transition ${
          arrastrando ? "border-bio bg-bio/5" : ""
        }`}
      >
        <span className="text-4xl">📄</span>
        {!archivo ? (
          <>
            <p className="text-sm text-mist-300">Arrastra tu PDF aquí</p>
            <p className="text-xs text-mist-400">o</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-sm hover:border-bio hover:text-bio"
            >
              Seleccionar PDF
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && elegirArchivo(e.target.files[0])}
            />
            <p className="mt-1 text-[11px] text-mist-400">Máximo {TAMANO_MAXIMO_MB} MB por documento.</p>
          </>
        ) : (
          <>
            <p className="font-medium text-mist-100">{archivo.name}</p>
            <p className="text-xs text-mist-400">{(archivo.size / (1024 * 1024)).toFixed(1)} MB</p>

            <div className="mt-3 w-full max-w-xs text-left">
              <p className="section-eyebrow mb-2 text-center">🤖 Analizar con IA</p>
              <div className="flex flex-col gap-1.5">
                {PROVEEDORES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProveedor(p.id)}
                    aria-pressed={proveedor === p.id}
                    className={`focus-ring flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                      proveedor === p.id ? "border-bio bg-bio/10 text-bio" : "border-base-600 hover:border-bio"
                    }`}
                  >
                    <span>{p.emoji} {p.label}</span>
                    {p.recomendado && <span className="chip text-[10px]">⭐ RECOMENDADO</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={analizar}
                className="focus-ring rounded-lg bg-bio px-4 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow"
              >
                🧠 Analizar PDF
              </button>
              <button
                onClick={quitarArchivo}
                className="focus-ring rounded-lg border border-base-600 px-4 py-2 text-sm hover:border-alert hover:text-alert"
              >
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-alert/30 bg-alert/10 p-3 text-sm text-alert">
          <p>
            {errorProveedor ? `❌ ${NOMBRE_PROVEEDOR[errorProveedor]}: ` : "❌ "}
            {error}
          </p>
          {archivo && (
            <button
              onClick={elegirOtraIA}
              className="focus-ring mt-2 rounded-lg border border-alert/40 px-3 py-1.5 text-xs font-medium hover:bg-alert/20"
            >
              Elegir otra IA
            </button>
          )}
        </div>
      )}
    </div>
  );
}
