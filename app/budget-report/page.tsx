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
    window.print()
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
