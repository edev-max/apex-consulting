"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2Icon, PrinterIcon, ArrowLeftIcon, SaveIcon } from "lucide-react"
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

export default function InteractiveBudgetReport() {
  const { user } = useAuth()
  const router = useRouter()
  const { saveBudget, getNextBudgetNumber } = useBudgetStorage()
  const { companySettings: settings } = useSupabaseData()

  const [clientName, setClientName] = useState<string>("")
  const [projectName, setProjectName] = useState<string>("")
  const [projectDescription, setProjectDescription] = useState<string>("")
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([])

  const [reportNumber, setReportNumber] = useState<number>(589)
  const [startCorrelativeFrom, setStartCorrelativeFrom] = useState<string>("589")

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

      // Incrementar número para el siguiente presupuesto
      const nextNumber = reportNumber + 1
      setReportNumber(nextNumber)
      setStartCorrelativeFrom(nextNumber.toString())
    }
  }

  if (!user) {
    return null // El useEffect se encargará de redirigir
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#0a0a0f] min-h-screen">
      {/* Input Form Section */}
      <Card className="w-full lg:w-1/3 shadow-lg print:hidden border border-white/10 bg-white/5">
        <CardHeader className="pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-white">Configurar Presupuesto</CardTitle>
              <CardDescription className="text-gray-400">Ingresa los detalles del cliente y las líneas de presupuesto.</CardDescription>
            </div>
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
            <Button onClick={handleSaveBudget} className="flex-1 bg-transparent" variant="outline">
              <SaveIcon className="mr-2 h-4 w-4" />
              Guardar Presupuesto
            </Button>
            <Button onClick={handlePrint} className="flex-1">
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
