-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener el siguiente número de presupuesto
CREATE OR REPLACE FUNCTION get_next_budget_number(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    last_number INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(number AS INTEGER)), 588) INTO last_number
    FROM budgets 
    WHERE user_id = user_uuid 
    AND number ~ '^[0-9]+$';
    
    RETURN last_number + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
