"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  PlusIcon,
  EyeIcon,
  EditIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  PrinterIcon,
  CheckIcon,
  DatabaseIcon,
  AlertTriangleIcon,
  UserIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardCards } from "@/components/dashboard-cards"

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
  const router = useRouter()

  // Estados para configuración
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [configMessage, setConfigMessage] = useState("")
  const [configLoading, setConfigLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [budgetFilter, setBudgetFilter] = useState<"all" | "paid" | "pending" | "overdue">("all")

  // Estados para configuración de empresa y perfil
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const { user, updatePassword } = useAuth()
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
    companySettings,
    userProfile,
    saveCompanySettings,
    saveUserProfile,
    uploadFile,
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

  // Cargar configuraciones cuando cambien
  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.company_name)
      setCompanyLogoPreview(companySettings.company_logo_url)
    }
  }, [companySettings])

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "")
      setAvatarPreview(userProfile.avatar_url)
    }
  }, [userProfile])

  // Función para manejar cambio de tab
  const handleTabChange = (tab: string) => {
    if (tab === "new-budget") {
      router.push("/budget-report")
    } else {
      setActiveTab(tab)
    }
  }

  // Agregar función para cambiar contraseña
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setConfigMessage("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setConfigMessage("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setConfigLoading(true)
    setConfigMessage("")

    const { error } = await updatePassword(newPassword)

    if (error) {
      setConfigMessage(error.message)
    } else {
      setConfigMessage("¡Contraseña actualizada exitosamente!")
      setNewPassword("")
      setConfirmPassword("")
    }

    setConfigLoading(false)
  }

  // Agregar funciones para manejar archivos:
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCompanyLogo(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanyLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveCompanyInfo = async () => {
    setUploadingLogo(true)
    setConfigMessage("")

    try {
      let logoUrl = companySettings?.company_logo_url

      // Subir logo si hay uno nuevo
      if (companyLogo && user) {
        const fileName = `${user.id}/logo-${Date.now()}.${companyLogo.name.split(".").pop()}`
        logoUrl = await uploadFile(companyLogo, "company-logos", fileName)
      }

      // Guardar configuración
      const result = await saveCompanySettings({
        company_name: companyName,
        company_logo_url: logoUrl || undefined,
      })

      if (result) {
        setConfigMessage("¡Información de empresa guardada exitosamente!")
        setCompanyLogo(null)
      } else {
        setConfigMessage("Error al guardar la información de empresa")
      }
    } catch (error) {
      setConfigMessage("Error al guardar la información de empresa")
    } finally {
      setUploadingLogo(false)
    }
  }

  const saveUserProfileInfo = async () => {
    setUploadingAvatar(true)
    setConfigMessage("")

    try {
      let avatarUrl = userProfile?.avatar_url

      // Subir avatar si hay uno nuevo
      if (avatarFile && user) {
        const fileName = `${user.id}/avatar-${Date.now()}.${avatarFile.name.split(".").pop()}`
        avatarUrl = await uploadFile(avatarFile, "avatars", fileName)
      }

      // Guardar perfil
      const result = await saveUserProfile({
        avatar_url: avatarUrl || undefined,
        full_name: fullName,
      })

      if (result) {
        setConfigMessage("¡Perfil actualizado exitosamente!")
        setAvatarFile(null)
      } else {
        setConfigMessage("Error al actualizar el perfil")
      }
    } catch (error) {
      setConfigMessage("Error al actualizar el perfil")
    } finally {
      setUploadingAvatar(false)
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
                <li>
                  Ejecuta el script SQL que está en el archivo <code>scripts/04-create-settings-tables.sql</code>
                </li>
              </ol>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={checkTablesExist} className="flex-1">
                <DatabaseIcon className="h-4 w-4 mr-2" />
                Verificar Base de Datos
              </Button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Tip:</strong> Después de ejecutar el script SQL, haz clic en "Verificar Base de Datos" para
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
      .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
      .company-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
      .company-logo { width: 80px; height: 80px; object-fit: contain; }
      .company-info h1 { color: #374151; font-size: 32px; font-weight: bold; margin: 0 0 8px 0; }
      .company-info .subtitle { font-size: 24px; font-weight: 600; margin: 0 0 4px 0; }
      .company-info .description { font-size: 14px; color: #6b7280; margin: 0; }
      .header-details { display: flex; justify-content: space-between; align-items: flex-start; }
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
        <div class="company-header">
          ${
            companySettings?.company_logo_url
              ? `<img src="${companySettings.company_logo_url}" alt="Logo" class="company-logo" />`
              : ""
          }
          <div class="company-info">
            <h1>${companySettings?.company_name || "APEX CONSULTING"}</h1>
            <div class="subtitle">Presupuesto</div>
            <div class="description">Presupuesto detallado para el desarrollo de sistemas</div>
          </div>
        </div>
        <div class="header-details">
          <div></div>
          <div class="date-info">
            <p>Fecha: ${new Date(budget.date).toLocaleDateString("es-ES")}</p>
            <p>Presupuesto #: ${budget.number}</p>
          </div>
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

  // Funciones para manejar cotizaciones de horas - SIMPLIFICADAS
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
      await updateHourQuote(quoteId, {
        ...quote,
        status: "approved",
        approved_date: new Date().toISOString().split("T")[0],
      })
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

  // Funciones para manejar horas - SIMPLIFICADAS
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

        // Solo actualizar horas consumidas
        await updateClient(client.id, {
          ...client,
          consumed_hours: client.consumed_hours + newHourEntry.hours,
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
          // Devolver las horas consumidas
          await updateClient(client.id, {
            ...client,
            consumed_hours: Math.max(0, client.consumed_hours - entry.hours),
          })
        }
        await deleteHourEntry(entryId)
      }
    }
  }

  // Función actualizada para marcar hora como pagada
  const markHourAsPaid = async (entryId: string) => {
    const entry = hourEntries.find((e) => e.id === entryId)
    if (!entry) return

    const confirmMessage = `¿Marcar como pagada ${entry.hours}h de "${entry.description}"?\n\nEsto reducirá las horas trabajadas pendientes del cliente.`

    if (confirm(confirmMessage)) {
      const client = clients.find((c) => c.id === entry.client_id)
      if (client) {
        // Restar las horas de consumed_hours
        const newConsumedHours = Math.max(0, client.consumed_hours - entry.hours)
        await updateClient(client.id, {
          ...client,
          consumed_hours: newConsumedHours,
        })

        // Crear un registro de cotización para el historial
        await saveHourQuote({
          clientId: entry.client_id,
          clientName: client.name,
          requestedHours: -entry.hours,
          description: `Pago de horas trabajadas: ${entry.description}`,
          project: entry.project,
        })

        alert(`Se marcaron ${entry.hours}h como pagadas y se restaron de las horas pendientes`)
      }
    }
  }

  const getHoursForClient = (clientId: string) => {
    return hourEntries.filter((entry) => entry.client_id === clientId)
  }

  // Función para generar reporte PDF del cliente - ACTUALIZADA
  const generateClientReport = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (!client) return

    const clientHours = getHoursForClient(clientId)
    const approvedQuotes = hourQuotes.filter((q) => q.client_id === clientId && q.status === "approved")

    const reportWindow = window.open("", "_blank")
    if (!reportWindow) return

    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reporte de Horas - ${client.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #00838F; padding-bottom: 20px; }
          .company-header { display: flex; align-items: center; gap: 16px; margin-bottom: 10px; }
          .company-logo { width: 60px; height: 60px; object-fit: contain; }
          .company-name { color: #00838F; font-size: 28px; font-weight: bold; margin: 0; }
          .report-title { font-size: 24px; margin-bottom: 5px; text-align: center; }
          .client-info { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .summary-item { text-align: center; padding: 15px; background-color: #e3f2fd; border-radius: 8px; }
          .summary-value { font-size: 24px; font-weight: bold; color: #1976d2; }
          .summary-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-header">
            ${
              companySettings?.company_logo_url
                ? `<img src="${companySettings.company_logo_url}" alt="Logo" class="company-logo" />`
                : ""
            }
            <div class="company-name">${companySettings?.company_name || "APEX CONSULTING"}</div>
          </div>
          <div class="report-title">Reporte de Horas de Desarrollo</div>
          <div style="text-align: center;">Fecha: ${new Date().toLocaleDateString("es-ES")}</div>
        </div>

        <div class="client-info">
          <h3>Información del Cliente</h3>
          <p><strong>Cliente:</strong> ${client.name}</p>
          <p><strong>Email:</strong> ${client.email}</p>
          <p><strong>Fecha del Reporte:</strong> ${new Date().toLocaleDateString("es-ES")}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${client.consumed_hours}h</div>
            <div class="summary-label">Horas Pendientes de Pago</div>
          </div>
        </div>

        ${
          approvedQuotes.length > 0
            ? `
        <h3>Historial de Ajustes</h3>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Proyecto</th>
              <th>Descripción</th>
              <th>Ajuste de Horas</th>
            </tr>
          </thead>
          <tbody>
            ${approvedQuotes
              .map(
                (quote) => `
              <tr>
                <td>${quote.approved_date ? new Date(quote.approved_date).toLocaleDateString("es-ES") : new Date(quote.request_date).toLocaleDateString("es-ES")}</td>
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
          <p>Este reporte fue generado automáticamente por el sistema de gestión de ${companySettings?.company_name || "APEX CONSULTING"}</p>
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

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard General"
      case "quotes":
        return "Historial de Ajustes"
      case "budgets":
        return "Gestión de Presupuestos"
      case "clients":
        return "Gestión de Clientes"
      case "hours":
        return "Control de Horas"
      case "reports":
        return "Reportes y Análisis"
      case "settings":
        return "Configuración del Sistema"
      default:
        return "Dashboard"
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardCards budgets={budgets} clients={clients} hourEntries={hourEntries} hourQuotes={hourQuotes} />

      case "quotes":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Historial de Ajustes</CardTitle>
                <CardDescription>Registros de ajustes de horas y pagos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                {hourQuotes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay registros de ajustes.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Proyecto</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Ajuste</TableHead>
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
                            <span
                              className={
                                quote.requested_hours < 0
                                  ? "text-red-600 font-semibold"
                                  : "text-green-600 font-semibold"
                              }
                            >
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
                                    title="Aprobar ajuste"
                                  >
                                    <CheckIcon className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => rejectHourQuote(quote.id)}
                                    title="Rechazar ajuste"
                                  >
                                    <XCircleIcon className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteHourQuote(quote.id)}
                                title="Eliminar registro"
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
                <CardTitle>Nuevo Ajuste Manual</CardTitle>
                <CardDescription>Registra un ajuste manual de horas (opcional)</CardDescription>
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
                  <Label htmlFor="quoteHours">Ajuste de Horas</Label>
                  <Input
                    id="quoteHours"
                    type="number"
                    value={newHourQuote.requestedHours}
                    onChange={(e) => setNewHourQuote({ ...newHourQuote, requestedHours: Number(e.target.value) })}
                    placeholder="10 (usar - para restar horas)"
                    step="0.5"
                  />
                  <p className="text-xs text-gray-500">Usa números negativos para marcar pagos manuales</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quoteDescription">Descripción</Label>
                  <Textarea
                    id="quoteDescription"
                    value={newHourQuote.description}
                    onChange={(e) => setNewHourQuote({ ...newHourQuote, description: e.target.value })}
                    placeholder="Describe el ajuste..."
                  />
                </div>
                <Button onClick={addHourQuote} className="w-full" disabled={clients.length === 0}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Registrar Ajuste
                </Button>
                {clients.length === 0 && (
                  <p className="text-sm text-gray-500 text-center">Primero debes agregar clientes</p>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case "budgets":
        return (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                variant={budgetFilter === "all" ? "default" : "outline"}
                onClick={() => setBudgetFilter("all")}
                size="sm"
              >
                Todos ({budgets.length})
              </Button>
              <Button
                variant={budgetFilter === "paid" ? "default" : "outline"}
                onClick={() => setBudgetFilter("paid")}
                size="sm"
              >
                Pagados ({budgets.filter((b) => b.status === "paid").length})
              </Button>
              <Button
                variant={budgetFilter === "pending" ? "default" : "outline"}
                onClick={() => setBudgetFilter("pending")}
                size="sm"
              >
                Pendientes ({budgets.filter((b) => b.status === "pending").length})
              </Button>
              <Button
                variant={budgetFilter === "overdue" ? "default" : "outline"}
                onClick={() => setBudgetFilter("overdue")}
                size="sm"
              >
                Vencidos ({budgets.filter((b) => b.status === "overdue").length})
              </Button>
            </div>

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
                {budgets.filter((b) => budgetFilter === "all" || b.status === budgetFilter).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {budgetFilter === "all"
                        ? "No hay presupuestos registrados."
                        : `No hay presupuestos ${
                            budgetFilter === "paid" ? "pagados" : budgetFilter === "pending" ? "pendientes" : "vencidos"
                          }.`}
                    </p>
                    {budgetFilter === "all" && (
                      <Link href="/budget-report">
                        <Button className="mt-4">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Crear tu primer presupuesto
                        </Button>
                      </Link>
                    )}
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
                      {budgets
                        .filter((b) => budgetFilter === "all" || b.status === budgetFilter)
                        .map((budget) => (
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
          </div>
        )

      case "clients":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Gestiona tus clientes y sus horas pendientes de pago</CardDescription>
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
                        <TableHead className="text-right">Horas Pendientes</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium">{client.name}</TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell className="text-right">
                            <span
                              className={client.consumed_hours > 0 ? "text-orange-600 font-semibold" : "text-gray-600"}
                            >
                              {client.consumed_hours}h
                            </span>
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
              </CardContent>
            </Card>
          </div>
        )

      case "hours":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Registro de Horas Trabajadas</CardTitle>
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
                        <TableHead className="w-[200px]">Acciones</TableHead>
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
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markHourAsPaid(entry.id)}
                                title="Marcar como hora pagada"
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                Pagada
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteHourEntry(entry.id)}
                                title="Eliminar registro"
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
                <CardTitle>Registrar Horas Trabajadas</CardTitle>
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
                        {client.name} ({client.consumed_hours}h pendientes)
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
        )

      case "reports":
        return (
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
                      <CardDescription>Reporte de horas trabajadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg">
                          <span className="text-sm font-medium">Horas Pendientes de Pago:</span>
                          <span className="text-2xl font-bold text-orange-600">{client.consumed_hours}h</span>
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
        )

      case "settings":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información de la Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Empresa</CardTitle>
                <CardDescription>Configura el logo y nombre de tu empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="APEX CONSULTING"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Logo de la Empresa</Label>
                  <div className="flex items-center gap-4">
                    {companyLogoPreview && (
                      <div className="w-16 h-16 border rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={companyLogoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        id="companyLogo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formatos: JPG, PNG, SVG. Tamaño recomendado: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={saveCompanyInfo} className="w-full" disabled={uploadingLogo}>
                  {uploadingLogo ? "Guardando..." : "Guardar Información de Empresa"}
                </Button>
              </CardContent>
            </Card>

            {/* Perfil de Usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Perfil de Usuario</CardTitle>
                <CardDescription>Configura tu foto de perfil y información personal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar">Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 border rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview || "/placeholder.svg"}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG. Tamaño recomendado: 200x200px</p>
                    </div>
                  </div>
                </div>

                <Button onClick={saveUserProfileInfo} className="w-full" disabled={uploadingAvatar}>
                  {uploadingAvatar ? "Guardando..." : "Guardar Perfil"}
                </Button>
              </CardContent>
            </Card>

            {/* Cambiar Contraseña */}
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso al sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={configLoading}>
                    {configLoading ? "Actualizando..." : "Cambiar Contraseña"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Información de la Cuenta */}
            <Card>
              <CardHeader>
                <CardTitle>Información de la Cuenta</CardTitle>
                <CardDescription>Detalles de tu cuenta actual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Email/Usuario</Label>
                  <div className="p-2 bg-gray-50 rounded-md text-sm">
                    {user?.email === "admin@apexconsulting.com" ? "admin" : user?.email}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fecha de Registro</Label>
                  <div className="p-2 bg-gray-50 rounded-md text-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-ES") : "No disponible"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Último Acceso</Label>
                  <div className="p-2 bg-gray-50 rounded-md text-sm">
                    {user?.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString("es-ES")
                      : "No disponible"}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensaje de configuración */}
            {configMessage && (
              <div className="lg:col-span-2">
                <div
                  className={`p-3 rounded-md text-sm ${
                    configMessage.includes("exitosamente") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {configMessage}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return <div>Selecciona una opción del menú</div>
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar
        budgetsCount={budgets.length}
        clientsCount={clients.length}
        quotesCount={hourQuotes.length}
        hoursCount={hourEntries.length}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{getTabTitle(activeTab)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4">
            <div className="aspect-video rounded-xl bg-muted/50 hidden" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">{renderTabContent()}</div>
        </div>
      </SidebarInset>

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
                  <p className="p-2 bg-gray-50 rounded">{new Date(selectedBudget.date).toLocaleDateString("es-ES")}</p>
                </div>

                <div>
                  <Label>Estado</Label>
                  <div className="p-2">{getStatusBadge(selectedBudget.status)}</div>
                </div>

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
    </SidebarProvider>
  )
}
