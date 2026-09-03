-- ============================================================
-- BacteriDex — Fase 4: Registros
-- ============================================================
-- No se crea una tabla nueva: se reutiliza public.resultados_laboratorio
-- (Fase 1) para no duplicar sistemas. La única diferencia es que un
-- "registro" (Fase 4) no necesita pertenecer a un informe imprimible
-- (Fase 1) — por ejemplo, el resultado de una calculadora (Fase 3) que el
-- usuario quiere guardar en su historial sin generar un documento formal.
--
-- Este bloque solo permite que informe_id sea NULL en ese caso. Las
-- políticas de RLS ya existentes (auth.uid() = user_id) siguen aplicando
-- sin cambios: cada usuario ve y administra únicamente sus propios
-- registros, tengan o no informe asociado.
alter table public.resultados_laboratorio
  alter column informe_id drop not null;

create index if not exists idx_resultados_laboratorio_usuario_fecha
  on public.resultados_laboratorio (user_id, fecha desc);
