"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle } from "lucide-react"

interface Budget {
  id: string
  client_name: string
  total: number
  status: "pending" | "paid" | "overdue"
}

interface Invoice {
  id: string
  budget_id?: string
  client_name: string
  total: number
  status: "pending" | "paid" | "overdue"
}

interface ClientDebt {
  clientName: string
  totalBudgets: number
  totalInvoiced: number
  pendingDebt: number
  budgetCount: number
  invoiceCount: number
}

interface DebtReportProps {
  budgets: Budget[]
  invoices: Invoice[]
}

export function DebtReport({ budgets, invoices }: DebtReportProps) {
  // Calcular deudas por cliente
  const calculateClientDebts = (): ClientDebt[] => {
    const clientMap = new Map<string, ClientDebt>()

    // Procesar presupuestos
    budgets.forEach((budget) => {
      const existing = clientMap.get(budget.client_name) || {
        clientName: budget.client_name,
        totalBudgets: 0,
        totalInvoiced: 0,
        pendingDebt: 0,
        budgetCount: 0,
        invoiceCount: 0,
      }

      existing.totalBudgets += Number(budget.total)
      existing.budgetCount += 1
      clientMap.set(budget.client_name, existing)
    })

    // Procesar facturas
    invoices.forEach((invoice) => {
      const existing = clientMap.get(invoice.client_name)
      if (existing) {
        existing.totalInvoiced += Number(invoice.total)
        existing.invoiceCount += 1
      }
    })

    // Calcular deuda pendiente
    clientMap.forEach((client) => {
      client.pendingDebt = client.totalBudgets - client.totalInvoiced
    })

    return Array.from(clientMap.values()).sort((a, b) => b.pendingDebt - a.pendingDebt)
  }

  const clientDebts = calculateClientDebts()
  const totalPendingDebt = clientDebts.reduce((sum, client) => sum + client.pendingDebt, 0)

  const exportToCSV = () => {
    const headers = [
      "Cliente",
      "Total Presupuestos",
      "Total Facturado",
      "Deuda Pendiente",
      "# Presupuestos",
      "# Facturas",
    ]
    const rows = clientDebts.map((client) => [
      client.clientName,
      client.totalBudgets.toFixed(2),
      client.totalInvoiced.toFixed(2),
      client.pendingDebt.toFixed(2),
      client.budgetCount.toString(),
      client.invoiceCount.toString(),
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `reporte-deudas-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (clientDebts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reporte de Deudas por Cliente</CardTitle>
          <CardDescription>No hay datos de presupuestos o facturas para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p>Crea presupuestos para ver el reporte de deudas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Reporte de Deudas por Cliente</CardTitle>
              <CardDescription>Desglose de presupuestos vs facturas emitidas</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Presupuestado</CardDescription>
                <CardTitle className="text-2xl">
                  ${clientDebts.reduce((sum, c) => sum + c.totalBudgets, 0).toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Facturado</CardDescription>
                <CardTitle className="text-2xl">
                  ${clientDebts.reduce((sum, c) => sum + c.totalInvoiced, 0).toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Deuda Pendiente Total</CardDescription>
                <CardTitle className="text-2xl text-orange-600">${totalPendingDebt.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Total Presupuestos</TableHead>
                <TableHead className="text-right">Total Facturado</TableHead>
                <TableHead className="text-right">Deuda Pendiente</TableHead>
                <TableHead className="text-center">Presupuestos</TableHead>
                <TableHead className="text-center">Facturas</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientDebts.map((client, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{client.clientName}</TableCell>
                  <TableCell className="text-right">${client.totalBudgets.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${client.totalInvoiced.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">
                    <span className={client.pendingDebt > 0 ? "text-orange-600" : "text-green-600"}>
                      ${client.pendingDebt.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">{client.budgetCount}</TableCell>
                  <TableCell className="text-center">{client.invoiceCount}</TableCell>
                  <TableCell className="text-center">
                    {client.pendingDebt === 0 ? (
                      <Badge variant="default" className="bg-green-500">
                        Al día
                      </Badge>
                    ) : client.pendingDebt === client.totalBudgets ? (
                      <Badge variant="destructive">Sin facturar</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-orange-500 text-white">
                        Parcial
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
