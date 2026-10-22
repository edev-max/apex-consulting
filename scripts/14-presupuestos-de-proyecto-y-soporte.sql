-- 14 · Presupuestos de proyecto con soporte después de la entrega.
-- Solo agrega columnas: no borra tablas, columnas ni filas.
--
-- Un presupuesto de proyecto incluye 30 días de soporte desde la entrega
-- (SUPPORT_DAYS en lib/types.ts). Al entregar se registra la fecha y se envía
-- al cliente la constancia de entrega y soporte para que la firme.

alter table public.budgets
  add column if not exists is_project boolean not null default false,
  add column if not exists support_start date,
  add column if not exists support_end date;

comment on column public.budgets.is_project is 'Presupuesto de proyecto: incluye soporte después de la entrega';
comment on column public.budgets.support_start is 'Día de la entrega, cuando arranca el soporte; null = todavía no se entrega';
comment on column public.budgets.support_end is 'Último día del soporte incluido (por defecto, entrega + 30 días)';

-- null = el texto original (DEFAULT_SUPPORT_TERMS en lib/types.ts). Una línea en
-- blanco separa párrafos, **así** va en negrita, {soporte} = días de soporte y
-- {revision} = días antes del cierre para la revisión.
alter table public.company_settings
  add column if not exists support_terms text;

comment on column public.company_settings.support_terms is 'Condiciones del soporte de los presupuestos de proyecto; null = texto original. Admite {soporte}, {revision} y **negrita**';
