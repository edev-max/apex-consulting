-- Agregar campos de pago a presupuestos si no existen
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0;

ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid';

-- Crear tabla de historial de pagos
CREATE TABLE IF NOT EXISTS budget_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en budget_payments
ALTER TABLE budget_payments ENABLE ROW LEVEL SECURITY;

-- Política para budget_payments
DROP POLICY IF EXISTS "Users can manage own budget payments" ON budget_payments;
CREATE POLICY "Users can manage own budget payments" ON budget_payments
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_budget_payments_budget_id ON budget_payments(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_payments_user_id ON budget_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_payment_status ON budgets(payment_status);

-- Función para actualizar el estado de pago del presupuesto
CREATE OR REPLACE FUNCTION update_budget_payment_status()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(10,2);
  budget_total DECIMAL(10,2);
BEGIN
  -- Calcular total pagado para este presupuesto
  SELECT COALESCE(SUM(amount), 0) INTO total_paid
  FROM budget_payments
  WHERE budget_id = COALESCE(NEW.budget_id, OLD.budget_id);
  
  -- Obtener total del presupuesto
  SELECT total INTO budget_total
  FROM budgets
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  
  -- Actualizar presupuesto
  UPDATE budgets
  SET 
    paid_amount = total_paid,
    payment_status = CASE
      WHEN total_paid >= budget_total THEN 'paid'
      WHEN total_paid > 0 THEN 'partial'
      ELSE 'unpaid'
    END,
    status = CASE
      WHEN total_paid >= budget_total THEN 'paid'
      ELSE status
    END
  WHERE id = COALESCE(NEW.budget_id, OLD.budget_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar estado cuando se inserta un pago
DROP TRIGGER IF EXISTS update_budget_on_payment_insert ON budget_payments;
CREATE TRIGGER update_budget_on_payment_insert
AFTER INSERT ON budget_payments
FOR EACH ROW
EXECUTE FUNCTION update_budget_payment_status();

-- Trigger para actualizar estado cuando se elimina un pago
DROP TRIGGER IF EXISTS update_budget_on_payment_delete ON budget_payments;
CREATE TRIGGER update_budget_on_payment_delete
AFTER DELETE ON budget_payments
FOR EACH ROW
EXECUTE FUNCTION update_budget_payment_status();

-- Trigger para actualizar estado cuando se modifica un pago
DROP TRIGGER IF EXISTS update_budget_on_payment_update ON budget_payments;
CREATE TRIGGER update_budget_on_payment_update
AFTER UPDATE ON budget_payments
FOR EACH ROW
EXECUTE FUNCTION update_budget_payment_status();
