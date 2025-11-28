-- Script para agregar el campo 'paid' a hour_entries
-- Esto permite rastrear qué horas ya fueron marcadas como pagadas

-- Agregar columna paid a hour_entries
ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;

-- Actualizar registros existentes
UPDATE hour_entries SET paid = FALSE WHERE paid IS NULL;

-- Asegurar que no sea NULL
ALTER TABLE hour_entries ALTER COLUMN paid SET NOT NULL;
ALTER TABLE hour_entries ALTER COLUMN paid SET DEFAULT FALSE;

-- Comentario: Ahora hour_entries tiene:
-- - id
-- - client_id
-- - client_name
-- - date
-- - hours
-- - description
-- - project
-- - paid (nuevo campo para rastrear si ya fue pagado)
-- - user_id
-- - created_at
