"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  PlusIcon,
  EyeIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  FileTextIcon,
  TrendingUpIcon,
  TrashIcon,
  PrinterIcon,
  CheckIcon,
  AlertCircleIcon,
  LogOutIcon,
  DatabaseIcon,
  AlertTriangleIcon,
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface Budget {
  id: string
  number: string
  client_name: string
  project_name: string
  project_description?: string
  total: number
  date: string
  status: "pending" | "paid" | "overdue"
  items?: any[]
}

interface Client {
  id: string
  name: string
  email: string
  total_hours: number
  consumed_hours: number
  remaining_hours: number
}

interface HourEntry {
  id: string
  client_id: string
  client_name: string
  date: string
  hours: number
  description: string
  project: string
}

interface HourQuote {
  id: string
  client_id: string
  client_name: string
  requested_hours: number
  description: string
  project: string
  request_date: string
  status: "pending" | "approved" | "rejected"
  approved_date?: string
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const {
    budgets,
    clients,
    hourEntries,
    hourQuotes,
    loading,
    tablesExist,
    dbError,
    saveClient,
    updateClient,
    deleteClient,
    saveHourEntry,
    deleteHourEntry,
    saveHourQuote,
    updateHourQuote,
    deleteHourQuote,
    updateBudget,
    deleteBudget,
    checkTablesExist,
  } = useSupabaseData()

