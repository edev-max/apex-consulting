-- Habilitar RLS en las nuevas tablas
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_invoice_items ENABLE ROW LEVEL SECURITY;

-- Políticas para invoices
CREATE POLICY "Users can manage own invoices" ON invoices
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas para budget_invoice_items
CREATE POLICY "Users can manage own budget invoice items" ON budget_invoice_items
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
