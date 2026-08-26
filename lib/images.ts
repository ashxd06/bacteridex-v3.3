// ============================================================
// SISTEMA DE IMAGENES MANUALES DE BACTERIDEX
// ============================================================
// Este archivo centraliza TODAS las imagenes de portada del sitio.
// No se descarga nada de Internet automaticamente.
//
// Para agregar una imagen:
// 1. Coloca el archivo en /public/images/<categoria>/tu-imagen.jpg
// 2. Reemplaza el `null` de la linea correspondiente por la ruta, ej:
//    b001: "/images/bacterias/staphylococcus-aureus.jpg",
// 3. Guarda. No hace falta tocar ningun otro archivo.
//
// Si el valor sigue en null, la ficha muestra un placeholder ilustrado
// automaticamente (nunca se rompe ni muestra una imagen caida).

export type MapaImagenes = Record<string, string | null>;

// BACTERIAS
export const imagenesBacterias: MapaImagenes = {
  b001: null, // === PONER AQUI IMAGEN DE STAPHYLOCOCCUS AUREUS ===
  b002: null, // === PONER AQUI IMAGEN DE STAPHYLOCOCCUS EPIDERMIDIS ===
  b003: null, // === PONER AQUI IMAGEN DE STAPHYLOCOCCUS SAPROPHYTICUS ===
  b004: null, // === PONER AQUI IMAGEN DE STREPTOCOCCUS PYOGENES ===
  b005: null, // === PONER AQUI IMAGEN DE STREPTOCOCCUS AGALACTIAE ===
  b006: null, // === PONER AQUI IMAGEN DE STREPTOCOCCUS PNEUMONIAE ===
  b007: null, // === PONER AQUI IMAGEN DE ENTEROCOCCUS FAECALIS ===
  b008: null, // === PONER AQUI IMAGEN DE ESCHERICHIA COLI ===
  b009: null, // === PONER AQUI IMAGEN DE KLEBSIELLA PNEUMONIAE ===
  b010: null, // === PONER AQUI IMAGEN DE PROTEUS MIRABILIS ===
  b011: null, // === PONER AQUI IMAGEN DE SALMONELLA ENTERICA ===
  b012: null, // === PONER AQUI IMAGEN DE SHIGELLA FLEXNERI ===
  b013: null, // === PONER AQUI IMAGEN DE PSEUDOMONAS AERUGINOSA ===
  b014: null, // === PONER AQUI IMAGEN DE ACINETOBACTER BAUMANNII ===
  b015: null, // === PONER AQUI IMAGEN DE NEISSERIA GONORRHOEAE ===
  b016: null, // === PONER AQUI IMAGEN DE NEISSERIA MENINGITIDIS ===
  b017: null, // === PONER AQUI IMAGEN DE HAEMOPHILUS INFLUENZAE ===
  b018: null, // === PONER AQUI IMAGEN DE CORYNEBACTERIUM DIPHTHERIAE ===
  b019: null, // === PONER AQUI IMAGEN DE BACILLUS CEREUS ===
  b020: null, // === PONER AQUI IMAGEN DE CLOSTRIDIOIDES DIFFICILE ===
  b021: null, // === PONER AQUI IMAGEN DE LISTERIA MONOCYTOGENES ===
  b022: null, // === PONER AQUI IMAGEN DE MYCOBACTERIUM TUBERCULOSIS ===
  b023: null, // === PONER AQUI IMAGEN DE HELICOBACTER PYLORI ===
  b024: null, // === PONER AQUI IMAGEN DE CAMPYLOBACTER JEJUNI ===
  b025: null, // === PONER AQUI IMAGEN DE VIBRIO CHOLERAE ===
  b026: null, // === PONER AQUI IMAGEN DE TREPONEMA PALLIDUM ===
  b027: null, // === PONER AQUI IMAGEN DE CHLAMYDIA TRACHOMATIS ===
  b028: null, // === PONER AQUI IMAGEN DE MYCOPLASMA PNEUMONIAE ===
  b029: null, // === PONER AQUI IMAGEN DE STAPHYLOCOCCUS LUGDUNENSIS ===
  b030: null, // === PONER AQUI IMAGEN DE ENTEROCOCCUS FAECIUM ===
  b031: null, // === PONER AQUI IMAGEN DE BACILLUS ANTHRACIS ===
  b032: null, // === PONER AQUI IMAGEN DE CLOSTRIDIUM PERFRINGENS ===
  b033: null, // === PONER AQUI IMAGEN DE CLOSTRIDIUM TETANI ===
  b034: null, // === PONER AQUI IMAGEN DE CLOSTRIDIUM BOTULINUM ===
  b035: null, // === PONER AQUI IMAGEN DE ENTEROBACTER CLOACAE ===
  b036: null, // === PONER AQUI IMAGEN DE SERRATIA MARCESCENS ===
  b037: null, // === PONER AQUI IMAGEN DE MORGANELLA MORGANII ===
  b038: null, // === PONER AQUI IMAGEN DE STENOTROPHOMONAS MALTOPHILIA ===
  b039: null, // === PONER AQUI IMAGEN DE MORAXELLA CATARRHALIS ===
  b040: null, // === PONER AQUI IMAGEN DE BORDETELLA PERTUSSIS ===
  b041: null, // === PONER AQUI IMAGEN DE LEGIONELLA PNEUMOPHILA ===
  b042: null, // === PONER AQUI IMAGEN DE YERSINIA ENTEROCOLITICA ===
  b043: null, // === PONER AQUI IMAGEN DE BORRELIA BURGDORFERI ===
  b044: null, // === PONER AQUI IMAGEN DE LEPTOSPIRA INTERROGANS ===
  b045: null, // === PONER AQUI IMAGEN DE RICKETTSIA RICKETTSII ===
  b046: null, // === PONER AQUI IMAGEN DE UREAPLASMA UREALYTICUM ===
};

