import type { InformeLaboratorio, ResultadoLaboratorio, LabConfig } from "@/lib/types";
import EstadoBadge from "./EstadoBadge";
import FirmaSello from "./FirmaSello";

function formatearFecha(fecha: string): string {
  try {
    return new Date(fecha + "T00:00:00").toLocaleDateString("es", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return fecha;
  }
}

export default function InformeImprimible({
  informe,
  items,
  labConfig
}: {
  informe: InformeLaboratorio;
  items: ResultadoLaboratorio[];
  labConfig: LabConfig | null;
}) {
  const laboratorio = labConfig?.laboratorio_nombre?.trim() || "BacteriDex — Laboratorio Clínico";

  return (
    <div className="informe-imprimible mx-auto max-w-3xl bg-white p-8 text-base-950 print:p-0 print:shadow-none">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 border-b-2 border-cian-dim pb-4">
        <div className="flex items-center gap-3">
          {labConfig?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={labConfig.logo_url} alt={laboratorio} className="h-12 w-12 object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/icon.svg" alt={laboratorio} className="h-12 w-12 object-contain" />
          )}
          <div>
            <p className="font-display text-lg font-bold text-base-950">{laboratorio}</p>
            {labConfig?.laboratorio_info && <p className="text-xs text-base-700">{labConfig.laboratorio_info}</p>}
          </div>
        </div>
        <div className="text-right text-xs text-base-700">
          <p><span className="font-semibold">Fecha:</span> {formatearFecha(informe.fecha)}</p>
          {informe.codigo_muestra && <p><span className="font-semibold">Código de muestra:</span> {informe.codigo_muestra}</p>}
        </div>
      </div>

      {/* Datos de la muestra / paciente */}
      {(informe.paciente_nombre || informe.paciente_edad || informe.paciente_sexo) && (
        <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-mist-200 bg-mist-100/40 p-3 text-xs text-base-800">
          {informe.paciente_nombre && (
            <div><p className="font-semibold uppercase tracking-wide text-base-700">Paciente</p><p>{informe.paciente_nombre}</p></div>
          )}
          {informe.paciente_edad && (
            <div><p className="font-semibold uppercase tracking-wide text-base-700">Edad</p><p>{informe.paciente_edad}</p></div>
          )}
          {informe.paciente_sexo && (
            <div><p className="font-semibold uppercase tracking-wide text-base-700">Sexo</p><p>{informe.paciente_sexo}</p></div>
          )}
        </div>
      )}

      {/* Tabla de resultados */}
      <table className="mt-6 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b-2 border-base-950 text-left text-xs uppercase tracking-wide text-base-700">
            <th className="py-2 pr-2">Análisis</th>
            <th className="py-2 pr-2">Resultado</th>
            <th className="py-2 pr-2">Unidad</th>
            <th className="py-2 pr-2">Valores de referencia</th>
            <th className="py-2 pr-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={5} className="py-6 text-center text-mist-400">Este informe todavía no tiene resultados.</td></tr>
          ) : (
            items.map((it) => (
              <tr key={it.id} className="border-b border-mist-200">
                <td className="py-2 pr-2 font-medium">{it.analisis_nombre}</td>
                <td className="py-2 pr-2">{it.resultado || "—"}</td>
                <td className="py-2 pr-2 text-base-700">{it.unidad || "—"}</td>
                <td className="py-2 pr-2 text-base-700">{it.rango_referencia || "—"}</td>
                <td className="py-2 pr-2"><EstadoBadge estado={it.estado} /></td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {informe.observaciones_generales && (
        <div className="mt-4 rounded-lg border border-mist-200 bg-mist-100/40 p-3 text-xs text-base-800">
          <p className="font-semibold uppercase tracking-wide text-base-700">Observaciones</p>
          <p className="mt-1 whitespace-pre-line">{informe.observaciones_generales}</p>
        </div>
      )}

      <p className="mt-6 text-[10px] italic text-mist-400">
        Contenido generado con fines educativos de Laboratorio Clínico. No sustituye protocolos
        institucionales ni indicación médica. Los valores de referencia son orientativos — el
        inserto vigente del fabricante del reactivo tiene prioridad.
      </p>

      {/* Firma y sello */}
      <div className="mt-10 flex justify-end">
        <FirmaSello labConfig={labConfig} />
      </div>
    </div>
  );
}
