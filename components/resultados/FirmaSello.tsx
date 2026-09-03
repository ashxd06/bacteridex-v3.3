import type { LabConfig } from "@/lib/types";

// Composición "física": el sello va DETRÁS (z-index inferior, rotado y con
// transparencia, como un sello de goma) y la firma va DELANTE (z-index
// superior), cruzando parcialmente la esquina inferior derecha del sello —
// ver el diagrama ASCII del pedido. Si el admin todavía no configuró una
// imagen real de firma/sello (lib/labConfig.ts), se muestra un marcador de
// posición (no se inventan datos reales).
export default function FirmaSello({ labConfig }: { labConfig: LabConfig | null }) {
  const nombre = labConfig?.profesional_nombre?.trim();
  const profesion = labConfig?.profesional_profesion?.trim();
  const registro = labConfig?.profesional_registro?.trim();
  const cargo = labConfig?.profesional_cargo?.trim();
  const laboratorio = labConfig?.laboratorio_nombre?.trim() || "BacteriDex — Laboratorio Clínico";

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="relative h-36 w-64">
        {/* SELLO — capa inferior */}
        {labConfig?.sello_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={labConfig.sello_url}
            alt="Sello del laboratorio"
            className="absolute left-0 top-0 z-0 h-32 w-56 -rotate-6 object-contain opacity-70"
          />
        ) : (
          <div className="absolute left-0 top-0 z-0 flex h-32 w-56 -rotate-6 flex-col items-center justify-center gap-0.5 rounded-md border-2 border-dashed border-cian/50 bg-cian/5 p-2 text-center">
            <p className="font-display text-[10px] font-bold uppercase leading-tight tracking-wide text-cian">
              {laboratorio}
            </p>
            {nombre && <p className="text-[9px] font-semibold leading-tight text-mist-200">{nombre}</p>}
            {registro && <p className="text-[8px] leading-tight text-mist-400">Reg. {registro}</p>}
          </div>
        )}

        {/* FIRMA — capa superior, cruza la esquina inferior derecha del sello */}
        <div className="absolute bottom-0 right-0 z-10 flex h-16 w-44 items-end justify-center">
          {labConfig?.firma_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={labConfig.firma_url} alt="Firma" className="h-full w-full object-contain" />
          ) : (
            <p
              className="rotate-[-4deg] text-3xl text-mist-100"
              style={{ fontFamily: "var(--font-display), cursive", fontStyle: "italic" }}
            >
              {nombre ? nombre.split(" ").map((p) => p[0]).slice(0, 2).join(".") + "." : "Firma"}
            </p>
          )}
        </div>
      </div>

      <div className="w-64 border-t border-base-600 pt-2 text-right text-xs text-mist-300">
        {nombre && <p className="font-semibold">{nombre}</p>}
        {profesion && <p>{profesion}</p>}
        {registro && <p>Registro profesional: {registro}</p>}
        {cargo && <p>{cargo}</p>}
        {!nombre && <p className="text-mist-400">Profesional pendiente de configurar en /admin/config</p>}
      </div>
    </div>
  );
}
