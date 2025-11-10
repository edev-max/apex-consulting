"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, AlertCircle, DollarSign, TrendingUp, FileText, Users, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

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
  const totalBudgeted = clientDebts.reduce((sum, c) => sum + c.totalBudgets, 0)
  const totalInvoiced = clientDebts.reduce((sum, c) => sum + c.totalInvoiced, 0)
  const collectionRate = totalBudgeted > 0 ? ((totalInvoiced / totalBudgeted) * 100).toFixed(1) : "0"

  const topDebtors = clientDebts.slice(0, 10)
  const chartData = topDebtors.map((client) => ({
    name: client.clientName.length > 15 ? client.clientName.substring(0, 15) + "..." : client.clientName,
    Presupuestado: client.totalBudgets,
    Facturado: client.totalInvoiced,
    Pendiente: client.pendingDebt,
  }))

  const statusDistribution = [
    {
      name: "Al día",
      value: clientDebts.filter((c) => c.pendingDebt === 0).length,
      color: "#10b981",
    },
    {
      name: "Sin facturar",
      value: clientDebts.filter((c) => c.pendingDebt === c.totalBudgets && c.totalBudgets > 0).length,
      color: "#ef4444",
    },
    {
      name: "Parcial",
      value: clientDebts.filter((c) => c.pendingDebt > 0 && c.pendingDebt < c.totalBudgets).length,
      color: "#f97316",
    },
  ].filter((item) => item.value > 0)

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Presupuestado</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalBudgeted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientDebts.reduce((sum, c) => sum + c.budgetCount, 0)} presupuestos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalInvoiced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientDebts.reduce((sum, c) => sum + c.invoiceCount, 0)} facturas emitidas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deuda Pendiente</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalPendingDebt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {clientDebts.filter((c) => c.pendingDebt > 0).length} clientes con deuda
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cobro</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Del total presupuestado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart for top debtors */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Clientes - Desglose Financiero</CardTitle>
            <CardDescription>Comparación de presupuestos, facturas y deudas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                  contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #ccc" }}
                />
                <Legend />
                <Bar dataKey="Presupuestado" fill="#3b82f6" />
                <Bar dataKey="Facturado" fill="#10b981" />
                <Bar dataKey="Pendiente" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart for status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado de Pago</CardTitle>
            <CardDescription>Clientes según su estado de cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              {statusDistribution.map((status, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: status.color }}>
                    {status.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{status.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Detalle por Cliente
              </CardTitle>
              <CardDescription>Desglose completo de presupuestos y facturas por cliente</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Cliente</TableHead>
                  <TableHead className="text-right font-semibold">Presupuestado</TableHead>
                  <TableHead className="text-right font-semibold">Facturado</TableHead>
                  <TableHead className="text-right font-semibold">Pendiente</TableHead>
                  <TableHead className="text-center font-semibold">Docs</TableHead>
                  <TableHead className="text-center font-semibold">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientDebts.map((client, index) => (
                  <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{client.clientName}</TableCell>
                    <TableCell className="text-right font-mono">${client.totalBudgets.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-green-600">
                      ${client.totalInvoiced.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span
                        className={`font-semibold ${client.pendingDebt > 0 ? "text-orange-600" : "text-green-600"}`}
                      >
                        ${client.pendingDebt.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                          {client.budgetCount} P
                        </span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
                          {client.invoiceCount} F
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {client.pendingDebt === 0 ? (
                        <Badge className="bg-green-500 hover:bg-green-600">Al día</Badge>
                      ) : client.pendingDebt === client.totalBudgets ? (
                        <Badge variant="destructive">Sin facturar</Badge>
                      ) : (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Parcial</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
