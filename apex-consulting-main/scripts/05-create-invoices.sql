-- Crear tabla de facturas
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  client_name VARCHAR(255) NOT NULL,
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  items JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para rastrear qué se ha facturado de cada presupuesto
CREATE TABLE IF NOT EXISTS budget_invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  item_id VARCHAR(255) NOT NULL, -- ID del ítem en el presupuesto
  quantity_invoiced DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para obtener el siguiente número de factura
CREATE OR REPLACE FUNCTION get_next_invoice_number(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  max_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(number AS INTEGER)), 0) INTO max_number
  FROM invoices
  WHERE user_id = user_uuid
  AND number ~ '^[0-9]+$';
  
  RETURN max_number + 1;
END;
$$ LANGUAGE plpgsql;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_budget_id ON invoices(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_invoice_items_budget_id ON budget_invoice_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_invoice_items_invoice_id ON budget_invoice_items(invoice_id);

-- Trigger para actualizar el campo updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
