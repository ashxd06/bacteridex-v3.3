import bacteriasData from "@/data/bacterias.json";
import virusData from "@/data/virus.json";
import hongosData from "@/data/hongos.json";
import parasitosData from "@/data/parasitos.json";
import pruebasData from "@/data/pruebas.json";
import mediosData from "@/data/medios.json";
import procedimientosData from "@/data/procedimientos.json";
import type { Organismo, Categoria, Prueba, MedioCultivo, Procedimiento, CategoriaProcedimiento } from "./types";

export const bacterias = bacteriasData as Organismo[];
export const virus = virusData as Organismo[];
export const hongos = hongosData as Organismo[];
export const parasitos = parasitosData as Organismo[];
export const pruebas = pruebasData as Prueba[];
export const medios = mediosData as MedioCultivo[];
export const procedimientos = procedimientosData as Procedimiento[];

export const CATEGORIAS_PROCEDIMIENTOS: { id: CategoriaProcedimiento; label: string; emoji: string }[] = [
  { id: "microbiologia", label: "Microbiología", emoji: "🧫" },
  { id: "hematologia", label: "Hematología", emoji: "🩸" },
  { id: "parasitologia", label: "Parasitología", emoji: "🪱" },
  { id: "micologia", label: "Micología", emoji: "🍄" },
  { id: "inmunologia", label: "Inmunología", emoji: "🧫" },
  { id: "bioquimica", label: "Bioquímica", emoji: "🧪" },
  { id: "toma-muestras", label: "Toma y transporte de muestras", emoji: "🧪" },
  { id: "bioseguridad", label: "Bioseguridad", emoji: "🧤" }
];

export function getProcedimiento(id: string): Procedimiento | undefined {
  return procedimientos.find((p) => p.id === id);
}

export const todosLosOrganismos: Organismo[] = [
  ...bacterias,
  ...virus,
  ...hongos,
  ...parasitos
];

export const CATEGORIAS: { id: Categoria; label: string; emoji: string; total: number }[] = [
  { id: "bacterias", label: "Bacterias", emoji: "🦠", total: bacterias.length },
  { id: "virus", label: "Virus", emoji: "🧬", total: virus.length },
  { id: "hongos", label: "Hongos", emoji: "🍄", total: hongos.length },
  { id: "parasitos", label: "Parásitos", emoji: "🪱", total: parasitos.length }
];

export function getOrganismosPorCategoria(categoria: Categoria): Organismo[] {
  switch (categoria) {
    case "bacterias":
      return bacterias;
    case "virus":
      return virus;
    case "hongos":
      return hongos;
    case "parasitos":
      return parasitos;
    default:
      return [];
  }
}

export function getOrganismo(categoria: Categoria, id: string): Organismo | undefined {
  return getOrganismosPorCategoria(categoria).find((o) => o.id === id);
}

export function getOrganismoPorId(id: string): Organismo | undefined {
  return todosLosOrganismos.find((o) => o.id === id);
}

export function getPrueba(id: string): Prueba | undefined {
  return pruebas.find((p) => p.id === id);
}

export function getMedio(id: string): MedioCultivo | undefined {
  return medios.find((m) => m.id === id);
}

// Buscador global: recorre organismos, pruebas y medios de cultivo
export interface ResultadoBusqueda {
  tipo: "organismo" | "prueba" | "medio" | "procedimiento";
  id: string;
  categoria?: Categoria;
  titulo: string;
  subtitulo: string;
}

export function buscarGlobal(query: string): ResultadoBusqueda[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const resultados: ResultadoBusqueda[] = [];

  for (const o of todosLosOrganismos) {
    const campos = [
      o.nombreCientifico,
      o.nombreComun ?? "",
      o.familia,
      o.genero,
      o.especie,
      o.subgrupo,
      ...(o.enfermedades ?? []),
      ...(o.pruebas ?? []).map((p) => p.nombre),
      ...(o.mediosCultivo ?? []),
      ...(o.muestraClinica ?? [])
    ]
      .join(" ")
      .toLowerCase();
    if (campos.includes(q)) {
      resultados.push({
        tipo: "organismo",
        id: o.id,
        categoria: o.categoria,
        titulo: o.nombreCientifico,
        subtitulo: `${o.subgrupo} · ${o.categoria}`
      });
    }
  }

  for (const p of pruebas) {
    const campos = [p.nombre, p.queDetecta, p.queEs, ...p.diferencia].join(" ").toLowerCase();
    if (campos.includes(q)) {
      resultados.push({
        tipo: "prueba",
        id: p.id,
        titulo: p.nombre,
        subtitulo: "Prueba de laboratorio"
      });
    }
  }

  for (const m of medios) {
    const campos = [m.nombre, m.proposito, ...m.permite, ...m.inhibe].join(" ").toLowerCase();
    if (campos.includes(q)) {
      resultados.push({
        tipo: "medio",
        id: m.id,
        titulo: m.nombre,
        subtitulo: "Medio de cultivo"
      });
    }
  }

  for (const p of procedimientos) {
    const campos = [
      p.nombre,
      p.objetivo,
      p.fundamento,
      p.tipoMuestra,
      ...p.microorganismosRelacionados
    ]
      .join(" ")
      .toLowerCase();
    if (campos.includes(q)) {
      resultados.push({
        tipo: "procedimiento",
        id: p.id,
        titulo: p.nombre,
        subtitulo: `Procedimiento · ${p.categoria}`
      });
    }
  }

  return resultados.slice(0, 40);
}

export function organismosRelacionadosConPrueba(pruebaNombre: string): Organismo[] {
  const nombre = pruebaNombre.toLowerCase();
  return todosLosOrganismos.filter((o) =>
    o.pruebas.some((p) => p.nombre.toLowerCase() === nombre)
  );
}