  // Estados para formularios
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
  })

  const [newHourEntry, setNewHourEntry] = useState({
    clientId: "",
    hours: 0,
    description: "",
    project: "",
  })

  const [newHourQuote, setNewHourQuote] = useState({
    clientId: "",
    requestedHours: 0,
    description: "",
    project: "",
  })

  // Estados para modal de presupuesto
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
  const [isViewingBudget, setIsViewingBudget] = useState(false)
  const [isEditingBudget, setIsEditingBudget] = useState(false)

  // Estado para nuevo ítem en edición
  const [newItemForEdit, setNewItemForEdit] = useState({
    category: "",
    description: "",
    quantity: 0,
    rate: 0,
    unit: "",
  })

  const handleSignOut = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await signOut()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Si hay error de base de datos (tablas no existen)
  if (dbError || !tablesExist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <DatabaseIcon className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Base de Datos No Configurada</CardTitle>
            <CardDescription>Las tablas de la base de datos no existen aún</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-semibold mb-2">Error:</p>
                  <p className="text-red-700 text-sm">{dbError}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">📋 Pasos para Configurar la Base de Datos:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                <li>
                  Ve a tu proyecto de Supabase: <strong>https://supabase.com/dashboard</strong>
                </li>
                <li>
                  Navega a <strong>SQL Editor</strong> en el menú lateral
                </li>
                <li>Ejecuta los siguientes scripts en orden:</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">1️⃣ Script: Crear Tablas</h4>
                <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{`-- Crear tabla de presupuestos
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
);`}</pre>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">2️⃣ Script: Configurar Seguridad (RLS)</h4>
                <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{`-- Habilitar RLS en todas las tablas
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hour_quotes ENABLE ROW LEVEL SECURITY;

-- Políticas para budgets
CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para clients
CREATE POLICY "Users can manage own clients" ON clients
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para hour_entries
CREATE POLICY "Users can manage own hour entries" ON hour_entries
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para hour_quotes
CREATE POLICY "Users can manage own hour quotes" ON hour_quotes
  FOR ALL USING (auth.uid() = user_id);`}</pre>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">3️⃣ Script: Funciones Auxiliares</h4>
                <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <pre>{`-- Función para actualizar updated_at automáticamente
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
$$ LANGUAGE plpgsql SECURITY DEFINER;`}</pre>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={checkTablesExist} className="flex-1">
                <DatabaseIcon className="h-4 w-4 mr-2" />
                Verificar Base de Datos
              </Button>
              <Button onClick={handleSignOut} variant="outline" className="flex-1 bg-transparent">
                <LogOutIcon className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Tip:</strong> Después de ejecutar los scripts, haz clic en "Verificar Base de Datos" para
                comprobar que todo esté configurado correctamente.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Funciones para manejar presupuestos
  const toggleBudgetStatus = async (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (budget) {
      await updateBudget(budgetId, {
        ...budget,
        status: budget.status === "paid" ? "pending" : "paid",
      })
    }
  }

  const handleDeleteBudget = async (budgetId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este presupuesto?")) {
      await deleteBudget(budgetId)
    }
  }

  const viewBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (budget) {
      setSelectedBudget(budget)
      setIsViewingBudget(true)
      setIsEditingBudget(false)
    }
  }

  const editBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (budget) {
      setSelectedBudget(budget)
      setIsViewingBudget(true)
      setIsEditingBudget(true)
    }
  }

  const saveBudgetChanges = async () => {
    if (selectedBudget) {
      await updateBudget(selectedBudget.id, selectedBudget)
      setIsViewingBudget(false)
      setIsEditingBudget(false)
      setSelectedBudget(null)
    }
  }

  const closeBudgetModal = () => {
    setIsViewingBudget(false)
    setIsEditingBudget(false)
    setSelectedBudget(null)
    setNewItemForEdit({ category: "", description: "", quantity: 0, rate: 0, unit: "" })
  }

  const reprintBudget = (budgetId: string) => {
    const budget = budgets.find((b) => b.id === budgetId)
    if (!budget) return

    // Crear una nueva ventana para reimprimir el presupuesto
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Presupuesto #${budget.number} - ${budget.client_name}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #333; background: white; }
      .container { max-width: 800px; margin: 0 auto; }
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
      .company-info h1 { color: #374151; font-size: 32px; font-weight: bold; margin: 0 0 8px 0; }
      .company-info .subtitle { font-size: 24px; font-weight: 600; margin: 0 0 4px 0; }
      .company-info .description { font-size: 14px; color: #6b7280; margin: 0; }
      .date-info { text-align: right; font-size: 14px; color: #6b7280; }
      .date-info p { margin: 0 0 4px 0; }
      
      .project-details { margin-bottom: 24px; }
      .project-details h3 { font-size: 18px; font-weight: 600; margin: 0 0 12px 0; }
      .project-details p { margin: 0 0 4px 0; font-size: 14px; color: #374151; }
      .project-details strong { font-weight: 600; }
      
      .budget-breakdown { margin-bottom: 24px; }
      .budget-breakdown h3 { font-size: 18px; font-weight: 600; margin: 0 0 12px 0; }
      
      table { width: 100%; border-collapse: collapse; }
      th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
      th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
      td { padding: 12px; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
      td:nth-child(3), td:nth-child(4), td:nth-child(5) { text-align: right; }
      .no-items { text-align: center; color: #6b7280; padding: 32px; }
      
      .total-section { display: flex; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; }
      .total-amount { font-size: 20px; font-weight: bold; color: #374151; }
      .total-value { color: #059669; }
      
      .print-instructions { text-align: center; font-size: 14px; color: #6b7280; margin-top: 32px; }
      
      @media print {
        body { margin: 0; padding: 16px; }
        .no-print { display: none !important; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="company-info">
          <h1>APEX CONSULTING</h1>
          <div class="subtitle">Presupuesto</div>
          <div class="description">Presupuesto detallado para el desarrollo de sistemas</div>
        </div>
        <div class="date-info">
          <p>Fecha: ${new Date(budget.date).toLocaleDateString("es-ES")}</p>
          <p>Presupuesto #: ${budget.number}</p>
        </div>
      </div>

      <div class="project-details">
        <h3>Detalles del Proyecto</h3>
        <p><strong>Nombre del Proyecto:</strong> ${budget.project_name || "[Nombre del Proyecto]"}</p>
        <p><strong>Cliente:</strong> ${budget.client_name || "[Nombre del Cliente]"}</p>
        <p><strong>Descripción:</strong> ${budget.project_description || "[Descripción del proyecto]"}</p>
      </div>

      <div class="budget-breakdown">
        <h3>Desglose del Presupuesto</h3>
        <table>
          <thead>
            <tr>
              <th>Categoría</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Tarifa/Unidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${
              budget.items && budget.items.length > 0
                ? budget.items
                    .map(
                      (item: any) => `
                    <tr>
                      <td>${item.category || ""}</td>
                      <td>${item.description}</td>
                      <td>${item.quantity} ${item.unit || ""}</td>
                      <td>$${(item.rate || 0).toFixed(2)}</td>
                      <td>$${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}</td>
                    </tr>
                  `,
                    )
                    .join("")
                : `
                  <tr>
                    <td colspan="5" class="no-items">No hay ítems en el presupuesto.</td>
                  </tr>
                `
            }
          </tbody>
        </table>
      </div>

      <div class="total-section">
        <div class="total-amount">
          Presupuesto Total: <span class="total-value">$${budget.total.toFixed(2)}</span>
        </div>
      </div>

      <div class="print-instructions">
        <p>Para imprimir este presupuesto, haz clic en el botón "Imprimir" o usa la función de impresión de tu navegador (Ctrl+P o Cmd+P) y selecciona "Guardar como PDF".</p>
      </div>

      <div class="no-print" style="text-align: center; margin-top: 30px;">
        <button onclick="window.print()" style="padding: 12px 24px; background-color: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 12px; font-size: 14px;">
          Imprimir
        </button>
        <button onclick="window.close()" style="padding: 12px 24px; background-color: #6b7280; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
          Cerrar
        </button>
      </div>
    </div>
  </body>
  </html>
`

    printWindow.document.write(printHTML)
    printWindow.document.close()
  }

  const getStatusBadge = (status: Budget["status"]) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800">Vencido</Badge>
    }
  }

  // Funciones para manejar clientes
  const addClient = async () => {
    if (newClient.name && newClient.email) {
      await saveClient(newClient)
      setNewClient({ name: "", email: "" })
    }
  }

  const handleDeleteClient = async (clientId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente? También se eliminarán sus registros de horas.")) {
      await deleteClient(clientId)
    }
  }

  // Funciones para manejar cotizaciones de horas
  const addHourQuote = async () => {
    if (newHourQuote.clientId && newHourQuote.requestedHours !== 0 && newHourQuote.description) {
      const client = clients.find((c) => c.id === newHourQuote.clientId)
      if (client) {
        await saveHourQuote({
          clientId: newHourQuote.clientId,
          clientName: client.name,
          requestedHours: newHourQuote.requestedHours,
          description: newHourQuote.description,
          project: newHourQuote.project,
        })
        setNewHourQuote({ clientId: "", requestedHours: 0, description: "", project: "" })
      }
    }
  }

  const approveHourQuote = async (quoteId: string) => {
    const quote = hourQuotes.find((q) => q.id === quoteId)
    if (quote) {
      // Actualizar la cotización como aprobada
      await updateHourQuote(quoteId, {
        ...quote,
        status: "approved",
        approved_date: new Date().toISOString().split("T")[0],
      })

      // Actualizar las horas del cliente
      const client = clients.find((c) => c.id === quote.client_id)
      if (client) {
        const newTotalHours = Math.max(0, client.total_hours + quote.requested_hours)
        await updateClient(client.id, {
          ...client,
          total_hours: newTotalHours,
          remaining_hours: newTotalHours - client.consumed_hours,
        })
      }
    }
  }

  const rejectHourQuote = async (quoteId: string) => {
    const quote = hourQuotes.find((q) => q.id === quoteId)
    if (quote) {
      await updateHourQuote(quoteId, { ...quote, status: "rejected" })
    }
  }

  const getQuoteStatusBadge = (status: HourQuote["status"]) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Aprobada</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rechazada</Badge>
    }
  }

  // Funciones para manejar horas
  const addHourEntry = async () => {
    if (newHourEntry.clientId && newHourEntry.hours > 0 && newHourEntry.description) {
      const client = clients.find((c) => c.id === newHourEntry.clientId)
      if (client) {
        await saveHourEntry({
          clientId: newHourEntry.clientId,
          clientName: client.name,
          hours: newHourEntry.hours,
          description: newHourEntry.description,
          project: newHourEntry.project,
        })

        // Actualizar horas del cliente
        await updateClient(client.id, {
          ...client,
          consumed_hours: client.consumed_hours + newHourEntry.hours,
          remaining_hours: client.remaining_hours - newHourEntry.hours,
        })

        setNewHourEntry({ clientId: "", hours: 0, description: "", project: "" })
      }
    }
  }

  const handleDeleteHourEntry = async (entryId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro de horas?")) {
      const entry = hourEntries.find((e) => e.id === entryId)
      if (entry) {
        const client = clients.find((c) => c.id === entry.client_id)
        if (client) {
          // Devolver las horas al cliente
          await updateClient(client.id, {
            ...client,
            consumed_hours: client.consumed_hours - entry.hours,
            remaining_hours: client.remaining_hours + entry.hours,
          })
        }
        await deleteHourEntry(entryId)
      }
    }
  }

  const getHoursForClient = (clientId: string) => {
    return hourEntries.filter((entry) => entry.client_id === clientId)
  }

  // Función para generar reporte PDF del cliente
  const generateClientReport = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (!client) return

    const clientHours = getHoursForClient(clientId)
    const approvedQuotes = hourQuotes.filter((q) => q.client_id === clientId && q.status === "approved")

    // Crear una nueva ventana para el reporte
    const reportWindow = window.open("", "_blank")
    if (!reportWindow) return

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Horas - ${client.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #00838F; padding-bottom: 20px; }
          .company-name { color: #00838F; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
          .report-title { font-size: 24px; margin-bottom: 5px; }
          .client-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-item { text-align: center; padding: 15px; background-color: #e3f2fd; border-radius: 8px; }
          .summary-value { font-size: 24px; font-weight: bold; color: #1976d2; }
          .summary-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .progress-bar { width: 100%; height: 20px; background-color: #e0e0e0; border-radius: 10px; overflow: hidden; }
          .progress-fill { height: 100%; background: linear-gradient(90deg, #4caf50, #2196f3); }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">APEX CONSULTING</div>
          <div class="report-title">Reporte de Horas de Desarrollo</div>
          <div>Fecha: ${new Date().toLocaleDateString("es-ES")}</div>
        </div>

        <div class="client-info">
          <h3>Información del Cliente</h3>
          <p><strong>Cliente:</strong> ${client.name}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Fecha del Reporte:</strong> ${new Date().toLocaleDateString("es-ES")}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${client.total_hours}h</div>
            <div class="summary-label">Horas Totales</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${client.consumed_hours}h</div>
            <div class="summary-label">Horas Consumidas</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${client.remaining_hours}h</div>
            <div class="summary-label">Horas Restantes</div>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3>Progreso General</h3>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${(client.consumed_hours / client.total_hours) * 100}%"></div>
          </div>
          <p style="text-align: center; margin-top: 10px;">
            ${Math.round((client.consumed_hours / client.total_hours) * 100)}% completado
          </p>
        </div>

        ${
          approvedQuotes.length > 0
            ? `
        <h3>Cotizaciones Aprobadas</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha Aprobación</th>
              <th>Proyecto</th>
              <th>Descripción</th>
              <th>Horas Aprobadas</th>
            </tr>
          </thead>
          <tbody>
            ${approvedQuotes
              .map(
                (quote) => `
              <tr>
                <td>${quote.approved_date ? new Date(quote.approved_date).toLocaleDateString("es-ES") : "-"}</td>
                <td>${quote.project}</td>
                <td>${quote.description}</td>
                <td style="color: ${quote.requested_hours < 0 ? "#dc2626" : "#059669"}; font-weight: bold;">
                  ${quote.requested_hours > 0 ? "+" : ""}${quote.requested_hours}h
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : ""
        }

        ${
          clientHours.length > 0
            ? `
        <h3>Detalle de Horas Trabajadas</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Descripción</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            ${clientHours
              .map(
                (entry) => `
              <tr>
                <td>${new Date(entry.date).toLocaleDateString("es-ES")}</td>
                <td>${entry.project}</td>
                <td>${entry.description}</td>
                <td>${entry.hours}h</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : "<p>No hay registros de horas trabajadas.</p>"
        }

        <div class="footer">
          <p>Este reporte fue generado automáticamente por el sistema de gestión de APEX CONSULTING</p>
          <p>Para consultas, contacte a: desarrollador@apexconsulting.com</p>
        </div>

        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #00838F; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir / Guardar como PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #666; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Cerrar
          </button>
        </div>
      </body>
      </html>
    `

    reportWindow.document.write(reportHTML)
    reportWindow.document.close()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard - APEX CONSULTING</h1>
            <p className="text-gray-600 mt-2">Gestión de presupuestos y control de horas de desarrollo</p>
            <p className="text-sm text-gray-500">
              Usuario: {user?.email === "admin@apexconsulting.com" ? "admin" : user?.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <LogOutIcon className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <Tabs defaultValue="quotes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="quotes" className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4" />
              Cotizaciones ({hourQuotes.length})
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              Presupuestos ({budgets.length})
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Clientes ({clients.length})
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              Control de Horas ({hourEntries.length})
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUpIcon className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          {/* Tab de Cotizaciones de Horas */}
          <TabsContent value="quotes">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cotizaciones de Horas</CardTitle>
                  <CardDescription>Solicitudes de horas de los clientes pendientes de aprobación</CardDescription>
                </CardHeader>
                <CardContent>
                  {hourQuotes.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay cotizaciones de horas.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Proyecto</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Horas</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hourQuotes.map((quote) => (
                          <TableRow key={quote.id}>
                            <TableCell className="font-medium">{quote.client_name}</TableCell>
                            <TableCell>{quote.project}</TableCell>
                            <TableCell>{quote.description}</TableCell>
                            <TableCell className="text-right">
                              <span className={quote.requested_hours < 0 ? "text-red-600 font-semibold" : ""}>
                                {quote.requested_hours > 0 ? "+" : ""}
                                {quote.requested_hours}h
                              </span>
                            </TableCell>
                            <TableCell>{new Date(quote.request_date).toLocaleDateString("es-ES")}</TableCell>
                            <TableCell>{getQuoteStatusBadge(quote.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {quote.status === "pending" && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => approveHourQuote(quote.id)}
                                      title="Aprobar cotización"
                                    >
                                      <CheckIcon className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => rejectHourQuote(quote.id)}
                                      title="Rechazar cotización"
                                    >
                                      <XCircleIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteHourQuote(quote.id)}
                                  title="Eliminar cotización"
                                >
                                  <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nueva Cotización</CardTitle>
                  <CardDescription>Registra una solicitud de horas de un cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="quoteClient">Cliente</Label>
                    <select
                      id="quoteClient"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newHourQuote.clientId}
                      onChange={(e) => setNewHourQuote({ ...newHourQuote, clientId: e.target.value })}
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quoteProject">Proyecto</Label>
                    <Input
                      id="quoteProject"
                      value={newHourQuote.project}
                      onChange={(e) => setNewHourQuote({ ...newHourQuote, project: e.target.value })}
                      placeholder="Nombre del proyecto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quoteHours">Horas Solicitadas</Label>
                    <Input
                      id="quoteHours"
                      type="number"
                      value={newHourQuote.requestedHours}
                      onChange={(e) => setNewHourQuote({ ...newHourQuote, requestedHours: Number(e.target.value) })}
                      placeholder="10 (usar - para restar horas)"
                      step="0.5"
                    />
                    <p className="text-xs text-gray-500">
                      Usa números positivos para agregar horas, negativos para restar horas del cliente
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quoteDescription">Descripción</Label>
                    <Textarea
                      id="quoteDescription"
                      value={newHourQuote.description}
                      onChange={(e) => setNewHourQuote({ ...newHourQuote, description: e.target.value })}
                      placeholder="Describe el trabajo solicitado..."
                    />
                  </div>
                  <Button onClick={addHourQuote} className="w-full" disabled={clients.length === 0}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Crear Cotización
                  </Button>
                  {clients.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      Primero debes agregar clientes para crear cotizaciones
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Presupuestos */}
          <TabsContent value="budgets">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Lista de Presupuestos</CardTitle>
                    <CardDescription>Gestiona todos tus presupuestos y su estado de pago</CardDescription>
                  </div>
                  <Link href="/budget-report">
                    <Button>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nuevo Presupuesto
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {budgets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay presupuestos registrados.</p>
                    <Link href="/budget-report">
                      <Button className="mt-4">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Crear tu primer presupuesto
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgets.map((budget) => (
                        <TableRow key={budget.id}>
                          <TableCell className="font-medium">#{budget.number}</TableCell>
                          <TableCell>{budget.client_name}</TableCell>
                          <TableCell>{budget.project_name}</TableCell>
                          <TableCell>{new Date(budget.date).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell className="text-right">${budget.total.toLocaleString()}</TableCell>
                          <TableCell>{getStatusBadge(budget.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => viewBudget(budget.id)}
                                title="Ver presupuesto"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => editBudget(budget.id)}
                                title="Editar presupuesto"
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => reprintBudget(budget.id)}
                                title="Reimprimir presupuesto"
                              >
                                <PrinterIcon className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleBudgetStatus(budget.id)}
                                title={budget.status === "paid" ? "Marcar como pendiente" : "Marcar como pagado"}
                              >
                                {budget.status === "paid" ? (
                                  <XCircleIcon className="h-4 w-4 text-red-500" />
                                ) : (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteBudget(budget.id)}
                                title="Eliminar presupuesto"
                              >
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab de Clientes */}
          <TabsContent value="clients">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Lista de Clientes</CardTitle>
                  <CardDescription>Gestiona tus clientes y sus horas asignadas</CardDescription>
                </CardHeader>
                <CardContent>
                  {clients.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay clientes registrados.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Horas Totales</TableHead>
                          <TableHead className="text-right">Consumidas</TableHead>
                          <TableHead className="text-right">Restantes</TableHead>
                          <TableHead>Progreso</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {clients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="font-medium">{client.name}</TableCell>
                            <TableCell>{client.email}</TableCell>
                            <TableCell className="text-right">{client.total_hours}h</TableCell>
                            <TableCell className="text-right">{client.consumed_hours}h</TableCell>
                            <TableCell className="text-right">
                              <span className={client.remaining_hours < 0 ? "text-red-600 font-semibold" : ""}>
                                {client.remaining_hours}h
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    client.consumed_hours > client.total_hours ? "bg-red-500" : "bg-blue-600"
                                  }`}
                                  style={{
                                    width: `${Math.min((client.consumed_hours / client.total_hours) * 100, 100)}%`,
                                  }}
                                ></div>
                                {client.consumed_hours > client.total_hours && (
                                  <div className="text-xs text-red-600 mt-1 font-semibold">
                                    SOBREGIRO: {client.consumed_hours - client.total_hours}h
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => generateClientReport(client.id)}
                                  title="Generar reporte PDF"
                                >
                                  <PrinterIcon className="h-4 w-4 text-blue-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClient(client.id)}
                                  title="Eliminar cliente"
                                >
                                  <TrashIcon className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agregar Cliente</CardTitle>
                  <CardDescription>Registra un nuevo cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Nombre del Cliente</Label>
                    <Input
                      id="clientName"
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="Ej: Empresa ABC S.A."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientEmail">Email</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                      placeholder="contacto@empresa.com"
                    />
                  </div>
                  <Button onClick={addClient} className="w-full">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Agregar Cliente
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    Las horas se asignarán automáticamente desde las cotizaciones aprobadas
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Control de Horas */}
          <TabsContent value="hours">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Registro de Horas</CardTitle>
                  <CardDescription>Historial de horas trabajadas por cliente</CardDescription>
                </CardHeader>
                <CardContent>
                  {hourEntries.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay registros de horas.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Proyecto</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead className="text-right">Horas</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hourEntries.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{new Date(entry.date).toLocaleDateString("es-ES")}</TableCell>
                            <TableCell>{entry.client_name}</TableCell>
                            <TableCell>{entry.project}</TableCell>
                            <TableCell>{entry.description}</TableCell>
                            <TableCell className="text-right">{entry.hours}h</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteHourEntry(entry.id)}
                                title="Eliminar registro"
                              >
                                <TrashIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Registrar Horas</CardTitle>
                  <CardDescription>Añade tiempo trabajado para un cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="selectClient">Cliente</Label>
                    <select
                      id="selectClient"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={newHourEntry.clientId}
                      onChange={(e) => setNewHourEntry({ ...newHourEntry, clientId: e.target.value })}
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name} (
                          {client.remaining_hours < 0
                            ? `${client.remaining_hours}h SOBREGIRO`
                            : `${client.remaining_hours}h restantes`}
                          )
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Proyecto</Label>
                    <Input
                      id="projectName"
                      value={newHourEntry.project}
                      onChange={(e) => setNewHourEntry({ ...newHourEntry, project: e.target.value })}
                      placeholder="Nombre del proyecto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hoursWorked">Horas Trabajadas</Label>
                    <Input
                      id="hoursWorked"
                      type="number"
                      value={newHourEntry.hours}
                      onChange={(e) => setNewHourEntry({ ...newHourEntry, hours: Number(e.target.value) })}
                      placeholder="8"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workDescription">Descripción del Trabajo</Label>
                    <Textarea
                      id="workDescription"
                      value={newHourEntry.description}
                      onChange={(e) => setNewHourEntry({ ...newHourEntry, description: e.target.value })}
                      placeholder="Describe el trabajo realizado..."
                    />
                  </div>
                  <Button onClick={addHourEntry} className="w-full" disabled={clients.length === 0}>
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Registrar Horas
                  </Button>
                  {clients.length === 0 && (
                    <p className="text-sm text-gray-500 text-center">
                      Primero debes agregar clientes para registrar horas
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab de Reportes */}
          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No hay clientes para mostrar reportes.</p>
                </div>
              ) : (
                clients.map((client) => {
                  const clientHours = getHoursForClient(client.id)

                  return (
                    <Card key={client.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{client.name}</CardTitle>
                        <CardDescription>Reporte de horas consumidas</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span>Horas Asignadas:</span>
                            <span className="font-semibold">{client.total_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Horas Consumidas:</span>
                            <span className="font-semibold text-blue-600">{client.consumed_hours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Horas Restantes:</span>
                            <span className="font-semibold text-green-600">{client.remaining_hours}h</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                              style={{ width: `${(client.consumed_hours / client.total_hours) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-center text-sm text-gray-600">
                            {Math.round((client.consumed_hours / client.total_hours) * 100)}% completado
                          </div>

                          <Button
                            onClick={() => generateClientReport(client.id)}
                            className="w-full mt-4"
                            variant="outline"
                          >
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Generar Reporte PDF
                          </Button>

                          {clientHours.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-semibold text-sm mb-2">Últimas actividades:</h4>
                              <div className="space-y-1">
                                {clientHours.slice(-3).map((entry) => (
                                  <div key={entry.id} className="text-xs text-gray-600">
                                    <div className="flex justify-between">
                                      <span>{new Date(entry.date).toLocaleDateString("es-ES")}</span>
                                      <span>{entry.hours}h</span>
                                    </div>
                                    <div className="truncate">{entry.description}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal de Visualización/Edición de Presupuesto */}
        {isViewingBudget && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {isEditingBudget ? "Editar" : "Ver"} Presupuesto #{selectedBudget.number}
                  </h2>
                  <div className="flex gap-2">
                    <Button onClick={() => reprintBudget(selectedBudget.id)} variant="outline">
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      Reimprimir
                    </Button>
                    {!isEditingBudget && (
                      <Button onClick={() => setIsEditingBudget(true)} variant="outline">
                        <EditIcon className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    {isEditingBudget && (
                      <Button onClick={saveBudgetChanges} className="bg-green-600 hover:bg-green-700">
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Guardar
                      </Button>
                    )}
                    <Button onClick={closeBudgetModal} variant="outline">
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Cerrar
                    </Button>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Información del Cliente y Proyecto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="modalClientName">Cliente</Label>
                      {isEditingBudget ? (
                        <Input
                          id="modalClientName"
                          value={selectedBudget.client_name}
                          onChange={(e) => setSelectedBudget({ ...selectedBudget, client_name: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{selectedBudget.client_name}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="modalProjectName">Proyecto</Label>
                      {isEditingBudget ? (
                        <Input
                          id="modalProjectName"
                          value={selectedBudget.project_name}
                          onChange={(e) => setSelectedBudget({ ...selectedBudget, project_name: e.target.value })}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{selectedBudget.project_name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>Fecha</Label>
                    <p className="p-2 bg-gray-50 rounded">
                      {new Date(selectedBudget.date).toLocaleDateString("es-ES")}
                    </p>
                  </div>

                  <div>
                    <Label>Estado</Label>
                    <div className="p-2">{getStatusBadge(selectedBudget.status)}</div>
                  </div>

                  {/* Ítems del Presupuesto */}
                  {selectedBudget.items && selectedBudget.items.length > 0 && (
                    <div>
                      <Label className="text-lg font-semibold">Ítems del Presupuesto</Label>
                      <div className="mt-2">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Categoría</TableHead>
                              <TableHead>Descripción</TableHead>
                              <TableHead className="text-right">Cantidad</TableHead>
                              <TableHead className="text-right">Precio Unit.</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              {isEditingBudget && <TableHead className="w-[50px]">Acciones</TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedBudget.items.map((item: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {isEditingBudget ? (
                                    <Input
                                      value={item.category || ""}
                                      onChange={(e) => {
                                        const updatedItems = [...selectedBudget.items]
                                        updatedItems[index] = { ...updatedItems[index], category: e.target.value }
                                        setSelectedBudget({ ...selectedBudget, items: updatedItems })
                                      }}
                                      placeholder="Categoría"
                                    />
                                  ) : (
                                    item.category
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isEditingBudget ? (
                                    <Input
                                      value={item.description}
                                      onChange={(e) => {
                                        const updatedItems = [...selectedBudget.items]
                                        updatedItems[index] = { ...updatedItems[index], description: e.target.value }
                                        setSelectedBudget({ ...selectedBudget, items: updatedItems })
                                      }}
                                      placeholder="Descripción"
                                    />
                                  ) : (
                                    item.description
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditingBudget ? (
                                    <div className="flex gap-1">
                                      <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => {
                                          const updatedItems = [...selectedBudget.items]
                                          const newQuantity = Number(e.target.value) || 0
                                          updatedItems[index] = { ...updatedItems[index], quantity: newQuantity }

                                          // Recalcular total del presupuesto
                                          const newTotal = updatedItems.reduce(
                                            (sum, itm) => sum + itm.quantity * itm.rate,
                                            0,
                                          )
                                          setSelectedBudget({ ...selectedBudget, items: updatedItems, total: newTotal })
                                        }}
                                        className="w-16"
                                        min="0"
                                        step="0.5"
                                      />
                                      <Input
                                        value={item.unit || ""}
                                        onChange={(e) => {
                                          const updatedItems = [...selectedBudget.items]
                                          updatedItems[index] = { ...updatedItems[index], unit: e.target.value }
                                          setSelectedBudget({ ...selectedBudget, items: updatedItems })
                                        }}
                                        placeholder="unidad"
                                        className="w-20"
                                      />
                                    </div>
                                  ) : (
                                    `${item.quantity} ${item.unit || ""}`
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  {isEditingBudget ? (
                                    <Input
                                      type="number"
                                      value={item.rate}
                                      onChange={(e) => {
                                        const updatedItems = [...selectedBudget.items]
                                        const newRate = Number(e.target.value) || 0
                                        updatedItems[index] = { ...updatedItems[index], rate: newRate }

                                        // Recalcular total del presupuesto
                                        const newTotal = updatedItems.reduce(
                                          (sum, itm) => sum + itm.quantity * itm.rate,
                                          0,
                                        )
                                        setSelectedBudget({ ...selectedBudget, items: updatedItems, total: newTotal })
                                      }}
                                      className="w-24"
                                      min="0"
                                      step="0.01"
                                    />
                                  ) : (
                                    `$${item.rate?.toFixed(2)}`
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  ${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
                                </TableCell>
                                {isEditingBudget && (
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const updatedItems = selectedBudget.items.filter((_, i) => i !== index)
                                        const newTotal = updatedItems.reduce(
                                          (sum, itm) => sum + itm.quantity * itm.rate,
                                          0,
                                        )
                                        setSelectedBudget({ ...selectedBudget, items: updatedItems, total: newTotal })
                                      }}
                                      title="Eliminar ítem"
                                    >
                                      <TrashIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {/* Formulario para agregar nuevo ítem */}
                        {isEditingBudget && (
                          <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <h4 className="font-semibold mb-3">Agregar Nuevo Ítem</h4>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                              <Input
                                placeholder="Categoría"
                                value={newItemForEdit.category}
                                onChange={(e) => setNewItemForEdit({ ...newItemForEdit, category: e.target.value })}
                              />
                              <Input
                                placeholder="Descripción"
                                value={newItemForEdit.description}
                                onChange={(e) => setNewItemForEdit({ ...newItemForEdit, description: e.target.value })}
                              />
                              <Input
                                type="number"
                                placeholder="Cantidad"
                                value={newItemForEdit.quantity}
                                onChange={(e) =>
                                  setNewItemForEdit({ ...newItemForEdit, quantity: Number(e.target.value) || 0 })
                                }
                                min="0"
                                step="0.5"
                              />
                              <Input
                                type="number"
                                placeholder="Precio"
                                value={newItemForEdit.rate}
                                onChange={(e) =>
                                  setNewItemForEdit({ ...newItemForEdit, rate: Number(e.target.value) || 0 })
                                }
                                min="0"
                                step="0.01"
                              />
                              <Input
                                placeholder="Unidad"
                                value={newItemForEdit.unit}
                                onChange={(e) => setNewItemForEdit({ ...newItemForEdit, unit: e.target.value })}
                              />
                            </div>
                            <Button
                              onClick={() => {
                                if (
                                  newItemForEdit.description &&
                                  newItemForEdit.quantity > 0 &&
                                  newItemForEdit.rate > 0
                                ) {
                                  const updatedItems = [
                                    ...selectedBudget.items,
                                    { ...newItemForEdit, id: crypto.randomUUID() },
                                  ]
                                  const newTotal = updatedItems.reduce((sum, itm) => sum + itm.quantity * itm.rate, 0)
                                  setSelectedBudget({ ...selectedBudget, items: updatedItems, total: newTotal })
                                  setNewItemForEdit({ category: "", description: "", quantity: 0, rate: 0, unit: "" })
                                }
                              }}
                              className="mt-3"
                              disabled={
                                !newItemForEdit.description || newItemForEdit.quantity <= 0 || newItemForEdit.rate <= 0
                              }
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Agregar Ítem
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          Total: <span className="text-green-600">${selectedBudget.total.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
