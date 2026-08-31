import {
  todosLosOrganismos,
  pruebas,
  medios,
  procedimientos,
  analisisClinicos,
  getOrganismoPorId,
} from "@/lib/data";

export function getBacteridexContext(query: string, organismoId?: string | null): string {
  let contextParts: string[] = [];

  // If a specific organism context is provided
  if (organismoId) {
    const org = getOrganismoPorId(organismoId);
    if (org) {
      contextParts.push(`CONTEXTO ESPECÍFICO DEL MICROORGANISMO SELECCIONADO:\n${JSON.stringify(org, null, 2)}`);
    }
  }

  // Do a basic keyword search to feed context
  const q = query.trim().toLowerCase();
  if (q.length < 3 && !organismoId) return ""; // Too short for global search

  const MAX_ITEMS = 3;

  // Search organisms
  const matchedOrgs = todosLosOrganismos.filter(o => 
    o.nombreCientifico.toLowerCase().includes(q) || 
    (o.nombreComun && o.nombreComun.toLowerCase().includes(q))
  ).slice(0, MAX_ITEMS);

  if (matchedOrgs.length > 0) {
    contextParts.push(`MICROORGANISMOS EN BACTERIDEX:\n${JSON.stringify(matchedOrgs, null, 2)}`);
  }

  // Search tests (pruebas)
  const matchedPruebas = pruebas.filter(p => p.nombre.toLowerCase().includes(q)).slice(0, MAX_ITEMS);
  if (matchedPruebas.length > 0) {
    contextParts.push(`PRUEBAS DE LABORATORIO EN BACTERIDEX:\n${JSON.stringify(matchedPruebas, null, 2)}`);
  }

  // Search medios
  const matchedMedios = medios.filter(m => m.nombre.toLowerCase().includes(q)).slice(0, MAX_ITEMS);
  if (matchedMedios.length > 0) {
    contextParts.push(`MEDIOS DE CULTIVO EN BACTERIDEX:\n${JSON.stringify(matchedMedios, null, 2)}`);
  }

  // Search procedimientos
  const matchedProc = procedimientos.filter(p => p.nombre.toLowerCase().includes(q)).slice(0, MAX_ITEMS);
  if (matchedProc.length > 0) {
    contextParts.push(`PROCEDIMIENTOS EN BACTERIDEX:\n${JSON.stringify(matchedProc, null, 2)}`);
  }

  // Search analisis
  const matchedAnalisis = analisisClinicos.filter(a => a.nombre.toLowerCase().includes(q)).slice(0, MAX_ITEMS);
  if (matchedAnalisis.length > 0) {
    contextParts.push(`ANÁLISIS CLÍNICOS EN BACTERIDEX:\n${JSON.stringify(matchedAnalisis, null, 2)}`);
  }

  if (contextParts.length === 0) return "";

  return `
ESTA ES LA INFORMACIÓN ENCONTRADA EN BACTERIDEX QUE DEBES USAR PARA RESPONDER SI ES RELEVANTE:
=================================================================================================
${contextParts.join("\n\n")}
=================================================================================================
`;
}
