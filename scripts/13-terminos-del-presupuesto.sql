-- 13 · Términos y condiciones del presupuesto editables desde Ajustes.
-- Solo agrega una columna: no borra tablas, columnas ni filas.
--
-- null = el texto original (DEFAULT_BUDGET_TERMS en lib/types.ts). Una línea en
-- blanco separa párrafos, **así** va en negrita, {dias} se llena con due_days y
-- {anticipo} con el anticipo de cada presupuesto ("el 50 %").

alter table public.company_settings
  add column if not exists budget_terms text;

comment on column public.company_settings.budget_terms is 'Términos y condiciones del presupuesto; null = texto original. Admite {dias}, {anticipo} y **negrita**';
