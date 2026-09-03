// Sembrado inicial del CMS: copia /data/bacterias.json, virus.json, hongos.json,
// parasitos.json, analisis.json y procedimientos.json a las tablas
// cms_microorganismos / cms_analisis / cms_procedimientos de Supabase.
//
// Es SEGURO ejecutarlo varias veces: usa upsert por id, así que vuelve a
// escribir los mismos registros sin duplicarlos. NO borra nada que hayas
// creado o editado después desde /admin — si un registro ya existe en
// Supabase, este script lo sobreescribe con la versión del JSON, así que
// solo ejecútalo como paso de arranque inicial (o si de verdad quieres
// reiniciar el contenido a partir del JSON).
//
// Uso:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-cms.mjs
//
// (también puedes crear un archivo .env.local con esas dos variables y
// cargarlo tú mismo, por ejemplo con `node --env-file=.env.local scripts/seed-cms.mjs`)

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

function leerJSON(nombre) {
  return JSON.parse(readFileSync(path.join(dataDir, nombre), "utf-8"));
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function sembrarMicroorganismos() {
  const categorias = {
    bacterias: leerJSON("bacterias.json"),
    virus: leerJSON("virus.json"),
    hongos: leerJSON("hongos.json"),
    parasitos: leerJSON("parasitos.json")
  };

  for (const [categoria, lista] of Object.entries(categorias)) {
    const filas = lista.map((o) => ({
      id: o.id,
      categoria,
      numero: o.numero ?? 0,
      data: o,
      estado: "activo"
    }));
    if (filas.length === 0) continue;
    const { error } = await supabase.from("cms_microorganismos").upsert(filas, { onConflict: "id" });
    if (error) throw new Error(`cms_microorganismos (${categoria}): ${error.message}`);
    console.log(`✓ ${filas.length} en ${categoria}`);
  }
}

async function sembrarAnalisis() {
  const lista = leerJSON("analisis.json");
  const filas = lista.map((a) => ({ id: a.id, categoria: a.categoria, numero: a.numero ?? 0, data: a, estado: "activo" }));
  if (filas.length === 0) return;
  const { error } = await supabase.from("cms_analisis").upsert(filas, { onConflict: "id" });
  if (error) throw new Error(`cms_analisis: ${error.message}`);
  console.log(`✓ ${filas.length} análisis`);
}

async function sembrarProcedimientos() {
  const lista = leerJSON("procedimientos.json");
  const filas = lista.map((p) => ({ id: p.id, categoria: p.categoria, numero: p.numero ?? 0, data: p, estado: "activo" }));
  if (filas.length === 0) return;
  const { error } = await supabase.from("cms_procedimientos").upsert(filas, { onConflict: "id" });
  if (error) throw new Error(`cms_procedimientos: ${error.message}`);
  console.log(`✓ ${filas.length} procedimientos`);
}

try {
  await sembrarMicroorganismos();
  await sembrarAnalisis();
  await sembrarProcedimientos();
  console.log("Sembrado completo.");
} catch (err) {
  console.error("Error durante el sembrado:", err.message);
  process.exit(1);
}