// VIRUS
export const imagenesVirus: MapaImagenes = {
  v001: null, // === PONER AQUI IMAGEN DE VIRUS DE LA INFLUENZA ===
  v002: null, // === PONER AQUI IMAGEN DE SARS-COV-2 ===
  v003: null, // === PONER AQUI IMAGEN DE VIRUS DEL HERPES SIMPLE (VHS-1 / VHS-2) ===
  v004: null, // === PONER AQUI IMAGEN DE VIRUS VARICELA-ZÓSTER ===
  v005: null, // === PONER AQUI IMAGEN DE VIRUS DE EPSTEIN-BARR ===
  v006: null, // === PONER AQUI IMAGEN DE CITOMEGALOVIRUS ===
  v007: null, // === PONER AQUI IMAGEN DE VIRUS DE LA HEPATITIS B ===
  v008: null, // === PONER AQUI IMAGEN DE VIRUS DE LA HEPATITIS C ===
  v009: null, // === PONER AQUI IMAGEN DE VIRUS DE LA INMUNODEFICIENCIA HUMANA (VIH) ===
  v010: null, // === PONER AQUI IMAGEN DE ROTAVIRUS ===
  v011: null, // === PONER AQUI IMAGEN DE NOROVIRUS ===
  v012: null, // === PONER AQUI IMAGEN DE VIRUS DEL PAPILOMA HUMANO (VPH) ===
  v013: null, // === PONER AQUI IMAGEN DE ADENOVIRUS ===
  v014: null, // === PONER AQUI IMAGEN DE VIRUS DEL DENGUE ===
  v015: null, // === PONER AQUI IMAGEN DE VIRUS RESPIRATORIO SINCITIAL (VRS) ===
  v016: null, // === PONER AQUI IMAGEN DE VIRUS DE PARAINFLUENZA HUMANA ===
  v017: null, // === PONER AQUI IMAGEN DE RINOVIRUS HUMANO ===
  v018: null, // === PONER AQUI IMAGEN DE VIRUS DE LA HEPATITIS A ===
  v019: null, // === PONER AQUI IMAGEN DE VIRUS DE LA HEPATITIS E ===
  v020: null, // === PONER AQUI IMAGEN DE VIRUS DE LA RABIA ===
  v021: null, // === PONER AQUI IMAGEN DE PARVOVIRUS B19 ===
  v022: null, // === PONER AQUI IMAGEN DE VIRUS DEL ZIKA ===
  v023: null, // === PONER AQUI IMAGEN DE VIRUS DEL CHIKUNGUNYA ===
  v024: null, // === PONER AQUI IMAGEN DE VIRUS DE LA FIEBRE AMARILLA ===
};

