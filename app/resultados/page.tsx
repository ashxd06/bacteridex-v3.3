"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import RequiereSesion from "@/components/RequiereSesion";
import DynamicTable, { LabItem } from "@/components/resultados/DynamicTable";
import LabPDFDocument, { PatientData, LabSettingsData } from "@/components/resultados/LabPDFDocument";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { FileDown, Save, Loader2, AlertCircle } from "lucide-react";

export default function ResultadosLaboratorioPage() {
  const { user, cargando } = useAuth();
  const supabase = getSupabaseClient();

  const [settings, setSettings] = useState<LabSettingsData | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Datos del Paciente
  const [patient, setPatient] = useState<PatientData>({
    patient_name: "",
    patient_document: "",
    patient_age: "",
    patient_gender: "Masculino",
    sample_date: new Date().toISOString().split("T")[0],
    sample_time: "",
    sample_type: "Sangre",
    doctor_name: "",
    report_number: "", // Se asigna al guardar
    observations: "",
  });

  const [items, setItems] = useState<LabItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [reporteGuardado, setReporteGuardado] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      if (!user || !supabase) return;
      const { data } = await supabase
        .from("lab_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (data) {
        let signatureUrl = null;
        let stampUrl = null;
        
        if (data.signature_url) {
           const { data: signData } = await supabase.storage.from("lab-assets").createSignedUrl(data.signature_url, 3600);
           signatureUrl = signData?.signedUrl;
        }
        if (data.stamp_url) {
           const { data: signData } = await supabase.storage.from("lab-assets").createSignedUrl(data.stamp_url, 3600);
           stampUrl = signData?.signedUrl;
        }

        setSettings({
          professional_name: data.professional_name,
          professional_title: data.professional_title,
          professional_id: data.professional_id,
          signature_url: signatureUrl,
          stamp_url: stampUrl
        });
      } else {
        setSettings({
          professional_name: "",
          professional_title: "",
          professional_id: "",
        });
      }
      setLoadingSettings(false);
    }
    if (!cargando) fetchSettings();
  }, [user, cargando, supabase]);

  if (cargando || loadingSettings) {
    return <div className="p-8 text-center text-mist-400">Cargando módulo de laboratorio...</div>;
  }

  if (!user) {
    return <RequiereSesion mensaje="Inicia sesión para generar resultados de laboratorio." />;
  }

  const handleSaveAndGenerate = async () => {
    if (!patient.patient_name || items.length === 0) {
      setError("Faltan datos del paciente o no hay exámenes agregados.");
      return;
    }
    setError(null);
    setGuardando(true);

    try {
      if (!supabase) throw new Error("Supabase no configurado.");

      // Generar número de reporte LAB-AÑO-XXXXX mediante transacción atómica en Supabase
      const year = new Date(patient.sample_date).getFullYear();
      
      const { data: reportNumber, error: rpcError } = await supabase
        .rpc("get_next_lab_report_number", { report_year: year });
        
      if (rpcError) throw new Error("Error generando número de informe: " + rpcError.message);
      if (!reportNumber) throw new Error("No se pudo generar el número de informe.");
      
      const newPatientData = { ...patient, report_number: reportNumber };
      setPatient(newPatientData);

      // Guardar en Supabase
      const { error: dbError } = await supabase.from("lab_reports").insert({
        user_id: user.id,
        report_number: reportNumber,
        patient_name: newPatientData.patient_name,
        patient_document: newPatientData.patient_document,
        patient_age: newPatientData.patient_age,
        patient_gender: newPatientData.patient_gender,
        sample_date: newPatientData.sample_date,
        sample_time: newPatientData.sample_time,
        sample_type: newPatientData.sample_type,
        doctor_name: newPatientData.doctor_name,
        items: items,
        observations: newPatientData.observations,
        professional_name: settings?.professional_name,
        professional_title: settings?.professional_title,
        professional_id: settings?.professional_id
      });

      if (dbError) throw dbError;

      setReporteGuardado(true);
    } catch (err: any) {
      setError(err.message || "Error al guardar el reporte.");
    } finally {
      setGuardando(false);
    }
  };

  const handleNuevo = () => {
    setPatient({
      ...patient,
      patient_name: "",
      patient_document: "",
      report_number: "",
      observations: "",
    });
    setItems([]);
    setReporteGuardado(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">Laboratorio</p>
        <h1 className="font-display text-2xl font-bold">Generar Resultado Clínico</h1>
        <p className="text-sm text-mist-400">
          Completa los datos del paciente y los exámenes para emitir el informe PDF.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-alert/10 p-4 text-alert">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Formulario principal */}
      <div className={`flex flex-col gap-8 ${reporteGuardado ? "opacity-50 pointer-events-none" : ""}`}>
        
        {/* Sección Paciente */}
        <section className="lab-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-bio">Datos del Paciente</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-medium text-mist-400">Nombre Completo *</label>
              <input
                type="text"
                value={patient.patient_name}
                onChange={(e) => setPatient({...patient, patient_name: e.target.value})}
                className="lab-input"
                placeholder="Ej: Juan Pérez García"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">DNI / Documento</label>
              <input
                type="text"
                value={patient.patient_document}
                onChange={(e) => setPatient({...patient, patient_document: e.target.value})}
                className="lab-input"
                placeholder="Ej: 12345678"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">Edad</label>
              <input
                type="text"
                value={patient.patient_age}
                onChange={(e) => setPatient({...patient, patient_age: e.target.value})}
                className="lab-input"
                placeholder="Ej: 25"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">Sexo</label>
              <select
                value={patient.patient_gender}
                onChange={(e) => setPatient({...patient, patient_gender: e.target.value})}
                className="lab-input py-2"
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">Médico Solicitante</label>
              <input
                type="text"
                value={patient.doctor_name}
                onChange={(e) => setPatient({...patient, doctor_name: e.target.value})}
                className="lab-input"
                placeholder="Ej: Dra. María Gómez"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">Fecha de Toma</label>
              <input
                type="date"
                value={patient.sample_date}
                onChange={(e) => setPatient({...patient, sample_date: e.target.value})}
                className="lab-input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">Hora de Toma</label>
              <input
                type="time"
                value={patient.sample_time}
                onChange={(e) => setPatient({...patient, sample_time: e.target.value})}
                className="lab-input"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-mist-400">Tipo de Muestra</label>
              <input
                type="text"
                value={patient.sample_type}
                onChange={(e) => setPatient({...patient, sample_type: e.target.value})}
                className="lab-input"
                placeholder="Ej: Sangre, Orina"
              />
            </div>
          </div>
        </section>

        {/* Sección Resultados */}
        <section className="lab-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-bio">Resultados</h2>
          <DynamicTable items={items} setItems={setItems} />
        </section>

        {/* Sección Observaciones */}
        <section className="lab-card p-6">
          <h2 className="font-display text-lg font-semibold mb-4 text-bio">Observaciones</h2>
          <textarea
            value={patient.observations}
            onChange={(e) => setPatient({...patient, observations: e.target.value})}
            className="lab-input min-h-[100px] resize-y"
            placeholder="Observaciones adicionales, metodología utilizada, comentarios sobre la muestra..."
          />
        </section>

      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-4">
        {!reporteGuardado ? (
          <button
            onClick={handleSaveAndGenerate}
            disabled={guardando}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-bio px-6 py-3 text-sm font-medium text-base-950 hover:bg-bio-glow disabled:opacity-70"
          >
            {guardando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Guardar y Generar PDF
          </button>
        ) : (
          <>
            <button
              onClick={handleNuevo}
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-base-600 px-6 py-3 text-sm font-medium hover:bg-base-800"
            >
              Nuevo Informe
            </button>
            <div className="w-full sm:w-auto">
              {settings && (
                <PDFDownloadLink
                  document={<LabPDFDocument patient={patient} items={items} settings={settings} />}
                  fileName={`${patient.report_number}.pdf`}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-cian px-6 py-3 text-sm font-medium text-base-950 hover:bg-cian-glow"
                >
                  {({ loading }) => (
                    loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" /> Preparando PDF...
                      </>
                    ) : (
                      <>
                        <FileDown className="h-5 w-5" /> Descargar PDF
                      </>
                    )
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
