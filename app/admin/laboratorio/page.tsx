"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import RequiereSesion from "@/components/RequiereSesion";
import { Upload, Save, CheckCircle, AlertCircle, X } from "lucide-react";

export default function AdminLaboratorioPage() {
  const { user, esAdmin, cargando } = useAuth();
  const supabase = getSupabaseClient();
  
  const [profName, setProfName] = useState("");
  const [profTitle, setProfTitle] = useState("");
  const [profId, setProfId] = useState("");
  
  const [firmaUrl, setFirmaUrl] = useState<string | null>(null);
  const [selloUrl, setSelloUrl] = useState<string | null>(null);
  
  const [firmaFile, setFirmaFile] = useState<File | null>(null);
  const [selloFile, setSelloFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      if (!user || !supabase) {
        setLoadingInitial(false);
        return;
      }
      const { data, error } = await supabase
        .from("lab_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
        
      if (data) {
        setProfName(data.professional_name || "");
        setProfTitle(data.professional_title || "");
        setProfId(data.professional_id || "");
        
        // Obtener Signed URLs temporales para previsualización
        if (data.signature_url) {
           const { data: signData } = await supabase.storage.from("lab-assets").createSignedUrl(data.signature_url, 3600);
           setFirmaUrl(signData?.signedUrl || null);
           // Guardar el path original en otro estado para no re-subirlo si no cambia, pero en este código no nos importa porque si no sube file, no se actualiza.
        }
        if (data.stamp_url) {
           const { data: signData } = await supabase.storage.from("lab-assets").createSignedUrl(data.stamp_url, 3600);
           setSelloUrl(signData?.signedUrl || null);
        }
      }
      setLoadingInitial(false);
    }
    loadSettings();
  }, [user, supabase]);

  if (cargando || loadingInitial) return <div className="p-8 text-center text-mist-400">Cargando...</div>;

  if (!user) {
    return <RequiereSesion mensaje="Inicia sesión para acceder al panel de administración." />;
  }

  if (!esAdmin) {
    return (
      <div className="lab-card mx-auto max-w-md p-8 text-center">
        <p className="text-3xl">🔒</p>
        <h1 className="mt-2 font-display text-lg font-bold">Acceso restringido</h1>
        <p className="mt-2 text-sm text-mist-400">Esta sección es solo para administradores.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setSaving(true);
    setMensaje(null);

    try {
      let finalFirmaPath = firmaUrl;
      let finalSelloPath = selloUrl;

      // Subir firma si hay una nueva
      if (firmaFile) {
        const ext = firmaFile.name.split(".").pop();
        const fileName = `firma.${ext}`;
        const path = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("lab-assets")
          .upload(path, firmaFile, { upsert: true });
          
        if (uploadError) throw new Error("Error subiendo la firma: " + uploadError.message);
        
        finalFirmaPath = path;
      }

      // Subir sello si hay uno nuevo
      if (selloFile) {
        const ext = selloFile.name.split(".").pop();
        const fileName = `sello.${ext}`;
        const path = `${user.id}/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from("lab-assets")
          .upload(path, selloFile, { upsert: true });
          
        if (uploadError) throw new Error("Error subiendo el sello: " + uploadError.message);
        
        finalSelloPath = path;
      }

      // Para no perder el path original si no subimos archivo nuevo,
      // actualizamos el objeto a enviar solo con las nuevas rutas si existen.
      const updatePayload: any = {
        user_id: user.id,
        professional_name: profName,
        professional_title: profTitle,
        professional_id: profId,
        updated_at: new Date().toISOString()
      };
      
      if (firmaFile) updatePayload.signature_url = finalFirmaPath;
      if (selloFile) updatePayload.stamp_url = finalSelloPath;

      // Guardar en lab_settings
      const { error: dbError } = await supabase.from("lab_settings").upsert(updatePayload, { onConflict: 'user_id' });

      if (dbError) throw dbError;

      // Al guardar limpiamos los archivos
      setFirmaFile(null);
      setSelloFile(null);
      // Las URLs de previsualización no cambian hasta refrescar o generar un nuevo signedUrl
      // Podemos recargarlo si fuera crítico, pero para la vista previa bastará con el Blob local o ignorarlo.
      setMensaje({ tipo: "exito", texto: "Configuración guardada correctamente." });
    } catch (err: any) {
      setMensaje({ tipo: "error", texto: err.message || "Error al guardar." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">Configuración</p>
        <h1 className="font-display text-2xl font-bold">Laboratorio Clínico</h1>
        <p className="text-sm text-mist-400">
          Configura los datos del profesional, la firma y el sello que aparecerán en los informes PDF.
        </p>
      </div>

      {mensaje && (
        <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${mensaje.tipo === "exito" ? "bg-bio/10 text-bio" : "bg-alert/10 text-alert"}`}>
          {mensaje.tipo === "exito" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} className="ml-auto opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="lab-card flex flex-col gap-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-mist-400">Nombre del Profesional</label>
            <input
              type="text"
              value={profName}
              onChange={(e) => setProfName(e.target.value)}
              className="lab-input"
              placeholder="Ej: Dr. Juan Pérez"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-mist-400">Profesión / Cargo</label>
            <input
              type="text"
              value={profTitle}
              onChange={(e) => setProfTitle(e.target.value)}
              className="lab-input"
              placeholder="Ej: Biólogo Microbiólogo"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-mist-400">Número de Colegiatura</label>
            <input
              type="text"
              value={profId}
              onChange={(e) => setProfId(e.target.value)}
              className="lab-input"
              placeholder="Ej: CBP 12345"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 pt-4 border-t border-base-700 sm:grid-cols-2">
          {/* Firma */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-mist-400">Firma (JPG/PNG)</label>
            {firmaUrl && !firmaFile && (
              <div className="mb-2 max-w-[200px] overflow-hidden rounded border border-base-700 bg-white p-2">
                <img src={firmaUrl} alt="Firma" className="h-auto w-full object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setFirmaFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-mist-400 file:mr-4 file:rounded-lg file:border-0 file:bg-base-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-mist-200 hover:file:bg-base-600"
            />
          </div>

          {/* Sello */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-mist-400">Sello (JPG/PNG)</label>
            {selloUrl && !selloFile && (
              <div className="mb-2 max-w-[150px] overflow-hidden rounded border border-base-700 bg-white p-2">
                <img src={selloUrl} alt="Sello" className="h-auto w-full object-contain" />
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => setSelloFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-mist-400 file:mr-4 file:rounded-lg file:border-0 file:bg-base-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-mist-200 hover:file:bg-base-600"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-bio px-5 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow focus:outline-none focus:ring-2 focus:ring-bio disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      </form>
    </div>
  );
}