// HONGOS
export const imagenesHongos: MapaImagenes = {
  h001: null, // === PONER AQUI IMAGEN DE CANDIDA ALBICANS ===
  h002: null, // === PONER AQUI IMAGEN DE CRYPTOCOCCUS NEOFORMANS ===
  h003: null, // === PONER AQUI IMAGEN DE ASPERGILLUS FUMIGATUS ===
  h004: null, // === PONER AQUI IMAGEN DE TRICHOPHYTON RUBRUM ===
  h005: null, // === PONER AQUI IMAGEN DE MICROSPORUM CANIS ===
  h006: null, // === PONER AQUI IMAGEN DE HISTOPLASMA CAPSULATUM ===
  h007: null, // === PONER AQUI IMAGEN DE MALASSEZIA FURFUR ===
  h008: null, // === PONER AQUI IMAGEN DE SPOROTHRIX SCHENCKII ===
  h009: null, // === PONER AQUI IMAGEN DE CANDIDA GLABRATA ===
  h010: null, // === PONER AQUI IMAGEN DE CANDIDA KRUSEI ===
  h011: null, // === PONER AQUI IMAGEN DE CANDIDA AURIS ===
  h012: null, // === PONER AQUI IMAGEN DE CRYPTOCOCCUS GATTII ===
  h013: null, // === PONER AQUI IMAGEN DE COCCIDIOIDES IMMITIS ===
  h014: null, // === PONER AQUI IMAGEN DE PARACOCCIDIOIDES BRASILIENSIS ===
  h015: null, // === PONER AQUI IMAGEN DE ASPERGILLUS FLAVUS ===
  h016: null, // === PONER AQUI IMAGEN DE RHIZOPUS SPP. ===
  h017: null, // === PONER AQUI IMAGEN DE PNEUMOCYSTIS JIROVECII ===
  h018: null, // === PONER AQUI IMAGEN DE TRICHOPHYTON MENTAGROPHYTES ===
};

// PARASITOS
export const imagenesParasitos: MapaImagenes = {
  p001: null, // === PONER AQUI IMAGEN DE ENTAMOEBA HISTOLYTICA ===
  p002: null, // === PONER AQUI IMAGEN DE GIARDIA DUODENALIS (LAMBLIA) ===
  p003: null, // === PONER AQUI IMAGEN DE TRICHOMONAS VAGINALIS ===
  p004: null, // === PONER AQUI IMAGEN DE PLASMODIUM FALCIPARUM ===
  p005: null, // === PONER AQUI IMAGEN DE TOXOPLASMA GONDII ===
  p006: null, // === PONER AQUI IMAGEN DE ASCARIS LUMBRICOIDES ===
  p007: null, // === PONER AQUI IMAGEN DE ENTEROBIUS VERMICULARIS ===
  p008: null, // === PONER AQUI IMAGEN DE TAENIA SOLIUM ===
  p009: null, // === PONER AQUI IMAGEN DE PLASMODIUM VIVAX ===
  p010: null, // === PONER AQUI IMAGEN DE STRONGYLOIDES STERCORALIS ===
  p011: null, // === PONER AQUI IMAGEN DE ANCYLOSTOMA DUODENALE ===
  p012: null, // === PONER AQUI IMAGEN DE NECATOR AMERICANUS ===
  p013: null, // === PONER AQUI IMAGEN DE TRICHURIS TRICHIURA ===
  p014: null, // === PONER AQUI IMAGEN DE TAENIA SAGINATA ===
  p015: null, // === PONER AQUI IMAGEN DE SCHISTOSOMA MANSONI ===
  p016: null, // === PONER AQUI IMAGEN DE ECHINOCOCCUS GRANULOSUS ===
  p017: null, // === PONER AQUI IMAGEN DE CRYPTOSPORIDIUM SPP. ===
  p018: null, // === PONER AQUI IMAGEN DE BALANTIDIUM COLI ===
};

