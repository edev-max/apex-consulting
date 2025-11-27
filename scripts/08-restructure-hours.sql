-- Script para reestructurar el sistema de horas
-- Agregar campos para asociar horas a presupuestos y tipo de movimiento

-- Agregar columna budget_id a hour_entries para asociar horas a presupuestos
ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS budget_id uuid REFERENCES budgets(id) ON DELETE SET NULL;

-- Agregar columna type para indicar si las horas suman o restan
-- 'add' = horas que suman (trabajo realizado)
-- 'subtract' = horas que restan (ajustes, descuentos, etc.)
ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS type character varying(20) DEFAULT 'add';

-- Agregar columna budget_name para referencia rápida
ALTER TABLE hour_entries ADD COLUMN IF NOT EXISTS budget_name character varying(255);

-- Crear índice para búsquedas por presupuesto
CREATE INDEX IF NOT EXISTS idx_hour_entries_budget_id ON hour_entries(budget_id);

-- Crear índice para búsquedas por tipo
CREATE INDEX IF NOT EXISTS idx_hour_entries_type ON hour_entries(type);
