"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSignIcon, CalendarIcon, CreditCardIcon, FileTextIcon } from "lucide-react"

interface Budget {
  id: string
  number: string
  client_name: string
  project_name: string
  total: number
  paid_amount?: number
  payment_status?: string
}

interface RegisterPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budgets: Budget[]
  selectedBudgetId?: string
  onSave: (payment: {
    budget_id: string
    amount: number
    payment_date: string
    payment_method: string
    reference_number: string
    notes: string
  }) => Promise<void>
}

export function RegisterPaymentDialog({
  open,
  onOpenChange,
  budgets,
  selectedBudgetId,
  onSave,
}: RegisterPaymentDialogProps) {
  const [budgetId, setBudgetId] = useState(selectedBudgetId || "")
  const [amount, setAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0])
  const [paymentMethod, setPaymentMethod] = useState("transfer")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (selectedBudgetId) {
      setBudgetId(selectedBudgetId)
    }
  }, [selectedBudgetId])

  const selectedBudget = budgets.find((b) => b.id === budgetId)
  const pendingAmount = selectedBudget ? Number(selectedBudget.total) - Number(selectedBudget.paid_amount || 0) : 0

  const handleSubmit = async () => {
    if (!budgetId || !amount || Number(amount) <= 0) return

    setIsLoading(true)
    try {
      await onSave({
        budget_id: budgetId,
        amount: Number(amount),
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        notes,
      })
      // Reset form
      setBudgetId(selectedBudgetId || "")
      setAmount("")
      setPaymentDate(new Date().toISOString().split("T")[0])
      setPaymentMethod("transfer")
      setReferenceNumber("")
      setNotes("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving payment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayFullAmount = () => {
    if (pendingAmount > 0) {
      setAmount(pendingAmount.toString())
    }
  }

  // Filtrar presupuestos con saldo pendiente
  const budgetsWithPendingAmount = budgets.filter((b) => {
    const paid = Number(b.paid_amount || 0)
    const total = Number(b.total)
    return paid < total
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-green-100">
              <DollarSignIcon className="h-5 w-5 text-green-600" />
            </div>
            Registrar Pago
          </DialogTitle>
          <DialogDescription>
            Registra un pago recibido para un presupuesto. Puedes registrar pagos parciales o completos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Selección de presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4 text-gray-500" />
              Presupuesto
            </Label>
            <Select value={budgetId} onValueChange={setBudgetId}>
              <SelectTrigger id="budget" className="h-11">
                <SelectValue placeholder="Selecciona un presupuesto" />
              </SelectTrigger>
              <SelectContent>
                {budgetsWithPendingAmount.map((budget) => {
                  const pending = Number(budget.total) - Number(budget.paid_amount || 0)
                  return (
                    <SelectItem key={budget.id} value={budget.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          #{budget.number} - {budget.project_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {budget.client_name} | Pendiente: ${pending.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Info del presupuesto seleccionado */}
          {selectedBudget && (
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-bold text-lg">${Number(selectedBudget.total).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Pagado</p>
                  <p className="font-bold text-lg text-green-600">
                    ${Number(selectedBudget.paid_amount || 0).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Pendiente</p>
                  <p className="font-bold text-lg text-orange-600">${pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSignIcon className="h-4 w-4 text-gray-500" />
              Monto del Pago
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={pendingAmount}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 h-11"
                  placeholder="0.00"
                />
              </div>
              {selectedBudget && pendingAmount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePayFullAmount}
                  className="whitespace-nowrap bg-transparent"
                >
                  Pagar Todo
                </Button>
              )}
            </div>
          </div>

          {/* Fecha de pago */}
          <div className="space-y-2">
            <Label htmlFor="paymentDate" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              Fecha del Pago
            </Label>
            <Input
              id="paymentDate"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod" className="flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4 text-gray-500" />
              Método de Pago
            </Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="paymentMethod" className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transferencia Bancaria</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
                <SelectItem value="card">Tarjeta de Crédito/Débito</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="zelle">Zelle</SelectItem>
                <SelectItem value="other">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Número de referencia */}
          <div className="space-y-2">
            <Label htmlFor="reference">Número de Referencia (opcional)</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Ej: TRF-123456"
              className="h-11"
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Añade cualquier nota o comentario sobre este pago..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!budgetId || !amount || Number(amount) <= 0 || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Guardando..." : "Registrar Pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