// PRUEBAS DE LABORATORIO / BIOQUIMICAS
export const imagenesPruebas: MapaImagenes = {
  catalasa: null, // === PONER AQUI IMAGEN DE CATALASA ===
  coagulasa: null, // === PONER AQUI IMAGEN DE COAGULASA ===
  oxidasa: null, // === PONER AQUI IMAGEN DE OXIDASA ===
  dnasa: null, // === PONER AQUI IMAGEN DE DNASA ===
  ureasa: null, // === PONER AQUI IMAGEN DE UREASA ===
  indol: null, // === PONER AQUI IMAGEN DE INDOL ===
  citrato: null, // === PONER AQUI IMAGEN DE CITRATO (SIMMONS) ===
  tsi: null, // === PONER AQUI IMAGEN DE TSI (TRIPLE AZÚCAR HIERRO) ===
  pyr: null, // === PONER AQUI IMAGEN DE PYR ===
  "bilis-esculina": null, // === PONER AQUI IMAGEN DE BILIS ESCULINA ===
  novobiocina: null, // === PONER AQUI IMAGEN DE NOVOBIOCINA ===
  optoquina: null, // === PONER AQUI IMAGEN DE OPTOQUINA ===
  bacitracina: null, // === PONER AQUI IMAGEN DE BACITRACINA ===
  hemolisis: null, // === PONER AQUI IMAGEN DE HEMÓLISIS EN AGAR SANGRE ===
  "ziehl-neelsen": null, // === PONER AQUI IMAGEN DE ZIEHL-NEELSEN ===
  gram: null, // === PONER AQUI IMAGEN DE TINCIÓN DE GRAM ===
  koh: null, // === PONER AQUI IMAGEN DE KOH (HIDRÓXIDO DE POTASIO) ===
  "tinta-china": null, // === PONER AQUI IMAGEN DE TINTA CHINA ===
  sim: null, // === PONER AQUI IMAGEN DE SIM (SULFURO-INDOL-MOTILIDAD) ===
  mio: null, // === PONER AQUI IMAGEN DE MIO (MOTILIDAD-INDOL-ORNITINA) ===
  lia: null, // === PONER AQUI IMAGEN DE LIA (LISINA HIERRO AGAR) ===
  mr: null, // === PONER AQUI IMAGEN DE ROJO DE METILO (MR) ===
  vp: null, // === PONER AQUI IMAGEN DE VOGES-PROSKAUER (VP) ===
  malonato: null, // === PONER AQUI IMAGEN DE MALONATO ===
  onpg: null, // === PONER AQUI IMAGEN DE ONPG (ORTO-NITROFENIL-Β-D-GALACTOPIRANÓSIDO) ===
  fenilalanina: null, // === PONER AQUI IMAGEN DE FENILALANINA DESAMINASA (PDA) ===
  lisina: null, // === PONER AQUI IMAGEN DE LISINA DESCARBOXILASA (LDC) ===
  ornitina: null, // === PONER AQUI IMAGEN DE ORNITINA DESCARBOXILASA (ODC) ===
  arginina: null, // === PONER AQUI IMAGEN DE ARGININA DIHIDROLASA (ADH) ===
  gelatinasa: null, // === PONER AQUI IMAGEN DE GELATINASA ===
  nitratos: null, // === PONER AQUI IMAGEN DE REDUCCIÓN DE NITRATOS ===
  camp: null, // === PONER AQUI IMAGEN DE CAMP ===
  "solubilidad-bilis": null, // === PONER AQUI IMAGEN DE SOLUBILIDAD EN BILIS ===
};

