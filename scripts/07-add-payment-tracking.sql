-- Agregar campos de pago a presupuestos
ALTER TABLE budgets
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

-- Agregar campos de pago a facturas
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Función para actualizar el estado de pago basado en el monto pagado
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.paid_amount >= NEW.total THEN
    NEW.payment_status := 'paid';
  ELSIF NEW.paid_amount > 0 THEN
    NEW.payment_status := 'partial';
  ELSE
    NEW.payment_status := 'unpaid';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para presupuestos
DROP TRIGGER IF EXISTS update_budget_payment_status ON budgets;
CREATE TRIGGER update_budget_payment_status
BEFORE INSERT OR UPDATE OF paid_amount ON budgets
FOR EACH ROW
EXECUTE FUNCTION update_payment_status();

-- Trigger para facturas
DROP TRIGGER IF EXISTS update_invoice_payment_status ON invoices;
CREATE TRIGGER update_invoice_payment_status
BEFORE INSERT OR UPDATE OF paid_amount ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_payment_status();

-- Actualizar registros existentes para establecer el estado de pago basado en el status actual
UPDATE budgets 
SET paid_amount = CASE 
  WHEN status = 'paid' THEN total 
  ELSE 0 
END,
payment_status = CASE 
  WHEN status = 'paid' THEN 'paid' 
  ELSE 'unpaid' 
END;

UPDATE invoices 
SET paid_amount = CASE 
  WHEN status = 'paid' THEN total 
  ELSE 0 
END,
payment_status = CASE 
  WHEN status = 'paid' THEN 'paid' 
  ELSE 'unpaid' 
END;
