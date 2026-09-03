"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { evaluarFormula } from "@/lib/calc/evaluar";
import type { Calculadora } from "@/lib/types";

export default function CalculadoraClient({ calculadora }: { calculadora: Calculadora }) {
  const { user, abrirModal } = useAuth();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<{ valor: number } | { error: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const pendiente = !calculadora.formula.trim();

  function calcular() {
    const numeros: Record<string, number> = {};
    for (const v of calculadora.variables) {
      const bruto = valores[v.id];
      const n = Number(bruto);
      if (bruto === undefined || bruto.trim() === "" || Number.isNaN(n)) {
        setResultado({ error: `Ingresa un valor numérico para "${v.label}".` });
        return;
      }
      numeros[v.id] = n;
    }
    const r = evaluarFormula(calculadora.formula, numeros);
    setResultado(r.ok ? { valor: r.valor! } : { error: r.error! });
    setGuardado(false);
  }

  // Conecta CALCULADORA → RESULTADO → REGISTRO (Fase 4): guarda el
  // resultado calculado como un registro suelto (sin informe formal) en
  // resultados_laboratorio, reutilizando la misma tabla que /resultados y
  // /registros — no se duplica ningún sistema de almacenamiento.
  async function guardarComoRegistro() {
    if (!user || !resultado || "error" in resultado) return;
    setGuardando(true);
    const supabase = getSupabaseClient();
    if (!supabase) { setGuardando(false); return; }
    const valorTexto = Number.isInteger(resultado.valor) ? String(resultado.valor) : resultado.valor.toFixed(2);
    const { error } = await supabase.from("resultados_laboratorio").insert({
      informe_id: null,
      user_id: user.id,
      created_by: user.id,
      fecha: new Date().toISOString().slice(0, 10),
      analisis_id: calculadora.analisisId,
      analisis_nombre: calculadora.nombre,
      resultado: valorTexto,
      unidad: calculadora.unidadResultado || null,
      observaciones: calculadora.interpretacion || null,
      estado: "pendiente"
    });
    setGuardando(false);
    if (!error) setGuardado(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">{calculadora.nombre}</h1>
        {calculadora.descripcion && <p className="mt-1 text-sm text-mist-400">{calculadora.descripcion}</p>}
      </div>

      {pendiente ? (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          Esta calculadora todavía no tiene una fórmula cargada por un administrador. Vuelve más
          adelante.
        </div>
      ) : (
        <>
          <div className="lab-card flex flex-col gap-3 p-5">
            {calculadora.variables.map((v) => (
              <label key={v.id} className="flex flex-col gap-1 text-sm">
                <span className="text-mist-300">
                  {v.label} {v.unidad && <span className="text-xs text-mist-400">({v.unidad})</span>}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={valores[v.id] ?? ""}
                  onChange={(e) => setValores({ ...valores, [v.id]: e.target.value })}
                  className="focus-ring rounded-lg border border-base-600 bg-base-800 px-3 py-2 text-sm"
                />
              </label>
            ))}
            <button onClick={calcular} className="focus-ring mt-2 w-fit rounded-lg bg-bio px-5 py-2 text-sm font-medium text-base-950 hover:bg-bio-glow">
              Calcular
            </button>
          </div>

          {resultado && (
            <div
              className={`lab-card p-5 ${"error" in resultado ? "border-alert/50" : "border-bio/50"}`}
            >
              {"error" in resultado ? (
                <p className="text-sm text-alert">{resultado.error}</p>
              ) : (
                <>
                  <p className="section-eyebrow">Resultado</p>
                  <p className="font-display text-3xl font-bold text-bio">
                    {Number.isInteger(resultado.valor) ? resultado.valor : resultado.valor.toFixed(2)}{" "}
                    <span className="text-base font-normal text-mist-300">{calculadora.unidadResultado}</span>
                  </p>
                  {calculadora.interpretacion && <p className="mt-2 text-sm text-mist-300">{calculadora.interpretacion}</p>}

                  {user ? (
                    guardado ? (
                      <p className="mt-3 text-xs text-bio">
                        Guardado en tu <Link href="/registros" className="underline">historial de registros</Link>.
                      </p>
                    ) : (
                      <button
                        onClick={guardarComoRegistro}
                        disabled={guardando}
                        className="focus-ring mt-3 chip hover:border-bio hover:text-bio disabled:opacity-60"
                      >
                        {guardando ? "Guardando…" : "💾 Guardar como registro"}
                      </button>
                    )
                  ) : (
                    <p className="mt-3 text-xs text-mist-400">
                      <button onClick={() => abrirModal("login")} className="underline hover:text-bio">
                        Inicia sesión
                      </button>{" "}
                      para guardar este resultado en tu historial.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {calculadora.notaAdvertencia && (
        <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-xs text-mist-200">
          <strong className="text-gold">Nota:</strong> {calculadora.notaAdvertencia}
        </div>
      )}

      {calculadora.fuentes.length > 0 && (
        <div>
          <p className="section-eyebrow mb-2">📚 Fuentes</p>
          <div className="flex flex-wrap gap-2">
            {calculadora.fuentes.map((f) => (<span key={f} className="chip">{f}</span>))}
          </div>
        </div>
      )}
    </div>
  );
}
