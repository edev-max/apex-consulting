-- 10-allow-cancelled-budgets.sql
-- Permite marcar presupuestos como 'cancelled' para que NO cuenten como cuenta por cobrar.
-- Cómo ejecutarlo: Supabase -> Dashboard -> SQL Editor -> New query -> pega esto -> Run.

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_status_check;

ALTER TABLE budgets
  ADD CONSTRAINT budgets_status_check
  CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled'));
