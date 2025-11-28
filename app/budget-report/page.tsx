"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Trash2Icon, 
  PrinterIcon, 
  ArrowLeftIcon, 
  SaveIcon, 
  FolderOpenIcon, 
  FileTextIcon,
  ChevronRightIcon,
  CalendarIcon,
  DollarSignIcon,
  PlusIcon,
  XIcon,
  EyeIcon,
  SearchIcon
} from "lucide-react"
import Link from "next/link"
import { useBudgetStorage } from "@/hooks/useBudgetStorage"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface BudgetItem {
  id: string
  category: string
  description: string
  quantity: number
  rate: number
  unit: string
}

interface SavedBudget {
  id: string
  number: string
  client_name: string
  project_name: string
  project_description?: string
  total: number
  date: string
  status: string
  items?: BudgetItem[]
}

export default function InteractiveBudgetReport() {
  const { user } = useAuth()
  const router = useRouter()
  const { saveBudget, getNextBudgetNumber } = useBudgetStorage()
  const { companySettings: settings, budgets: savedBudgets } = useSupabaseData()

  const [clientName, setClientName] = useState<string>("")
  const [projectName, setProjectName] = useState<string>("")
  const [projectDescription, setProjectDescription] = useState<string>("")
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])

  const [reportNumber, setReportNumber] = useState<number>(589)
  const [startCorrelativeFrom, setStartCorrelativeFrom] = useState<string>("589")
  
  // Estados para el panel de presupuestos guardados
  const [showSavedBudgets, setShowSavedBudgets] = useState<boolean>(false)
  const [selectedBudget, setSelectedBudget] = useState<SavedBudget | null>(null)
  const [isViewingMode, setIsViewingMode] = useState<boolean>(false)
  const [searchTerm, setSearchTerm] = useState<string>("")

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  // Cargar presupuesto desde sessionStorage si viene desde el reporte de deudas
  useEffect(() => {
    const loadBudgetData = sessionStorage.getItem('loadBudget')
    if (loadBudgetData) {
      try {
        const budget = JSON.parse(loadBudgetData)
        setClientName(budget.client_name)
        setProjectName(budget.project_name)
        setProjectDescription(budget.project_description || "")
        setBudgetItems(budget.items || [])
        setReportNumber(parseInt(budget.number, 10) || 589)
        setStartCorrelativeFrom(budget.number)
        setSelectedBudget(budget)
        setIsViewingMode(true)
        
        // Limpiar sessionStorage después de cargar
        sessionStorage.removeItem('loadBudget')
      } catch (error) {
        console.error("Error loading budget from session:", error)
      }
    }
  }, [])

  // Cargar el siguiente número de presupuesto al montar el componente
  useEffect(() => {
    const loadNextNumber = async () => {
      if (user) {
        const nextNumber = await getNextBudgetNumber()
        setReportNumber(nextNumber)
        setStartCorrelativeFrom(nextNumber.toString())
      }
    }
    loadNextNumber()
  }, [user, getNextBudgetNumber])

  useEffect(() => {
    const parsedNumber = Number.parseInt(startCorrelativeFrom, 10)
    if (!isNaN(parsedNumber) && parsedNumber >= 1) {
      setReportNumber(parsedNumber)
    } else {
      setReportNumber(1)
    }
  }, [startCorrelativeFrom])

  const [newItem, setNewItem] = useState<Omit<BudgetItem, "id">>({
    category: "",
    description: "",
    quantity: 0,
    rate: 0,
    unit: "",
  })

  const handleAddItem = () => {
    if (newItem.description && newItem.quantity > 0 && newItem.rate > 0) {
      setBudgetItems([...budgetItems, { ...newItem, id: crypto.randomUUID() }])
      setNewItem({ category: "", description: "", quantity: 0, rate: 0, unit: "" })
    } else {
      alert("Por favor, completa todos los campos del nuevo ítem y asegúrate que cantidad y tarifa sean mayores a 0.")
    }
  }

  const handleRemoveItem = (id: string) => {
    setBudgetItems(budgetItems.filter((item) => item.id !== id))
  }

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.quantity * item.rate, 0)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presupuesto #${reportNumber.toString().padStart(4, "0")} - ${projectName}</title>
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
      animation: shimmer 3s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      0%, 100% { transform: translateX(-50%) rotate(0deg); }
      50% { transform: translateX(0%) rotate(5deg); }
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
    
    .client-info-box .sub-value {
      font-size: 14px;
      color: rgba(255,255,255,0.6);
      margin-top: 4px;
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
            ${settings?.company_logo_url 
              ? `<img src="${settings.company_logo_url}" alt="Logo" />`
              : `<span class="company-logo-text">A</span>`
            }
          </div>
          <div class="company-info">
            <h1>${settings?.company_name || 'APEX CONSULTING'}</h1>
            <p>Soluciones Tecnológicas de Alto Impacto</p>
          </div>
        </div>
        <div class="budget-badge">
          <h2>Presupuesto</h2>
          <div class="number">#${reportNumber.toString().padStart(4, "0")}</div>
          <div class="date">${currentDate}</div>
        </div>
      </div>
    </div>
    
    <!-- Client Section -->
    <div class="client-section">
      <div class="client-card">
        <div class="client-info-box">
          <div class="label">Cliente</div>
          <div class="value">${clientName || '[Nombre del Cliente]'}</div>
        </div>
        <div class="client-info-box">
          <div class="label">Proyecto</div>
          <div class="value">${projectName || '[Nombre del Proyecto]'}</div>
        </div>
      </div>
    </div>
    
    ${projectDescription ? `
    <!-- Project Description -->
    <div class="project-description">
      <div class="description-card">
        <h3>Descripción del Proyecto</h3>
        <p>${projectDescription}</p>
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
            : budgetItems.map((item) => `
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
            ${settings?.company_name || 'APEX CONSULTING'}
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

  const handleSaveBudget = async () => {
    if (!clientName || !projectName || budgetItems.length === 0) {
      alert("Por favor, completa al menos el nombre del cliente, proyecto y añade al menos un ítem al presupuesto.")
      return
    }

    const budgetData = {
      clientName,
      projectName,
      projectDescription,
      budgetItems,
      reportNumber,
      total: totalBudget,
    }

    const savedBudget = await saveBudget(budgetData)
    if (savedBudget) {
      alert(`Presupuesto #${savedBudget.number} guardado exitosamente!`)

      // Limpiar formulario y preparar para el siguiente presupuesto
      setClientName("")
      setProjectName("")
      setProjectDescription("")
      setBudgetItems([])
      setIsViewingMode(false)
      setSelectedBudget(null)

      // Incrementar número para el siguiente presupuesto
      const nextNumber = reportNumber + 1
      setReportNumber(nextNumber)
      setStartCorrelativeFrom(nextNumber.toString())
    }
  }

  // Función para cargar un presupuesto guardado
  const handleLoadBudget = (budget: SavedBudget) => {
    setClientName(budget.client_name)
    setProjectName(budget.project_name)
    setProjectDescription(budget.project_description || "")
    setBudgetItems(budget.items || [])
    setReportNumber(parseInt(budget.number, 10) || 589)
    setStartCorrelativeFrom(budget.number)
    setSelectedBudget(budget)
    setIsViewingMode(true)
    setShowSavedBudgets(false)
  }

  // Función para crear un nuevo presupuesto
  const handleNewBudget = async () => {
    setClientName("")
    setProjectName("")
    setProjectDescription("")
    setBudgetItems([])
    setIsViewingMode(false)
    setSelectedBudget(null)
    
    const nextNumber = await getNextBudgetNumber()
    setReportNumber(nextNumber)
    setStartCorrelativeFrom(nextNumber.toString())
  }

  // Filtrar presupuestos por búsqueda
  const filteredBudgets = savedBudgets.filter(budget => 
    budget.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.number.includes(searchTerm)
  )

  if (!user) {
    return null // El useEffect se encargará de redirigir
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* Panel de Presupuestos Guardados - Overlay */}
      {showSavedBudgets && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[85vh] overflow-hidden border border-white/10 bg-[#12121a] shadow-2xl animate-in fade-in zoom-in duration-300">
            <CardHeader className="pb-4 border-b border-white/10 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30">
                    <FolderOpenIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">Presupuestos Guardados</CardTitle>
                    <CardDescription className="text-gray-400">
                      {savedBudgets.length} presupuesto{savedBudgets.length !== 1 ? 's' : ''} disponible{savedBudgets.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSavedBudgets(false)}
                  className="hover:bg-white/10 rounded-full"
                >
                  <XIcon className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Barra de búsqueda */}
              <div className="relative mt-4">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Buscar por cliente, proyecto o número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 transition-colors"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-auto max-h-[calc(85vh-180px)]">
              {filteredBudgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FileTextIcon className="h-16 w-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">No se encontraron presupuestos</p>
                  <p className="text-sm mt-1">
                    {searchTerm ? "Intenta con otros términos de búsqueda" : "Crea tu primer presupuesto"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredBudgets.map((budget, index) => (
                    <div 
                      key={budget.id}
                      className="p-4 hover:bg-white/5 transition-all duration-200 cursor-pointer group"
                      onClick={() => handleLoadBudget(budget)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-sm font-bold text-blue-400">#{budget.number}</span>
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-white truncate">{budget.project_name}</h4>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  budget.status === 'paid' 
                                    ? 'border-green-500/50 text-green-400 bg-green-500/10' 
                                    : budget.status === 'pending'
                                    ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10'
                                    : 'border-gray-500/50 text-gray-400 bg-gray-500/10'
                                }`}
                              >
                                {budget.status === 'paid' ? 'Pagado' : budget.status === 'pending' ? 'Pendiente' : budget.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400 truncate">{budget.client_name}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(budget.date).toLocaleDateString("es-ES")}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <DollarSignIcon className="h-3 w-3" />
                                {budget.items?.length || 0} ítem{(budget.items?.length || 0) !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-400">${budget.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">Total</p>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Input Form Section */}
      <Card className="w-full lg:w-1/3 shadow-lg print:hidden border border-white/10 bg-white/5">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hover:bg-white/10">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <CardTitle className="text-white flex items-center gap-2">
                {isViewingMode ? (
                  <>
                    <EyeIcon className="h-5 w-5 text-blue-400" />
                    Viendo Presupuesto #{selectedBudget?.number}
                  </>
                ) : (
                  "Configurar Presupuesto"
                )}
              </CardTitle>
              <CardDescription className="text-gray-400">
                {isViewingMode 
                  ? "Presupuesto cargado desde tus guardados" 
                  : "Ingresa los detalles del cliente y las líneas de presupuesto."
                }
              </CardDescription>
            </div>
          </div>
          
          {/* Botones de acción rápida */}
          <div className="flex gap-2 mt-3">
            <Button 
              onClick={() => setShowSavedBudgets(true)} 
              variant="outline" 
              size="sm"
              className="flex-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-600/20 transition-all"
            >
              <FolderOpenIcon className="h-4 w-4 mr-2" />
              Ver Guardados ({savedBudgets.length})
            </Button>
            {isViewingMode && (
              <Button 
                onClick={handleNewBudget} 
                variant="outline" 
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-green-500/30 hover:border-green-500/50 hover:bg-green-600/20 transition-all"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="clientName">Nombre del Cliente *</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Cliente XYZ S.A."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre del Proyecto *</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ej: Desarrollo App Móvil"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Descripción del Proyecto</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Ej: Creación de una aplicación..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startCorrelative">Número de Presupuesto</Label>
            <Input
              id="startCorrelative"
              type="number"
              value={startCorrelativeFrom}
              onChange={(e) => setStartCorrelativeFrom(e.target.value)}
              placeholder="Ej: 1, 100, 2024001"
              min="1"
            />
          </div>

          <h3 className="text-lg font-semibold mt-6 mb-3 text-white">Añadir Ítem al Presupuesto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newItemCategory">Categoría</Label>
              <Input
                id="newItemCategory"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                placeholder="Ej: Horas de Desarrollo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newItemDescription">Descripción *</Label>
              <Input
                id="newItemDescription"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Ej: Desarrollo Backend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newItemQuantity">Cantidad *</Label>
              <Input
                id="newItemQuantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newItemRate">Tarifa/Unidad ($) *</Label>
              <Input
                id="newItemRate"
                type="number"
                value={newItem.rate}
                onChange={(e) => setNewItem({ ...newItem, rate: Number.parseFloat(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="space-y-2 col-span-full">
              <Label htmlFor="newItemUnit">Unidad</Label>
              <Input
                id="newItemUnit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                placeholder="Ej: horas, meses, proyecto"
              />
            </div>
          </div>
          <Button onClick={handleAddItem} className="w-full">
            Añadir Ítem
          </Button>

          <div className="flex gap-2">
            {!isViewingMode && (
              <Button onClick={handleSaveBudget} className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0" variant="outline">
                <SaveIcon className="mr-2 h-4 w-4" />
                Guardar Presupuesto
              </Button>
            )}
            <Button onClick={handlePrint} className={`${isViewingMode ? 'flex-1' : ''}`}>
              <PrinterIcon className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Display Section */}
      <Card className="w-full lg:w-2/3 shadow-lg print:shadow-none print:border-none border border-white/10 bg-white/5">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {settings?.company_logo_url && (
                <img
                  src={settings.company_logo_url || "/placeholder.svg"}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white print-company-name">
                  {settings?.company_name || "APEX CONSULTING"}
                </h1>
                <CardTitle className="mt-2 text-2xl text-white">Presupuesto</CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  Presupuesto detallado para el desarrollo de sistemas
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Fecha: {new Date().toLocaleDateString("es-ES")}</p>
              <p className="text-sm text-gray-400">Presupuesto #: {reportNumber.toString().padStart(4, "0")}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2 text-white">Detalles del Proyecto</h3>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Nombre del Proyecto:</strong> {projectName || "[Nombre del Proyecto]"}
              </p>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Cliente:</strong> {clientName || "[Nombre del Cliente]"}
              </p>
              <p className="text-sm text-gray-300">
                <strong className="text-white">Descripción:</strong> {projectDescription || "[Descripción del proyecto]"}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-white">Desglose del Presupuesto</h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 border-white/10">
                  <TableHead className="w-[150px] text-gray-300">Categoría</TableHead>
                  <TableHead className="text-gray-300">Descripción</TableHead>
                  <TableHead className="text-right text-gray-300">Cantidad</TableHead>
                  <TableHead className="text-right text-gray-300">Tarifa/Unidad</TableHead>
                  <TableHead className="text-right text-gray-300">Total</TableHead>
                  <TableHead className="w-[50px] print:hidden"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetItems.length === 0 ? (
                  <TableRow className="border-white/10">
                    <TableCell colSpan={6} className="text-center text-gray-400">
                      No hay ítems en el presupuesto.
                    </TableCell>
                  </TableRow>
                ) : (
                  budgetItems.map((item) => (
                    <TableRow key={item.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-medium text-white">{item.category}</TableCell>
                      <TableCell className="text-gray-300">{item.description}</TableCell>
                      <TableCell className="text-right text-gray-300">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">${item.rate.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-white font-medium">${(item.quantity * item.rate).toFixed(2)}</TableCell>
                      <TableCell className="text-center print:hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Eliminar ${item.description}`}
                        >
                          <Trash2Icon className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
            <div className="text-right">
              <p className="text-xl font-bold text-white">
                Presupuesto Total: <span className="text-green-400">${totalBudget.toFixed(2)}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400 print:hidden">
            <p>
              Para imprimir este presupuesto, haz clic en el botón "Imprimir" o usa la función de impresión de tu
              navegador (Ctrl+P o Cmd+P) y selecciona "Guardar como PDF".
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
