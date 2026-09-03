export type Categoria = "bacterias" | "virus" | "hongos" | "parasitos";

export type Importancia = 5 | 4 | 3 | 2 | 1;
export type Frecuencia = 5 | 4 | 3 | 2 | 1;
export type Prioridad = "muy-frecuente" | "frecuente" | "importancia-clinica" | "especializado" | "raro";

export interface PruebaResultado {
  nombre: string;
  resultado: string;
}

export interface ImagenMeta {
  tipo: "microscopia" | "colonia" | "tincion" | "prueba" | "ilustracion";
  descripcion: string;
  fuente: string;
  licencia: string;
  // url es opcional a propósito: si no hay una fuente confiable, la UI
  // debe mostrar un placeholder ilustrado en lugar de romperse.
  url?: string;
}

export interface ImportanciaMedica {
  queCausa: string;
  organosAfectados: string;
  poblacionRiesgo: string;
  porQueImporta: string;
  comoSeDiagnostica: string;
  explicacionCompleta?: string;
}

export interface CasoClinico {
  titulo: string;
  sintomas: string[];
  muestra: string;
  hallazgos: string;
  pregunta: string;
  respuesta: string;
  explicacion: string;
}

export interface Organismo {
  id: string;
  numero: number;
  categoria: Categoria;
  subgrupo: string;
  nombreCientifico: string;
  nombreComun?: string;
  familia: string;
  genero: string;
  especie: string;

  // Bacterias
  gram?: "positivo" | "negativo" | "variable" | "no-aplica";
  morfologia?: string;
  agrupacion?: string;
  oxigeno?: string;
  esporulacion?: string;
  motilidad?: string;
  capsula?: string;

  // Virus
  genoma?: "ADN" | "ARN";
  cadena?: "simple" | "doble";
  envuelto?: boolean;

  // Hongos
  tipoHongo?: "levadura" | "moho" | "dimorfico";

  // Parásitos
  tipoParasito?: "protozoo" | "cestodo" | "trematodo" | "nematodo" | "ectoparasito";
  cicloBiologico?: string;
  formaDiagnostica?: string;

  habitat: string;
  transmision: string;
  muestraClinica: string[];

  pruebas: PruebaResultado[];
  mediosCultivo: string[];
  colonia?: string;

  importanciaMedica: ImportanciaMedica;
  enfermedades: string[];

  nivelImportancia: Importancia;
  nivelFrecuencia: Frecuencia;
  prioridad: Prioridad;

  casosClinicos?: CasoClinico[];
  imagenes: ImagenMeta[];
  fuentes: string[];
}

export interface Prueba {
  id: string;
  nombre: string;
  queEs: string;
  queDetecta: string;
  comoSeInterpreta: string;
  positivo: string;
  negativo: string;
  diferencia: string[];
}

export interface MedioCultivo {
  id: string;
  nombre: string;
  proposito: string;
  permite: string[];
  inhibe: string[];
  tipo: string;
  aparienciaColonias: string;
}

// === NUEVO: Procedimientos (biblioteca educativa de Laboratorio Clínico) ===
export type CategoriaProcedimiento =
  | "microbiologia"
  | "hematologia"
  | "parasitologia"
  | "micologia"
  | "inmunologia"
  | "bioquimica"
  | "toma-muestras"
  | "bioseguridad";

export interface Procedimiento {
  id: string;
  numero: number;
  categoria: CategoriaProcedimiento;
  nombre: string;
  objetivo: string;
  fundamento: string;
  tipoMuestra: string;
  materiales: string[];
  reactivos: string[];
  equipos: string[];
  preparacionPrevia?: string;
  procedimientoGeneral: string[];
  interpretacion: string;
  resultadoPositivo: string;
  resultadoNegativo: string;
  erroresFrecuentes: string[];
  controlCalidad: string;
  bioseguridad: string;
  limitaciones: string;
  microorganismosRelacionados: string[];
  notaProtocolo: string;
  fuentes: string[];
}

// === NUEVO: Análisis Clínicos ===
export type CategoriaAnalisis =
  | "bioquimica"
  | "hematologia"
  | "inmunologia"
  | "microbiologia"
  | "parasitologia"
  | "uroanalisis"
  | "serologia"
  | "otras";

export interface AnalisisClinico {
  id: string;
  numero: number;
  categoria: CategoriaAnalisis;
  nombre: string;
  descripcion: string;
  utilidad: string;
  tipoMuestra: string;
  condicionesMuestra: string;
  reactivos: string[];
  materiales: string[];
  metodo: string;
  parametros: string[];
  longitudOnda?: string;
  procedimientoGeneral: string[];
  formula?: string;
  unidades: string;
  valoresReferencia: string;
  consideraciones: string[];
  procedimientosRelacionados: string[];
  notaProtocolo: string;
  fuentes: string[];
}

// === NUEVO: Resultados de Laboratorio (Fase 1) ===
export type EstadoResultado = "normal" | "bajo" | "alto" | "critico" | "pendiente";
export type EstadoInforme = "borrador" | "completado";

export interface InformeLaboratorio {
  id: string;
  user_id: string;
  fecha: string;
  codigo_muestra: string | null;
  paciente_nombre: string | null;
  paciente_edad: string | null;
  paciente_sexo: string | null;
  observaciones_generales: string | null;
  estado_informe: EstadoInforme;
  created_at: string;
  updated_at: string;
}

export interface ResultadoLaboratorio {
  id: string;
  informe_id: string | null;
  user_id: string;
  fecha: string;
  muestra: string | null;
  analisis_id: string | null;
  analisis_nombre: string;
  resultado: string;
  unidad: string | null;
  rango_referencia: string | null;
  estado: EstadoResultado;
  observaciones: string | null;
  created_at: string;
  updated_at: string;
}

export interface LabConfig {
  id: number;
  laboratorio_nombre: string;
  laboratorio_info: string | null;
  logo_url: string | null;
  profesional_nombre: string | null;
  profesional_profesion: string | null;
  profesional_registro: string | null;
  profesional_cargo: string | null;
  firma_url: string | null;
  sello_url: string | null;
  updated_at: string;
}

// === NUEVO: Calculadoras (Fase 3) ===
// La fórmula se evalúa con mathjs (lib/calc/evaluar.ts) — nunca con eval()
// de JavaScript. Si `formula` viene vacía, la calculadora se muestra como
// "pendiente de carga administrativa" y no permite calcular: BacteriDex no
// inventa fórmulas ni valores clínicos, esas las carga un admin desde
// /admin/calculadoras basándose en fuentes reales.
export interface VariableCalculadora {
  id: string; // símbolo usado dentro de la fórmula, ej. "peso"
  label: string; // nombre mostrado al usuario, ej. "Peso corporal"
  unidad?: string;
}

export interface Calculadora {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string;
  analisisId: string | null;
  variables: VariableCalculadora[];
  formula: string; // expresión mathjs, ej. "peso / (talla^2)"; vacío = pendiente
  unidadResultado: string;
  interpretacion: string;
  notaAdvertencia: string;
  fuentes: string[];
}
