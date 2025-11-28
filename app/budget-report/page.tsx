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

    // Calcular fecha de vencimiento (30 días después)
    const today = new Date()
    const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Presupuesto #${reportNumber.toString().padStart(3, "0")}-${String(reportNumber).padStart(6, "0")} - ${projectName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      padding: 30px;
      color: #1a1a1a;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    
    /* Header */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 35px 40px;
      border-bottom: 3px solid #e5c100;
    }
    
    .company-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .company-logo {
      width: 55px;
      height: 55px;
      background: #1a1a2e;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    .company-logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    
    .company-logo-text {
      font-size: 24px;
      font-weight: 800;
      color: white;
    }
    
    .company-info h1 {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    
    .company-info p {
      font-size: 12px;
      color: #666;
      font-weight: 400;
    }
    
    .budget-title {
      text-align: right;
    }
    
    .budget-title h2 {
      font-size: 32px;
      font-weight: 300;
      color: #1a1a1a;
      letter-spacing: 2px;
    }
    
    .budget-title .number {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    
    /* Client Section */
    .client-section {
      padding: 30px 40px;
      border-bottom: 1px solid #eee;
    }
    
    .client-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .client-info {
      flex: 1;
    }
    
    .client-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #e5c100;
      font-weight: 600;
      margin-bottom: 5px;
    }
    
    .client-name {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 3px;
    }
    
    .client-role {
      font-size: 13px;
      color: #666;
    }
    
    .dates-info {
      text-align: right;
    }
    
    .date-row {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }
    
    .date-row strong {
      color: #1a1a1a;
    }
    
    /* Contact & Payment Info */
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 25px 40px;
      background: #fafafa;
      border-bottom: 1px solid #eee;
    }
    
    .info-block h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #e5c100;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .info-block p {
      font-size: 13px;
      color: #444;
      margin-bottom: 4px;
    }
    
    /* Items Table */
    .items-section {
      padding: 30px 40px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .items-table thead {
      background: #1a1a2e;
    }
    
    .items-table th {
      padding: 14px 16px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: white;
      font-weight: 600;
    }
    
    .items-table th:nth-child(3),
    .items-table th:nth-child(4) {
      text-align: center;
    }
    
    .items-table th:last-child {
      text-align: right;
    }
    
    .items-table td {
      padding: 16px;
      font-size: 13px;
      color: #333;
      border-bottom: 1px solid #eee;
    }
    
    .items-table tbody tr:nth-child(even) {
      background: #fafafa;
    }
    
    .items-table tbody tr:nth-child(odd) td:first-child {
      background: #e5c100;
      color: #1a1a1a;
      font-weight: 700;
      text-align: center;
      width: 40px;
    }
    
    .items-table tbody tr:nth-child(even) td:first-child {
      background: #f0d000;
      color: #1a1a1a;
      font-weight: 700;
      text-align: center;
      width: 40px;
    }
    
    .items-table td:nth-child(3),
    .items-table td:nth-child(4) {
      text-align: center;
    }
    
    .items-table td:last-child {
      text-align: right;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .item-number {
      font-weight: 700;
    }
    
    .item-description {
      font-weight: 500;
      color: #333;
    }
    
    /* Totals Section */
    .totals-section {
      padding: 0 40px 30px;
    }
    
    .totals-table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .totals-table td {
      padding: 10px 16px;
      font-size: 13px;
    }
    
    .totals-table .label-cell {
      text-align: right;
      color: #666;
      width: 80%;
    }
    
    .totals-table .value-cell {
      text-align: right;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .totals-table .total-row {
      background: #e5c100;
    }
    
    .totals-table .total-row td {
      padding: 14px 16px;
      font-weight: 700;
      font-size: 15px;
      color: #1a1a1a;
    }
    
    /* Conditions Section */
    .conditions-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      padding: 25px 40px;
      gap: 40px;
      border-top: 1px solid #eee;
    }
    
    .conditions-block h4 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #e5c100;
      font-weight: 600;
      margin-bottom: 12px;
    }
    
    .conditions-block p {
      font-size: 12px;
      color: #666;
      line-height: 1.6;
    }
    
    /* Signature Section */
    .signature-section {
      padding: 25px 40px;
      border-top: 1px solid #eee;
    }
    
    .signature-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #e5c100;
      font-weight: 600;
      margin-bottom: 30px;
    }
    
    .signature-line {
      border-bottom: 1px solid #333;
      width: 250px;
      padding-bottom: 5px;
      font-size: 13px;
      color: #333;
    }
    
    /* Footer */
    .footer {
      background: #1a1a2e;
      padding: 25px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .footer-contact {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .footer-contact p {
      font-size: 12px;
      color: rgba(255,255,255,0.8);
    }
    
    .footer-right {
      text-align: right;
    }
    
    .footer-phone {
      font-size: 13px;
      color: white;
      margin-bottom: 5px;
    }
    
    .footer-social {
      font-size: 12px;
      color: rgba(255,255,255,0.7);
    }
    
    .footer-website {
      display: inline-block;
      margin-top: 10px;
      background: #e5c100;
      color: #1a1a1a;
      font-size: 12px;
      font-weight: 700;
      padding: 8px 20px;
      border-radius: 4px;
      text-decoration: none;
    }
    
    /* Print Actions */
    .print-actions {
      max-width: 800px;
      margin: 25px auto 0;
      display: flex;
      justify-content: center;
      gap: 12px;
    }
    
    .print-actions button {
      padding: 12px 28px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Inter', sans-serif;
    }
    
    .btn-print {
      background: #1a1a2e;
      color: white;
    }
    
    .btn-print:hover {
      background: #2a2a4e;
    }
    
    .btn-close {
      background: #f0f0f0;
      color: #333;
    }
    
    .btn-close:hover {
      background: #e0e0e0;
    }
    
    /* Print Styles */
    @media print {
      body {
        background: white !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .container {
        box-shadow: none !important;
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
      <div class="company-section">
        <div class="company-logo">
          ${settings?.company_logo_url 
            ? `<img src="${settings.company_logo_url}" alt="Logo" />`
            : `<span class="company-logo-text">A</span>`
          }
        </div>
        <div class="company-info">
          <h1>${settings?.company_name || 'APEX CONSULTING'}</h1>
          <p>Consultoría Integral</p>
        </div>
      </div>
      <div class="budget-title">
        <h2>PRESUPUESTO</h2>
        <div class="number">Nº ${reportNumber.toString().padStart(3, "0")}-${String(reportNumber).padStart(6, "0")}</div>
      </div>
    </div>
    
    <!-- Client Section -->
    <div class="client-section">
      <div class="client-row">
        <div class="client-info">
          <div class="client-label">CLIENTE</div>
          <div class="client-name">${clientName || '[Nombre del Cliente]'}</div>
          <div class="client-role">${projectName || '[Proyecto]'}</div>
        </div>
        <div class="dates-info">
          <div class="date-row"><strong>Fecha:</strong> ${formatDate(today)}</div>
          <div class="date-row"><strong>Vencimiento:</strong> ${formatDate(dueDate)}</div>
        </div>
      </div>
    </div>
    
    <!-- Contact & Payment Info -->
    <div class="info-section">
      <div class="info-block">
        <h4>PERSONA DE CONTACTO</h4>
        <p><strong>Teléfono:</strong> ${settings?.company_phone || '(00) 0000-0000'}</p>
        <p><strong>Email:</strong> ${settings?.company_email || 'contacto@empresa.com'}</p>
      </div>
      <div class="info-block">
        <h4>DATOS DE PAGO</h4>
        <p><strong>Cuenta:</strong> XXXXXX</p>
        <p>${settings?.company_name || 'Empresa SRL'}</p>
      </div>
    </div>
    
    <!-- Items Table -->
    <div class="items-section">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 8%">#</th>
            <th style="width: 42%">DESCRIPCIÓN</th>
            <th style="width: 18%">PRECIO</th>
            <th style="width: 12%">CANTIDAD</th>
            <th style="width: 20%">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          ${budgetItems.length === 0 
            ? `<tr><td colspan="5" style="text-align: center; color: #999; padding: 40px;">No hay ítems en el presupuesto</td></tr>`
            : budgetItems.map((item: { description: string; quantity: number; rate: number; unit?: string }, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td class="item-description">${item.description}</td>
                <td>$${Number(item.rate).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                <td>${item.quantity}</td>
                <td>$${(item.quantity * item.rate).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')
          }
        </tbody>
      </table>
    </div>
    
    <!-- Totals Section -->
    <div class="totals-section">
      <table class="totals-table">
        <tr>
          <td class="label-cell">Subtotal</td>
          <td class="value-cell">$${totalBudget.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td class="label-cell">Impuestos 10.5%</td>
          <td class="value-cell">$${(totalBudget * 0.105).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr class="total-row">
          <td class="label-cell">TOTAL</td>
          <td class="value-cell">$${(totalBudget * 1.105).toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>
    </div>
    
    <!-- Conditions Section -->
    <div class="conditions-section">
      <div class="conditions-block">
        <h4>CONDICIONES DE PAGO</h4>
        <p>El presente presupuesto tiene una validez de 30 días a partir de la fecha de emisión. Pasado este plazo, los precios podrían sufrir modificaciones.</p>
      </div>
      <div class="conditions-block">
        <h4>OTROS DETALLES</h4>
        <p>${projectDescription || 'Presupuesto sujeto a disponibilidad. Forma de pago a convenir según acuerdo comercial.'}</p>
      </div>
    </div>
    
    <!-- Signature Section -->
    <div class="signature-section">
      <div class="signature-label">FIRMA</div>
      <div class="signature-line">${clientName || ''}</div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-contact">
        <p>${settings?.company_email || 'contacto@empresa.com'}</p>
      </div>
      <div class="footer-right">
        <div class="footer-phone">${settings?.company_phone || '(00) 0000-0000'}</div>
        <a class="footer-website" href="#">www.${(settings?.company_name || 'empresa').toLowerCase().replace(/\s+/g, '')}.com</a>
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
