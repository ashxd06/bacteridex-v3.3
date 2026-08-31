"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export interface LabItem {
  id: string;
  examen: string;
  resultado: string;
  unidad: string;
  referencia: string;
  estado: string; // "NORMAL" | "ALTO" | "BAJO" | "POSITIVO" | "NEGATIVO" | ""
}

interface DynamicTableProps {
  items: LabItem[];
  setItems: React.Dispatch<React.SetStateAction<LabItem[]>>;
}

export default function DynamicTable({ items, setItems }: DynamicTableProps) {
  const [nuevoExamen, setNuevoExamen] = useState("");
  const [nuevoResultado, setNuevoResultado] = useState("");
  const [nuevaUnidad, setNuevaUnidad] = useState("");
  const [nuevaReferencia, setNuevaReferencia] = useState("");
  const [nuevoEstado, setNuevoEstado] = useState("");

  const calcularEstado = (resultado: string, referencia: string) => {
    if (!resultado || !referencia) return "";
    
    const resVal = parseFloat(resultado.replace(",", "."));
    if (isNaN(resVal)) return "";

    const ref = referencia.trim();

    // Formato "X - Y" o "X-Y"
    const rangoMatch = ref.match(/^([\d\.]+)\s*-\s*([\d\.]+)$/);
    if (rangoMatch) {
      const min = parseFloat(rangoMatch[1]);
      const max = parseFloat(rangoMatch[2]);
      if (resVal < min) return "BAJO";
      if (resVal > max) return "ALTO";
      return "NORMAL";
    }

    // Formato "<X"
    const menorMatch = ref.match(/^<\s*([\d\.]+)$/);
    if (menorMatch) {
      const limit = parseFloat(menorMatch[1]);
      if (resVal < limit) return "NORMAL";
      return "ALTO";
    }

    // Formato ">X"
    const mayorMatch = ref.match(/^>\s*([\d\.]+)$/);
    if (mayorMatch) {
      const limit = parseFloat(mayorMatch[1]);
      if (resVal > limit) return "NORMAL";
      return "BAJO";
    }

    return "";
  };

  const handleAgregar = () => {
    if (!nuevoExamen.trim()) return;

    // Calcular estado automático si no se ingresó manualmente
    let estadoFinal = nuevoEstado;
    if (!estadoFinal) {
      estadoFinal = calcularEstado(nuevoResultado, nuevaReferencia) || "NORMAL"; // Fallback a NORMAL si no se detecta
    }

    const newItem: LabItem = {
      id: crypto.randomUUID(),
      examen: nuevoExamen,
      resultado: nuevoResultado,
      unidad: nuevaUnidad,
      referencia: nuevaReferencia,
      estado: estadoFinal,
    };

    setItems([...items, newItem]);
    
    // Resetear formulario
    setNuevoExamen("");
    setNuevoResultado("");
    // Mantenemos la unidad y referencia por si el usuario agrega exámenes similares (opcional)
    setNuevaUnidad("");
    setNuevaReferencia("");
    setNuevoEstado("");
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof LabItem, value: string) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      
      // Auto-recalcular estado si cambia el resultado o la referencia
      if (field === 'resultado' || field === 'referencia') {
         const autoEstado = calcularEstado(updated.resultado, updated.referencia);
         if (autoEstado) {
             updated.estado = autoEstado;
         }
      }
      return updated;
    }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Formulario de Agregar */}
      <div className="grid grid-cols-1 gap-2 rounded-lg border border-base-700 bg-base-800/50 p-4 sm:grid-cols-6 items-end">
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-mist-400">Examen</label>
          <input
            type="text"
            value={nuevoExamen}
            onChange={(e) => setNuevoExamen(e.target.value)}
            className="lab-input mt-1"
            placeholder="Ej: Glucosa"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-mist-400">Resultado</label>
          <input
            type="text"
            value={nuevoResultado}
            onChange={(e) => {
                setNuevoResultado(e.target.value);
                const auto = calcularEstado(e.target.value, nuevaReferencia);
                if (auto) setNuevoEstado(auto);
            }}
            className="lab-input mt-1"
            placeholder="Ej: 92"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-mist-400">Unidad</label>
          <input
            type="text"
            value={nuevaUnidad}
            onChange={(e) => setNuevaUnidad(e.target.value)}
            className="lab-input mt-1"
            placeholder="Ej: mg/dL"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-mist-400">Valores Ref.</label>
          <input
            type="text"
            value={nuevaReferencia}
            onChange={(e) => {
                setNuevaReferencia(e.target.value);
                const auto = calcularEstado(nuevoResultado, e.target.value);
                if (auto) setNuevoEstado(auto);
            }}
            className="lab-input mt-1"
            placeholder="Ej: 70-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium text-mist-400">Estado (Opcional)</label>
            <select
              value={nuevoEstado}
              onChange={(e) => setNuevoEstado(e.target.value)}
              className="lab-input mt-1 py-2"
            >
              <option value="">Auto / Seleccionar</option>
              <option value="NORMAL">NORMAL</option>
              <option value="ALTO">ALTO</option>
              <option value="BAJO">BAJO</option>
              <option value="POSITIVO">POSITIVO</option>
              <option value="NEGATIVO">NEGATIVO</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleAgregar}
            className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-bio text-base-950 hover:bg-bio-glow"
            title="Agregar Examen"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tabla Dinámica */}
      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-base-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-base-800 text-mist-300">
              <tr>
                <th className="px-4 py-3 font-medium">Examen</th>
                <th className="px-4 py-3 font-medium">Resultado</th>
                <th className="px-4 py-3 font-medium">Unidad</th>
                <th className="px-4 py-3 font-medium">Valores Ref.</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-700 bg-base-900/50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-base-800/50">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.examen}
                      onChange={(e) => updateItem(item.id, "examen", e.target.value)}
                      className="w-full bg-transparent outline-none focus:border-b focus:border-bio"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.resultado}
                      onChange={(e) => updateItem(item.id, "resultado", e.target.value)}
                      className="w-full bg-transparent outline-none focus:border-b focus:border-bio"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.unidad}
                      onChange={(e) => updateItem(item.id, "unidad", e.target.value)}
                      className="w-full bg-transparent outline-none focus:border-b focus:border-bio"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={item.referencia}
                      onChange={(e) => updateItem(item.id, "referencia", e.target.value)}
                      className="w-full bg-transparent outline-none focus:border-b focus:border-bio"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={item.estado}
                      onChange={(e) => updateItem(item.id, "estado", e.target.value)}
                      className={`bg-transparent outline-none font-medium ${
                        item.estado === "ALTO" ? "text-alert" :
                        item.estado === "BAJO" ? "text-yellow-500" :
                        item.estado === "POSITIVO" ? "text-alert" :
                        "text-bio"
                      }`}
                    >
                      <option value="NORMAL" className="text-base-950">NORMAL</option>
                      <option value="ALTO" className="text-base-950">ALTO</option>
                      <option value="BAJO" className="text-base-950">BAJO</option>
                      <option value="POSITIVO" className="text-base-950">POSITIVO</option>
                      <option value="NEGATIVO" className="text-base-950">NEGATIVO</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-mist-500 hover:text-alert"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-base-700 p-8 text-center text-sm text-mist-400">
          No hay exámenes agregados. Completa el formulario de arriba y presiona + para agregar uno.
        </div>
      )}
    </div>
  );
}
