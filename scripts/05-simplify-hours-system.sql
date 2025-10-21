-- Script para simplificar el sistema de horas
-- Elimina las columnas de horas asignadas y restantes, dejando solo consumed_hours

-- Actualizar la tabla clients para eliminar columnas innecesarias
ALTER TABLE clients DROP COLUMN IF EXISTS total_hours;
ALTER TABLE clients DROP COLUMN IF EXISTS remaining_hours;

-- Asegurarse de que consumed_hours existe y tiene valor por defecto
ALTER TABLE clients ALTER COLUMN consumed_hours SET DEFAULT 0;
ALTER TABLE clients ALTER COLUMN consumed_hours SET NOT NULL;

-- Actualizar cualquier valor NULL a 0
UPDATE clients SET consumed_hours = 0 WHERE consumed_hours IS NULL;

-- Comentario: Ahora clients solo tiene:
-- - id
-- - name
-- - email
-- - consumed_hours (horas pendientes de pago)
-- - user_id
-- - created_at
-- - updated_at
