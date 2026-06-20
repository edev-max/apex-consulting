-- 10-allow-cancelled-budgets.sql
-- Permite marcar presupuestos como 'cancelled' para que NO cuenten como cuenta por cobrar.
-- Cómo ejecutarlo: Supabase -> Dashboard -> SQL Editor -> New query -> pega esto -> Run.
-- Versión robusta: quita CUALQUIER restricción CHECK sobre 'status' (sea cual sea su nombre) y la recrea.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'budgets'::regclass AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE 'ALTER TABLE budgets DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP;
END $$;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_status_check
  CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));

-- Verificación: debe mostrar la definición incluyendo 'cancelled'
SELECT pg_get_constraintdef(oid) AS definicion
FROM pg_constraint
WHERE conrelid = 'budgets'::regclass AND conname = 'budgets_status_check';
