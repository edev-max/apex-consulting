-- Habilitar RLS en todas las tablas
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_quotes ENABLE ROW LEVEL SECURITY;

-- Políticas para budgets
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para clients
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para hour_entries
CREATE POLICY "Users can view own hour entries" ON hour_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hour entries" ON hour_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hour entries" ON hour_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hour entries" ON hour_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para hour_quotes
CREATE POLICY "Users can view own hour quotes" ON hour_quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hour quotes" ON hour_quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hour quotes" ON hour_quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own hour quotes" ON hour_quotes
  FOR DELETE USING (auth.uid() = user_id);