// MEDIOS DE CULTIVO
export const imagenesMedios: MapaImagenes = {
  "agar-sangre": null, // === PONER AQUI IMAGEN DE AGAR SANGRE ===
  "agar-chocolate": null, // === PONER AQUI IMAGEN DE AGAR CHOCOLATE ===
  macconkey: null, // === PONER AQUI IMAGEN DE AGAR MACCONKEY ===
  cled: null, // === PONER AQUI IMAGEN DE AGAR CLED ===
  emb: null, // === PONER AQUI IMAGEN DE AGAR EMB (EOSINA-AZUL DE METILENO) ===
  "manitol-salado": null, // === PONER AQUI IMAGEN DE AGAR MANITOL SALADO ===
  cetrimida: null, // === PONER AQUI IMAGEN DE AGAR CETRIMIDA ===
  "thayer-martin": null, // === PONER AQUI IMAGEN DE AGAR THAYER-MARTIN ===
  xld: null, // === PONER AQUI IMAGEN DE AGAR XLD ===
  hektoen: null, // === PONER AQUI IMAGEN DE AGAR HEKTOEN ===
  ss: null, // === PONER AQUI IMAGEN DE AGAR SS (SALMONELLA-SHIGELLA) ===
  tcbs: null, // === PONER AQUI IMAGEN DE AGAR TCBS ===
  "lowenstein-jensen": null, // === PONER AQUI IMAGEN DE AGAR LOWENSTEIN-JENSEN ===
  sabouraud: null, // === PONER AQUI IMAGEN DE AGAR SABOURAUD ===
  "mueller-hinton": null, // === PONER AQUI IMAGEN DE AGAR MUELLER-HINTON ===
  "campy-bap": null, // === PONER AQUI IMAGEN DE AGAR CAMPY-BAP ===
  middlebrook: null, // === PONER AQUI IMAGEN DE MEDIO DE MIDDLEBROOK (7H10/7H11) ===
  "agar-cna": null, // === PONER AQUI IMAGEN DE AGAR CNA (COLISTINA-ÁCIDO NALIDÍXICO) ===
  "agar-candida": null, // === PONER AQUI IMAGEN DE AGAR CROMOGÉNICO PARA CANDIDA (CHROMAGAR CANDIDA) ===
};

// PROCEDIMIENTOS
export const imagenesProcedimientos: MapaImagenes = {
  proc001: null, // === PONER AQUI IMAGEN DE HEMOCULTIVO ===
  proc002: null, // === PONER AQUI IMAGEN DE UROCULTIVO ===
  proc003: null, // === PONER AQUI IMAGEN DE COPROCULTIVO ===
  proc004: null, // === PONER AQUI IMAGEN DE CULTIVO DE SECRECIÓN FARÍNGEA ===
  proc005: null, // === PONER AQUI IMAGEN DE TINCIÓN DE GRAM ===
  proc006: null, // === PONER AQUI IMAGEN DE ZIEHL-NEELSEN (BACILOSCOPIA) ===
  proc007: null, // === PONER AQUI IMAGEN DE ANTIBIOGRAMA POR DIFUSIÓN EN DISCO (KIRBY-BAUER) ===
  proc008: null, // === PONER AQUI IMAGEN DE EXAMEN DIRECTO CON KOH ===
  proc009: null, // === PONER AQUI IMAGEN DE CULTIVO MICOLÓGICO EN AGAR SABOURAUD ===
  proc010: null, // === PONER AQUI IMAGEN DE PRUEBA DEL TUBO GERMINATIVO ===
  proc011: null, // === PONER AQUI IMAGEN DE EXAMEN DIRECTO CON SOLUCIÓN SALINA Y LUGOL ===
  proc012: null, // === PONER AQUI IMAGEN DE TÉCNICA DE GRAHAM (CINTA ADHESIVA PERIANAL) ===
  proc013: null, // === PONER AQUI IMAGEN DE MÉTODO DE CONCENTRACIÓN POR SEDIMENTACIÓN (TIPO RITCHIE/FAUST) ===
  proc014: null, // === PONER AQUI IMAGEN DE GOTA GRUESA Y GOTA FINA (HEMOPARÁSITOS) ===
  proc015: null, // === PONER AQUI IMAGEN DE TOMA Y TRANSPORTE DE MUESTRAS MICROBIOLÓGICAS ===
  proc016: null, // === PONER AQUI IMAGEN DE PRINCIPIOS DE BIOSEGURIDAD EN EL LABORATORIO DE MICROBIOLOGÍA ===
};

// Mapa combinado de organismos (bacterias + virus + hongos + parasitos)
export const imagenesOrganismos: MapaImagenes = {
  ...imagenesBacterias,
  ...imagenesVirus,
  ...imagenesHongos,
  ...imagenesParasitos,
};

// Devuelve la imagen manual de un organismo, prueba, medio o procedimiento si existe.
export function getImagen(mapa: MapaImagenes, id: string): string | null {
  return mapa[id] ?? null;
}
