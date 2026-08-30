"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export interface FavoritoNube {
  organismo_id: string;
  categoria: string;
  created_at: string;
}

// Favoritos guardados en Supabase, ligados a la cuenta del usuario.
// Solo guarda una referencia (id + categoria) al microorganismo, nunca duplica
// la ficha científica, que sigue viviendo exclusivamente en /data.
export function useFavoritosNube() {
  const { user } = useAuth();
  const [favoritos, setFavoritos] = useState<FavoritoNube[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user) {
      setFavoritos([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    const { data, error } = await supabase
      .from("favorites")
      .select("organismo_id, categoria, created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setError("No se pudieron cargar tus favoritos.");
    } else {
      setFavoritos(data ?? []);
      setError(null);
    }
    setCargando(false);
  }, [user]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const esFavorito = useCallback(
    (organismoId: string) => favoritos.some((f) => f.organismo_id === organismoId),
    [favoritos]
  );

  const alternar = useCallback(
    async (organismoId: string, categoria: string) => {
      const supabase = getSupabaseClient();
      if (!supabase || !user) return { error: "Necesitas iniciar sesión." };

      if (esFavorito(organismoId)) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("organismo_id", organismoId);
        if (error) return { error: "No se pudo quitar el favorito." };
        setFavoritos((f) => f.filter((x) => x.organismo_id !== organismoId));
        return { error: null };
      }

      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, organismo_id: organismoId, categoria });
      if (error) return { error: "No se pudo guardar el favorito." };
      setFavoritos((f) => [{ organismo_id: organismoId, categoria, created_at: new Date().toISOString() }, ...f]);
      return { error: null };
    },
    [user, esFavorito]
  );

  return { favoritos, cargando, error, esFavorito, alternar, recargar };
}

// Registra en el historial personal que el usuario visitó un microorganismo.
// No bloquea la interfaz ni genera errores visibles si falla.
export async function registrarVisita(userId: string, organismoId: string, categoria: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase
    .from("history")
    .upsert(
      { user_id: userId, organismo_id: organismoId, categoria, visitado_en: new Date().toISOString() },
      { onConflict: "user_id,organismo_id" }
    );
}
