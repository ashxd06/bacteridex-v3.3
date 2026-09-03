// Tipos del módulo BacteriDex Study. Aislado del resto de /lib/types.ts
// (que define la enciclopedia); no se tocan ni se reutilizan nombres.

export type EstadoDocumento =
  | "subiendo"
  | "analizando"
  | "completado"
  | "error";

export type CategoriaEstudio =
  | "microbiologia"
  | "bacteriologia"
  | "parasitologia"
  | "micologia"
  | "virologia"
  | "hematologia"
  | "inmunologia"
  | "bioquimica-clinica"
  | "uroanalisis"
  | "coprologia"
  | "citologia"
  | "anatomia-patologica"
  | "banco-de-sangre"
  | "toma-de-muestras"
  | "bioseguridad"
  | "general";

export interface StudyDocumento {
  id: string;
  filename: string;
  file_url: string | null;
  file_size: number;
  page_count: number | null;
  status: EstadoDocumento;
  error_mensaje?: string | null;
  created_at: string;
}

export interface StudyTema {
  titulo: string;
  categoria: CategoriaEstudio;
  contenido: string;
  pagina: number | null;
}

export interface StudyConcepto {
  termino: string;
  explicacion: string;
  pagina: number | null;
}

export interface StudyMicroorganismo {
  nombre: string;
  tipo: string;
  gram: string | null;
  morfologia: string | null;
  caracteristicas: string;
  enfermedades: string;
  diagnostico: string;
  pagina: number | null;
}

export interface StudyTabla {
  titulo: string;
  encabezados: string[];
  filas: string[][];
  pagina: number | null;
}

export interface StudyImagenInterpretada {
  descripcion: string;
  interpretacion: string;
  pagina: number | null;
  tipo: "extraida" | "interpretacion_ia";
}

export interface StudyFlashcard {
  pregunta: string;
  respuesta: string;
  pagina: number | null;
}

export type DificultadPregunta = "facil" | "intermedia" | "dificil" | "examen";

export interface StudyPregunta {
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
  explicacion: string;
  dificultad: DificultadPregunta;
  pagina: number | null;
}

// Resultado estructurado que devuelve la IA y que se persiste en Supabase.
export interface ResultadoAnalisis {
  resumen_general: string;
  paginas_analizadas: number | null;
  temas: StudyTema[];
  conceptos_clave: StudyConcepto[];
  microorganismos: StudyMicroorganismo[];
  tablas: StudyTabla[];
  imagenes_interpretadas: StudyImagenInterpretada[];
  flashcards: StudyFlashcard[];
  preguntas: StudyPregunta[];
  advertencia_confianza: string | null;
}
