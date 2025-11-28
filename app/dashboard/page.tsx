"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  CheckCircleIcon,
  ClockIcon,
  DatabaseIcon,
  AlertTriangleIcon,
  Trash2Icon,
  PencilIcon,
  SaveIcon,
  XIcon,
  DollarSignIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FileTextIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseData } from "@/hooks/useSupabaseData"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardCards } from "@/components/dashboard-cards"
import { DebtReport } from "@/components/debt-report"
import { AddHoursDialog } from "@/components/add-hours-dialog"
import { RegisterPaymentDialog } from "@/components/register-payment-dialog"

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
  paid_amount?: number
}

interface Client {
  id: string
  name: string
  email?: string
  total_hours: number
  consumed_hours: number
  remaining_hours: number
}

interface HourEntry {
  id: string
  client_id: string | null
  client_name: string
  date: string
  hours: number
  description: string
  project: string
  paid?: boolean
  budget_id?: string
  budget_name?: string
  type?: "add" | "subtract"
}

export default function DashboardPage() {
  const router = useRouter()

  // Estados para edición de clientes
  const [editingClient, setEditingClient] = useState<string | null>(null)
  const [editClientName, setEditClientName] = useState("")
  const [editClientEmail, setEditClientEmail] = useState("")

  // Estados para agregar nuevos clientes
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")

  // Estados para configuración y filtros
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedClientForDebtReport, setSelectedClientForDebtReport] = useState<string>("all")

  // Estados para configuración de empresa y perfil
  const [companyName, setCompanyName] = useState("")
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [showRegisterPaymentDialog, setShowRegisterPaymentDialog] = useState(false)
  const [selectedBudgetForPayment, setSelectedBudgetForPayment] = useState<string | undefined>()

  const { user, updatePassword } = useAuth()
  const {
    budgets,
    clients,
    hourEntries,
    invoices,
    loading,
    tablesExist,
    dbError,
    saveClient,
    updateClient,
    deleteClient,
    saveHourEntry,
    deleteHourEntry,
    markHourEntryAsPaid,
    deleteBudget,
    companySettings,
    userProfile,
    saveCompanySettings,
    saveUserProfile,
    checkTablesExist,
    budgetPayments,
    registerBudgetPayment,
    deleteBudgetPayment,
    getPaymentsByBudget,
  } = useSupabaseData()

  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  // Cargar configuración de empresa y perfil
  useEffect(() => {
    if (companySettings) {
      setCompanyName(companySettings.company_name || "")
      setCompanyLogoPreview(companySettings.company_logo_url || null)
    }
    if (userProfile) {
      setFullName(userProfile.full_name || "")
      setAvatarPreview(userProfile.avatar_url || null)
    }
  }, [companySettings, userProfile])

  // Función para manejar cambio de tab
  const handleTabChange = (tab: string) => {
    if (tab === "new-budget") {
      router.push("/budget-report")
    } else {
      setActiveTab(tab)
    }
  }

  // Función para guardar entrada de horas
  const handleSaveHourEntry = async (entry: {
    budget_id: string
    budget_name: string
    client_name: string
    project: string
    hours: number
    type: "add" | "subtract"
    description: string
    date: string
  }) => {
    const client = clients.find((c) => c.name === entry.client_name)
    await saveHourEntry({
      client_id: client?.id || null,
      client_name: entry.client_name,
      project: entry.project,
      hours: entry.hours,
      description: entry.description,
      date: entry.date,
      budget_id: entry.budget_id,
      budget_name: entry.budget_name,
      type: entry.type,
    })
  }

  // Funciones para manejar clientes
  const handleSaveClient = async () => {
    if (!newClientName.trim()) return
    await saveClient({
      name: newClientName,
      email: newClientEmail || "",
    })
    setNewClientName("")
    setNewClientEmail("")
  }

  const handleUpdateClient = async (id: string) => {
    if (!editClientName.trim()) return
    await updateClient(id, {
      name: editClientName,
      email: editClientEmail || "",
    })
    setEditingClient(null)
    setEditClientName("")
    setEditClientEmail("")
  }

  const handleDeleteClient = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente?")) {
      await deleteClient(id)
    }
  }

  // Funciones para manejar horas
  const handleDeleteHourEntry = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro de horas?")) {
      await deleteHourEntry(id)
    }
  }

  const handleMarkHourAsPaid = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres marcar este registro como pagado?")) {
      await markHourEntryAsPaid(id)
    }
  }

  // Funciones de configuración
  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      await updatePassword(newPassword)
      setPasswordSuccess("Contraseña actualizada correctamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      setPasswordError(error.message || "Error al actualizar la contraseña")
    }
  }

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCompanyLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCompanyLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCompanySettings = async () => {
    setUploadingLogo(true)
    try {
      let logoUrl = companySettings?.company_logo_url || null
      if (companyLogo) {
        logoUrl = companyLogoPreview
      }
      await saveCompanySettings({
        company_name: companyName,
        company_logo_url: logoUrl || undefined,
      })
      setCompanyLogo(null)
    } catch (error) {
      console.error("Error saving company settings:", error)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSaveUserProfile = async () => {
    setUploadingAvatar(true)
    try {
      let avatarUrl = userProfile?.avatar_url || null
      if (avatarFile) {
        avatarUrl = avatarPreview
      }
      await saveUserProfile({
        full_name: fullName,
        avatar_url: avatarUrl || undefined,
      })
      setAvatarFile(null)
    } catch (error) {
      console.error("Error saving user profile:", error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRegisterPayment = async (paymentData: {
    budget_id: string
    amount: number
    payment_date: string
    payment_method: string
    reference_number: string
    notes: string
  }) => {
    await registerBudgetPayment(paymentData)
  }

  const handleOpenPaymentDialog = (budgetId?: string) => {
    setSelectedBudgetForPayment(budgetId)
    setShowRegisterPaymentDialog(true)
  }

  // Función para ver/editar un presupuesto desde el reporte de deudas
  const handleViewBudgetFromDebtReport = (budget: Budget) => {
    // Guardar el presupuesto en sessionStorage para cargarlo en budget-report
    sessionStorage.setItem('loadBudget', JSON.stringify({
      id: budget.id,
      number: budget.number,
      client_name: budget.client_name,
      project_name: budget.project_name,
      project_description: budget.project_description || '',
      total: budget.total,
      items: budget.items || [],
      date: budget.date,
      status: budget.status,
    }))
    router.push('/budget-report?mode=view')
  }

  // Función para reimprimir un presupuesto
  const handlePrintBudgetFromDebtReport = (budget: Budget) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const currentDate = new Date(budget.date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const budgetItems = budget.items || []
    const totalBudget = budgetItems.reduce((sum: number, item: any) => sum + (item.quantity * item.rate), 0)

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presupuesto #${budget.number} - ${budget.project_name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);
      min-height: 100vh;
      padding: 40px;
      color: #ffffff;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
      border-radius: 24px;
      border: 1px solid rgba(255,255,255,0.1);
      overflow: hidden;
      box-shadow: 
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        0 0 0 1px rgba(255,255,255,0.05),
        inset 0 1px 0 rgba(255,255,255,0.1);
    }
    
    /* Header con gradiente espectacular */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      padding: 40px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .company-section {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .company-logo {
      width: 70px;
      height: 70px;
      background: rgba(255,255,255,0.2);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      overflow: hidden;
    }
    
    .company-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .company-logo-text {
      font-size: 32px;
      font-weight: 800;
      color: white;
    }
    
    .company-info h1 {
      font-size: 28px;
      font-weight: 800;
      color: white;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      margin-bottom: 4px;
    }
    
    .company-info p {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      font-weight: 500;
    }
    
    .budget-badge {
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 16px;
      padding: 20px 30px;
      text-align: right;
    }
    
    .budget-badge h2 {
      font-size: 14px;
      color: rgba(255,255,255,0.8);
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }
    
    .budget-badge .number {
      font-size: 32px;
      font-weight: 800;
      color: white;
    }
    
    .budget-badge .date {
      font-size: 13px;
      color: rgba(255,255,255,0.7);
      margin-top: 8px;
    }
    
    /* Sección del cliente */
    .client-section {
      padding: 40px;
      background: linear-gradient(180deg, rgba(102,126,234,0.1) 0%, transparent 100%);
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    
    .client-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    
    .client-info-box {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 24px;
    }
    
    .client-info-box .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .client-info-box .value {
      font-size: 20px;
      font-weight: 700;
      color: white;
    }
    
    /* Descripción del proyecto */
    .project-description {
      padding: 0 40px 40px;
    }
    
    .description-card {
      background: linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%);
      border: 1px solid rgba(102,126,234,0.2);
      border-radius: 16px;
      padding: 24px;
    }
    
    .description-card h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .description-card h3::before {
      content: '';
      width: 4px;
      height: 4px;
      background: #667eea;
      border-radius: 50%;
    }
    
    .description-card p {
      font-size: 15px;
      line-height: 1.7;
      color: rgba(255,255,255,0.8);
    }
    
    /* Tabla de items */
    .items-section {
      padding: 0 40px 40px;
    }
    
    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .items-header h3 {
      font-size: 18px;
      font-weight: 700;
      color: white;
    }
    
    .items-count {
      background: rgba(102,126,234,0.2);
      color: #667eea;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
    }
    
    .items-table thead {
      background: linear-gradient(135deg, rgba(102,126,234,0.3) 0%, rgba(118,75,162,0.3) 100%);
    }
    
    .items-table th {
      padding: 18px 20px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.9);
      font-weight: 600;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .items-table th:last-child {
      text-align: right;
    }
    
    .items-table td {
      padding: 20px;
      font-size: 14px;
      color: rgba(255,255,255,0.9);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      background: rgba(255,255,255,0.02);
    }
    
    .items-table tbody tr:hover td {
      background: rgba(102,126,234,0.05);
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .items-table td:last-child {
      text-align: right;
      font-weight: 600;
      color: white;
    }
    
    .item-category {
      display: inline-block;
      background: rgba(102,126,234,0.15);
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 4px;
    }
    
    .item-description {
      font-weight: 500;
      color: white;
    }
    
    .item-quantity {
      color: rgba(255,255,255,0.7);
    }
    
    .item-rate {
      color: rgba(255,255,255,0.7);
    }
    
    .item-subtotal {
      font-size: 15px;
      font-weight: 700;
      color: #10b981 !important;
    }
    
    /* Sección de totales */
    .totals-section {
      padding: 40px;
      background: linear-gradient(180deg, transparent 0%, rgba(16,185,129,0.05) 100%);
    }
    
    .total-card {
      display: flex;
      justify-content: flex-end;
    }
    
    .total-box {
      background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
      border-radius: 20px;
      padding: 30px 50px;
      text-align: center;
      position: relative;
      overflow: hidden;
      box-shadow: 
        0 20px 40px rgba(16, 185, 129, 0.3),
        0 0 0 1px rgba(255,255,255,0.1);
    }
    
    .total-box::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%);
    }
    
    .total-box .total-label {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 8px;
      position: relative;
    }
    
    .total-box .total-amount {
      font-size: 42px;
      font-weight: 800;
      color: white;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      position: relative;
    }
    
    .total-box .currency {
      font-size: 24px;
      font-weight: 600;
    }
    
    /* Footer */
    .footer {
      padding: 30px 40px;
      background: rgba(0,0,0,0.2);
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-info {
      display: flex;
      gap: 30px;
    }
    
    .footer-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.5);
      font-size: 13px;
    }
    
    .footer-item .dot {
      width: 6px;
      height: 6px;
      background: #667eea;
      border-radius: 50%;
    }
    
    .validity {
      background: rgba(102,126,234,0.1);
      border: 1px solid rgba(102,126,234,0.2);
      border-radius: 10px;
      padding: 10px 20px;
      font-size: 12px;
      color: #a5b4fc;
    }
    
    /* Botones de impresión */
    .print-actions {
      max-width: 900px;
      margin: 30px auto 0;
      display: flex;
      justify-content: center;
      gap: 15px;
    }
    
    .print-actions button {
      padding: 14px 32px;
      border: none;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Inter', sans-serif;
    }
    
    .btn-print {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 10px 30px rgba(102,126,234,0.4);
    }
    
    .btn-print:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(102,126,234,0.5);
    }
    
    .btn-close {
      background: rgba(255,255,255,0.1);
      color: white;
      border: 1px solid rgba(255,255,255,0.2);
    }
    
    .btn-close:hover {
      background: rgba(255,255,255,0.15);
    }
    
    /* Estilos de impresión */
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .container {
        box-shadow: none !important;
        border: none !important;
        background: white !important;
      }
      
      .header {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .print-actions {
        display: none !important;
      }
      
      @page {
        size: A4;
        margin: 10mm;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="company-section">
          <div class="company-logo">
            ${companySettings?.company_logo_url 
              ? `<img src="${companySettings.company_logo_url}" alt="Logo" />`
              : `<span class="company-logo-text">A</span>`
            }
          </div>
          <div class="company-info">
            <h1>${companySettings?.company_name || 'APEX CONSULTING'}</h1>
            <p>Soluciones Tecnológicas de Alto Impacto</p>
          </div>
        </div>
        <div class="budget-badge">
          <h2>Presupuesto</h2>
          <div class="number">#${budget.number}</div>
          <div class="date">${currentDate}</div>
        </div>
      </div>
    </div>
    
    <!-- Client Section -->
    <div class="client-section">
      <div class="client-card">
        <div class="client-info-box">
          <div class="label">Cliente</div>
          <div class="value">${budget.client_name}</div>
        </div>
        <div class="client-info-box">
          <div class="label">Proyecto</div>
          <div class="value">${budget.project_name}</div>
        </div>
      </div>
    </div>
    
    ${budget.project_description ? `
    <!-- Project Description -->
    <div class="project-description">
      <div class="description-card">
        <h3>Descripción del Proyecto</h3>
        <p>${budget.project_description}</p>
      </div>
    </div>
    ` : ''}
    
    <!-- Items Table -->
    <div class="items-section">
      <div class="items-header">
        <h3>Desglose del Presupuesto</h3>
        <span class="items-count">${budgetItems.length} ítem${budgetItems.length !== 1 ? 's' : ''}</span>
      </div>
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 30%">Descripción</th>
            <th style="width: 20%">Cantidad</th>
            <th style="width: 20%">Tarifa Unitaria</th>
            <th style="width: 20%">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${budgetItems.length === 0 
            ? `<tr><td colspan="4" style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px;">No hay ítems en el presupuesto</td></tr>`
            : budgetItems.map((item: any) => `
              <tr>
                <td>
                  ${item.category ? `<span class="item-category">${item.category}</span><br>` : ''}
                  <span class="item-description">${item.description}</span>
                </td>
                <td class="item-quantity">${item.quantity} ${item.unit || 'unidades'}</td>
                <td class="item-rate">$${Number(item.rate).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td class="item-subtotal">$${(item.quantity * item.rate).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
    
    <!-- Totals Section -->
    <div class="totals-section">
      <div class="total-card">
        <div class="total-box">
          <div class="total-label">Total del Presupuesto</div>
          <div class="total-amount">
            <span class="currency">$</span>${totalBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-item">
            <span class="dot"></span>
            Presupuesto generado automáticamente
          </div>
          <div class="footer-item">
            <span class="dot"></span>
            ${companySettings?.company_name || 'APEX CONSULTING'}
          </div>
        </div>
        <div class="validity">
          Válido por 30 días
        </div>
      </div>
    </div>
  </div>
  
  <!-- Print Actions -->
  <div class="print-actions">
    <button class="btn-print" onclick="window.print()">
      🖨️ Imprimir / Guardar PDF
    </button>
    <button class="btn-close" onclick="window.close()">
      ✕ Cerrar
    </button>
  </div>
</body>
</html>
`
    printWindow.document.write(printHTML)
    printWindow.document.close()
  }

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case "dashboard":
        return "Dashboard General"
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

  const getHoursByBudget = (budgetId: string) => {
    return hourEntries
      .filter((entry) => entry.budget_id === budgetId)
      .reduce((sum, entry) => sum + (entry.hours || 0), 0)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardCards budgets={budgets} clients={clients} hourEntries={hourEntries} />

      case "budgets":
        return (
          <div className="space-y-4">
            <div className="flex justify-end mb-4">
              <Button onClick={() => handleOpenPaymentDialog()} className="bg-green-600 hover:bg-green-700">
                <DollarSignIcon className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>

            <Card className="mb-6 border border-white/10 bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileTextIcon className="h-5 w-5 text-blue-400" />
                  Filtrar Reporte de Deudas por Cliente
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Selecciona un cliente para ver únicamente sus deudas pendientes y presupuestos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <select
                    value={selectedClientForDebtReport}
                    onChange={(e) => setSelectedClientForDebtReport(e.target.value)}
                    className="flex-1 p-3 rounded-lg border border-white/20 bg-[#1a1a2e] text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg [&>option]:bg-[#1a1a2e] [&>option]:text-white"
                  >
                    <option value="all">📊 Todos los clientes (Reporte General)</option>
                    {clients.map((client) => {
                      const clientBudgets = budgets.filter((b) => b.client_name === client.name)
                      const totalDebt = clientBudgets.reduce((sum, b) => {
                        const paid = (b as any).paid_amount || 0
                        return sum + (b.total - paid)
                      }, 0)
                      return (
                        <option key={client.id} value={client.id}>
                          👤 {client.name} - Deuda: $
                          {totalDebt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </option>
                      )
                    })}
                  </select>
                </div>
              </CardContent>
            </Card>

            <DebtReport
              budgets={budgets}
              clients={clients}
              invoices={invoices}
              selectedClientId={selectedClientForDebtReport}
              companyName={companySettings?.company_name || "APEX CONSULTING"}
              companyLogoUrl={companySettings?.company_logo_url || null}
              onRegisterPayment={handleOpenPaymentDialog}
              onViewBudget={handleViewBudgetFromDebtReport}
              onPrintBudget={handlePrintBudgetFromDebtReport}
              budgetPayments={budgetPayments}
              getPaymentsByBudget={getPaymentsByBudget}
            />
          </div>
        )

      case "clients":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Administra tu base de clientes</CardDescription>
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
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Horas Consumidas</TableHead>
                        <TableHead className="w-[150px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            {editingClient === client.id ? (
                              <Input
                                value={editClientName}
                                onChange={(e) => setEditClientName(e.target.value)}
                                placeholder="Nombre del cliente"
                              />
                            ) : (
                              client.name
                            )}
                          </TableCell>
                          <TableCell>
                            {editingClient === client.id ? (
                              <Input
                                value={editClientEmail}
                                onChange={(e) => setEditClientEmail(e.target.value)}
                                placeholder="Email del cliente"
                              />
                            ) : (
                              client.email || "-"
                            )}
                          </TableCell>
                          <TableCell>{client.consumed_hours || 0}</TableCell>
                          <TableCell>
                            {editingClient === client.id ? (
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" onClick={() => handleUpdateClient(client.id)}>
                                  <SaveIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingClient(null)
                                    setEditClientName("")
                                    setEditClientEmail("")
                                  }}
                                >
                                  <XIcon className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingClient(client.id)
                                    setEditClientName(client.name)
                                    setEditClientEmail(client.email || "")
                                  }}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-600"
                                  onClick={() => handleDeleteClient(client.id)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
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
                    placeholder="Nombre del cliente"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email (Opcional)</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveClient} disabled={!newClientName.trim()} className="w-full">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Agregar Cliente
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      case "hours":
        return (
          <div className="space-y-6">
            {/* Header with Add Hours Button */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Control de Horas</h2>
                <p className="text-gray-400">Registra y gestiona las horas asociadas a presupuestos</p>
              </div>
              <AddHoursDialog budgets={budgets} onSave={handleSaveHourEntry} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Horas</p>
                      <p className="text-2xl font-bold">
                        {hourEntries.reduce((sum, e) => sum + Math.abs(e.hours || 0), 0).toFixed(1)}
                      </p>
                    </div>
                    <ClockIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Horas Sumadas</p>
                      <p className="text-2xl font-bold text-green-600">
                        +
                        {hourEntries
                          .filter((e) => (e.hours || 0) > 0)
                          .reduce((sum, e) => sum + (e.hours || 0), 0)
                          .toFixed(1)}
                      </p>
                    </div>
                    <TrendingUpIcon className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Horas Restadas</p>
                      <p className="text-2xl font-bold text-red-600">
                        {hourEntries
                          .filter((e) => (e.hours || 0) < 0)
                          .reduce((sum, e) => sum + (e.hours || 0), 0)
                          .toFixed(1)}
                      </p>
                    </div>
                    <TrendingDownIcon className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Balance Neto</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {hourEntries.reduce((sum, e) => sum + (e.hours || 0), 0).toFixed(1)}
                      </p>
                    </div>
                    <DollarSignIcon className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hours Table */}
            <Card>
              <CardHeader>
                <CardTitle>Registro de Horas</CardTitle>
                <CardDescription>Historial de horas trabajadas asociadas a presupuestos</CardDescription>
              </CardHeader>
              <CardContent>
                {hourEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No hay registros de horas.</p>
                    <p className="text-gray-400 text-sm">Usa el botón "Registrar Horas" para comenzar.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Presupuesto</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-right">Horas</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hourEntries.map((entry) => (
                        <TableRow
                          key={entry.id}
                          className={entry.paid ? "bg-green-500/10 opacity-75" : (entry.hours || 0) < 0 ? "bg-red-500/10" : ""}
                        >
                          <TableCell className={entry.paid ? "line-through text-gray-500" : ""}>
                            {new Date(entry.date).toLocaleDateString("es-ES")}
                          </TableCell>
                          <TableCell className={entry.paid ? "line-through text-gray-500" : ""}>
                            {entry.budget_name || "-"}
                          </TableCell>
                          <TableCell className={entry.paid ? "line-through text-gray-500" : ""}>
                            {entry.client_name}
                          </TableCell>
                          <TableCell className={entry.paid ? "line-through text-gray-500" : ""}>
                            {entry.description}
                          </TableCell>
                          <TableCell
                            className={`text-right font-bold ${
                              entry.paid
                                ? "line-through text-gray-500"
                                : (entry.hours || 0) > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                            }`}
                          >
                            {(entry.hours || 0) > 0 ? "+" : ""}
                            {entry.hours}
                          </TableCell>
                          <TableCell>
                            {entry.paid ? (
                              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Pagado</Badge>
                            ) : (entry.hours || 0) > 0 ? (
                              <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">Sumado</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">Restado</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {entry.paid ? (
                              <span className="text-green-400 text-sm">✓ Cerrado</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-green-400 hover:text-green-300 hover:bg-green-500/20"
                                  onClick={() => handleMarkHourAsPaid(entry.id)}
                                  title="Marcar como pagado"
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  onClick={() => handleDeleteHourEntry(entry.id)}
                                  title="Eliminar"
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Hours by Budget Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen por Presupuesto</CardTitle>
                <CardDescription>Total de horas registradas por cada presupuesto</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {budgets.map((budget) => {
                    const budgetHours = getHoursByBudget(budget.id)
                    return (
                      <div
                        key={budget.id}
                        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white">{budget.project_name}</p>
                            <p className="text-sm text-gray-400">{budget.client_name}</p>
                            <p className="text-xs text-gray-500">#{budget.number}</p>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-xl font-bold ${
                                budgetHours > 0 ? "text-green-600" : budgetHours < 0 ? "text-red-600" : "text-gray-400"
                              }`}
                            >
                              {budgetHours > 0 ? "+" : ""}
                              {budgetHours.toFixed(1)}h
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "reports":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reportes Disponibles</CardTitle>
                <CardDescription>Genera y descarga reportes de tu negocio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <TrendingUpIcon className="h-6 w-6" />
                    Reporte de Ingresos
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <ClockIcon className="h-6 w-6" />
                    Reporte de Horas
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center justify-center gap-2 bg-transparent"
                  >
                    <FileTextIcon className="h-6 w-6" />
                    Reporte de Presupuestos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "settings":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuración de Empresa */}
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Empresa</CardTitle>
                <CardDescription>Personaliza los datos de tu empresa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    placeholder="Nombre de tu empresa"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Logo de la Empresa</Label>
                  <div className="flex items-center gap-4">
                    {companyLogoPreview && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border">
                        <img
                          src={companyLogoPreview || "/placeholder.svg"}
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <Input id="companyLogo" type="file" accept="image/*" onChange={handleCompanyLogoChange} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveCompanySettings} disabled={uploadingLogo} className="w-full">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {uploadingLogo ? "Guardando..." : "Guardar Configuración"}
                </Button>
              </CardFooter>
            </Card>

            {/* Perfil de Usuario */}
            <Card>
              <CardHeader>
                <CardTitle>Perfil de Usuario</CardTitle>
                <CardDescription>Actualiza tu información personal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="Tu nombre completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Foto de Perfil</Label>
                  <div className="flex items-center gap-4">
                    {avatarPreview && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border">
                        <img
                          src={avatarPreview || "/placeholder.svg"}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveUserProfile} disabled={uploadingAvatar} className="w-full">
                  <SaveIcon className="h-4 w-4 mr-2" />
                  {uploadingAvatar ? "Guardando..." : "Guardar Perfil"}
                </Button>
              </CardFooter>
            </Card>

            {/* Cambio de Contraseña */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
                {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
                {passwordSuccess && <p className="text-sm text-green-600">{passwordSuccess}</p>}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePasswordChange}
                  disabled={!newPassword || !confirmPassword || currentPassword.length === 0}
                >
                  Cambiar Contraseña
                </Button>
              </CardFooter>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (dbError || !tablesExist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="w-full max-w-2xl bg-[#12121a] border-white/10">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <DatabaseIcon className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">Base de Datos No Configurada</CardTitle>
            <CardDescription className="text-gray-400">Las tablas de la base de datos no existen aún</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-red-300 font-semibold mb-2">Error:</p>
                  <p className="text-red-200 text-sm">{dbError}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-300 mb-3">📋 Pasos para Configurar la Base de Datos:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-blue-200">
                <li>
                  Ve a tu proyecto de Supabase: <strong className="text-blue-100">https://supabase.com/dashboard</strong>
                </li>
                <li>
                  Navega a <strong className="text-blue-100">SQL Editor</strong> en el menú lateral
                </li>
                <li>
                  Ejecuta los scripts SQL que están en la carpeta <code className="bg-blue-500/20 px-1 rounded">scripts/</code>
                </li>
              </ol>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={checkTablesExist} className="flex-1">
                <DatabaseIcon className="h-4 w-4 mr-2" />
                Verificar Base de Datos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        budgetsCount={budgets.length}
        clientsCount={clients.length}
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
          <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">{renderTabContent()}</div>
        </div>
      </SidebarInset>
      <RegisterPaymentDialog
        open={showRegisterPaymentDialog}
        onOpenChange={setShowRegisterPaymentDialog}
        budgets={budgets}
        selectedBudgetId={selectedBudgetForPayment}
        onSave={handleRegisterPayment}
      />
    </SidebarProvider>
  )
}
