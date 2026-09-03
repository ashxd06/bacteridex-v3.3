"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Download, Archive } from "lucide-react";
import { listarInsertos, urlPublicaInserto, type InsertoFila } from "@/lib/insertos";
import { getAnalisis } from "@/lib/data";

export default function InsertosPage() {
  const [insertos, setInsertos] = useState<InsertoFila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarArchivados, setMostrarArchivados] = useState(false);

  useEffect(() => {
    listarInsertos().then((data) => {
      setInsertos(data);
      setCargando(false);
    });
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return insertos.filter((i) => {
      if (!mostrarArchivados && i.estado === "archivado") return false;
      if (!q) return true;
      return i.nombre.toLowerCase().includes(q) || i.fabricante.toLowerCase().includes(q);
    });
  }, [insertos, busqueda, mostrarArchivados]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="section-eyebrow">📄 Biblioteca de insertos</p>
        <h1 className="font-display text-2xl font-bold">Insertos de reactivos</h1>
        <p className="text-sm text-mist-400">
          Documentos originales de fabricante. Contenido de acceso público — no necesitas iniciar
          sesión para consultarlos.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o fabricante…"
          className="focus-ring w-full rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm placeholder:text-mist-400 sm:max-w-xs"
        />
        <label className="flex items-center gap-2 text-xs text-mist-400">
          <input
            type="checkbox"
            checked={mostrarArchivados}
            onChange={(e) => setMostrarArchivados(e.target.checked)}
          />
          Mostrar versiones archivadas
        </label>
      </div>

      {cargando ? (
        <p className="text-sm text-mist-400">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <div className="lab-card p-8 text-center text-mist-400">
          {insertos.length === 0
            ? "Todavía no hay insertos cargados. Un administrador puede agregarlos desde el panel."
            : "No hay insertos que coincidan con la búsqueda."}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((i) => {
            const analisis = i.analisis_id ? getAnalisis(i.analisis_id) : undefined;
            const url = urlPublicaInserto(i.storage_path);
            return (
              <div key={i.id} className="lab-card flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <FileText className="h-5 w-5 shrink-0 text-bio" aria-hidden="true" />
                  {i.estado === "archivado" && (
                    <span className="chip flex items-center gap-1 text-[10px]">
                      <Archive className="h-3 w-3" aria-hidden="true" /> Archivado
                    </span>
                  )}
                </div>
                <p className="font-display font-semibold">{i.nombre}</p>
                <p className="text-xs text-mist-400">
                  {i.fabricante}
                  {i.version ? ` · v${i.version}` : ""}
                  {i.fecha ? ` · ${new Date(i.fecha).toLocaleDateString("es")}` : ""}
                </p>
                {analisis && (
                  <Link href={`/analisis/${analisis.id}`} className="chip w-fit hover:border-bio hover:text-bio">
                    {analisis.nombre}
                  </Link>
                )}
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring mt-1 flex w-fit items-center gap-1.5 rounded-lg border border-base-600 px-3 py-1.5 text-xs hover:border-bio hover:text-bio"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> Ver PDF
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
