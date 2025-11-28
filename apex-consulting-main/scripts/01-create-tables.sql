-- Habilitar RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Crear tabla de presupuestos
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
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

-- Crear tabla de clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  total_hours INTEGER NOT NULL DEFAULT 0,
  consumed_hours INTEGER NOT NULL DEFAULT 0,
  remaining_hours INTEGER NOT NULL DEFAULT 0,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de registros de horas
CREATE TABLE IF NOT EXISTS hour_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hours DECIMAL(4,2) NOT NULL,
  description TEXT NOT NULL,
  project VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de cotizaciones de horas
CREATE TABLE IF NOT EXISTS hour_quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  client_name VARCHAR(255) NOT NULL,
  requested_hours INTEGER NOT NULL,
  description TEXT NOT NULL,
  project VARCHAR(255) NOT NULL,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_date DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
