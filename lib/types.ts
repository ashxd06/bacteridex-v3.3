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
