"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, MinusIcon, ClockIcon, FileTextIcon } from "lucide-react"

interface Budget {
  id: string
  number: string
  project_name: string
  client_name: string
  total: number
}

interface AddHoursDialogProps {
  budgets: Budget[]
  onSave: (entry: {
    budget_id: string
    budget_name: string
    client_name: string
    project: string
    hours: number
    type: "add" | "subtract"
    description: string
    date: string
  }) => Promise<void>
}

export function AddHoursDialog({ budgets, onSave }: AddHoursDialogProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"add" | "subtract">("add")
  const [budgetId, setBudgetId] = useState("")
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [saving, setSaving] = useState(false)

  const selectedBudget = budgets.find((b) => b.id === budgetId)

  const handleSave = async () => {
    if (!budgetId || !hours || !description) return

    setSaving(true)
    try {
      await onSave({
        budget_id: budgetId,
        budget_name: selectedBudget ? `${selectedBudget.number} - ${selectedBudget.project_name}` : "",
        client_name: selectedBudget?.client_name || "",
        project: selectedBudget?.project_name || "",
        hours: type === "subtract" ? -Math.abs(Number.parseFloat(hours)) : Math.abs(Number.parseFloat(hours)),
        type,
        description,
        date,
      })
      // Reset form
      setBudgetId("")
      setHours("")
      setDescription("")
      setType("add")
      setDate(new Date().toISOString().split("T")[0])
      setOpen(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <ClockIcon className="h-4 w-4" />
          Registrar Horas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a2e] border border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            Registrar Horas
          </DialogTitle>
          <DialogDescription className="text-gray-400">Agrega o resta horas asociadas a un presupuesto específico</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tipo de movimiento */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Tipo de Movimiento</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("add")}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  type === "add"
                    ? "border-green-500 bg-green-500/20 text-green-300"
                    : "border-white/20 hover:border-green-500/50 hover:bg-green-500/10 text-gray-300"
                }`}
              >
                <div className={`p-2 rounded-full ${type === "add" ? "bg-green-500 text-white" : "bg-white/10"}`}>
                  <PlusIcon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Sumar</div>
                  <div className="text-xs opacity-70">Trabajo realizado</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType("subtract")}
                className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  type === "subtract"
                    ? "border-red-500 bg-red-500/20 text-red-300"
                    : "border-white/20 hover:border-red-500/50 hover:bg-red-500/10 text-gray-300"
                }`}
              >
                <div className={`p-2 rounded-full ${type === "subtract" ? "bg-red-500 text-white" : "bg-white/10"}`}>
                  <MinusIcon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Restar</div>
                  <div className="text-xs opacity-70">Ajuste / Descuento</div>
                </div>
              </button>
            </div>
          </div>

          {/* Selector de presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm font-medium flex items-center gap-2 text-gray-300">
              <FileTextIcon className="h-4 w-4 text-blue-400" />
              Presupuesto Asociado
            </Label>
            <select
              id="budget"
              value={budgetId}
              onChange={(e) => setBudgetId(e.target.value)}
              className="w-full p-3 rounded-lg border border-white/20 bg-[#0a0a0f] text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="">Seleccionar presupuesto...</option>
              {budgets.map((budget) => (
                <option key={budget.id} value={budget.id}>
                  {budget.number} - {budget.project_name} ({budget.client_name}) - ${budget.total.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Preview del presupuesto seleccionado */}
          {selectedBudget && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  <FileTextIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{selectedBudget.project_name}</div>
                  <div className="text-sm text-blue-300">{selectedBudget.client_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-blue-400">Total</div>
                  <div className="font-bold text-white">${selectedBudget.total.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Horas y fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours" className="text-sm font-medium text-gray-300">
                Cantidad de Horas
              </Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Ej: 4.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-gray-300">
                Fecha
              </Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Descripción del Trabajo
            </Label>
            <Textarea
              id="description"
              placeholder="Describe el trabajo realizado o el motivo del ajuste..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Preview del movimiento */}
          {hours && (
            <div
              className={`p-4 rounded-xl border-2 ${
                type === "add" ? "border-green-500/50 bg-green-500/20" : "border-red-500/50 bg-red-500/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={type === "add" ? "text-green-300" : "text-red-300"}>
                  {type === "add" ? "Se sumarán" : "Se restarán"}
                </span>
                <span className={`text-2xl font-bold ${type === "add" ? "text-green-400" : "text-red-400"}`}>
                  {type === "add" ? "+" : "-"}
                  {hours} horas
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!budgetId || !hours || !description || saving}
            className={type === "add" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
          >
            {saving ? "Guardando..." : type === "add" ? "Sumar Horas" : "Restar Horas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
