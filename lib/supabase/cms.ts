import { Organismo, MedioCultivo } from "@/lib/types";

// DB types mapping
export interface OrganismoDB {
  id: string;
  numero: number;
  categoria: string;
  subgrupo: string | null;
  nombre_cientifico: string;
  nombre_comun: string | null;
  familia: string | null;
  genero: string | null;
  especie: string | null;
  gram: string | null;
  morfologia: string | null;
  agrupacion: string | null;
  oxigeno: string | null;
  esporulacion: string | null;
  motilidad: string | null;
  capsula: string | null;
  genoma: string | null;
  cadena: string | null;
  envuelto: boolean | null;
  tipo_hongo: string | null;
  tipo_parasito: string | null;
  ciclo_biologico: string | null;
  forma_diagnostica: string | null;
  habitat: string | null;
  transmision: string | null;
  muestra_clinica: string[] | null;
  pruebas: any[] | null;
  medios_cultivo: string[] | null;
  colonia: string | null;
  importancia_medica: any | null;
  enfermedades: string[] | null;
  nivel_importancia: number | null;
  nivel_frecuencia: number | null;
  prioridad: string | null;
  casos_clinicos: any[] | null;
  imagenes: any[] | null;
  fuentes: string[] | null;
  status: "draft" | "published" | "archived";
}

// Convert DB format to local TS interface
export function mapOrganismoFromDB(db: OrganismoDB): Organismo {
  return {
    id: db.id,
    numero: db.numero || 0,
    categoria: db.categoria as any,
    subgrupo: db.subgrupo || "",
    nombreCientifico: db.nombre_cientifico,
    nombreComun: db.nombre_comun || undefined,
    familia: db.familia || "",
    genero: db.genero || "",
    especie: db.especie || "",
    gram: db.gram as any,
    morfologia: db.morfologia || undefined,
    agrupacion: db.agrupacion || undefined,
    oxigeno: db.oxigeno || undefined,
    esporulacion: db.esporulacion || undefined,
    motilidad: db.motilidad || undefined,
    capsula: db.capsula || undefined,
    genoma: db.genoma as any,
    cadena: db.cadena as any,
    envuelto: db.envuelto === null ? undefined : db.envuelto,
    tipoHongo: db.tipo_hongo as any,
    tipoParasito: db.tipo_parasito as any,
    cicloBiologico: db.ciclo_biologico || undefined,
    formaDiagnostica: db.forma_diagnostica || undefined,
    habitat: db.habitat || "",
    transmision: db.transmision || "",
    muestraClinica: db.muestra_clinica || [],
    pruebas: db.pruebas || [],
    mediosCultivo: db.medios_cultivo || [],
    colonia: db.colonia || undefined,
    importanciaMedica: db.importancia_medica || { queCausa: "", organosAfectados: "", poblacionRiesgo: "", porQueImporta: "", comoSeDiagnostica: "" },
    enfermedades: db.enfermedades || [],
    nivelImportancia: (db.nivel_importancia as any) || 3,
    nivelFrecuencia: (db.nivel_frecuencia as any) || 3,
    prioridad: (db.prioridad as any) || "frecuente",
    casosClinicos: db.casos_clinicos || undefined,
    imagenes: db.imagenes || [],
    fuentes: db.fuentes || [],
  };
}

export function mapMedioFromDB(db: any): MedioCultivo {
  return {
    id: db.id,
    nombre: db.nombre,
    proposito: db.proposito || "",
    permite: db.permite || [],
    inhibe: db.inhibe || [],
    tipo: db.tipo || "",
    aparienciaColonias: db.apariencia_colonias || ""
  };
}

export async function getOrganismosDB(categoria: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
  });
  
  const { data, error } = await supabase.from('organismos').select('*').eq('categoria', categoria).eq('status', 'published');
  if (error || !data) return [];
  return data.map(mapOrganismoFromDB);
}

export async function getMediosDB() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return [];
  
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
  });
  
  const { data, error } = await supabase.from('medios_cultivo').select('*').eq('status', 'published');
  if (error || !data) return [];
  return data.map(mapMedioFromDB);
}
import { bacterias, virus, hongos, parasitos, medios } from "@/lib/data";

export async function getOrganismosDinamicos(categoria: string): Promise<Organismo[]> {
  let locales: Organismo[] = [];
  if (categoria === 'bacterias') locales = bacterias;
  else if (categoria === 'virus') locales = virus;
  else if (categoria === 'hongos') locales = hongos;
  else if (categoria === 'parasitos') locales = parasitos;

  const dbOrgs = await getOrganismosDB(categoria);

  const map = new Map<string, Organismo>();
  locales.forEach(o => map.set(o.id, o));
  dbOrgs.forEach(o => map.set(o.id, o));
  
  const result = Array.from(map.values());
  result.sort((a, b) => a.nombreCientifico.localeCompare(b.nombreCientifico));
  return result;
}

export async function getOrganismoDinamico(categoria: string, id: string): Promise<Organismo | null> {
  const lista = await getOrganismosDinamicos(categoria);
  return lista.find(o => o.id === id) || null;
}

export async function getMediosDinamicos(): Promise<MedioCultivo[]> {
  const locales = medios;
  const dbMedios = await getMediosDB();
  
  const map = new Map<string, MedioCultivo>();
  locales.forEach(m => map.set(m.id, m));
  dbMedios.forEach(m => map.set(m.id, m));
  
  const result = Array.from(map.values());
  result.sort((a, b) => a.nombre.localeCompare(b.nombre));
  return result;
}

export async function getMedioDinamico(id: string): Promise<MedioCultivo | null> {
  const lista = await getMediosDinamicos();
  return lista.find(m => m.id === id) || null;
}

