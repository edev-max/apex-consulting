"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Download,
  AlertCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Printer,
  ArrowLeft,
} from "lucide-react"
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
  number: string
  client_name: string
  project_name: string
  total: number
  date: string
  status: "pending" | "paid" | "overdue"
  items?: any[]
}

interface Invoice {
  id: string
  number: string
  budget_id?: string
  client_name: string
  total: number
  date: string
  status: "pending" | "paid" | "overdue"
}

interface ClientDebt {
  clientName: string
  totalBudgets: number
  totalInvoiced: number
  pendingDebt: number
  budgetCount: number
  invoiceCount: number
  budgets: Budget[]
  invoices: Invoice[]
}

interface DebtReportProps {
  budgets: Budget[]
  invoices: Invoice[]
  companyName?: string
  companyLogo?: string
}

export function DebtReport({ budgets, invoices, companyName = "Mi Empresa", companyLogo }: DebtReportProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)

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
        budgets: [],
        invoices: [],
      }

      existing.totalBudgets += Number(budget.total)
      existing.budgetCount += 1
      existing.budgets.push(budget)
      clientMap.set(budget.client_name, existing)
    })

    // Procesar facturas
    invoices.forEach((invoice) => {
      const existing = clientMap.get(invoice.client_name)
      if (existing) {
        existing.totalInvoiced += Number(invoice.total)
        existing.invoiceCount += 1
        existing.invoices.push(invoice)
      }
    })

    // Calcular deuda pendiente
    clientMap.forEach((client) => {
      client.pendingDebt = client.totalBudgets - client.totalInvoiced
    })

    return Array.from(clientMap.values()).sort((a, b) => b.pendingDebt - a.pendingDebt)
  }

  const clientDebts = calculateClientDebts()
  const selectedClientData = selectedClient ? clientDebts.find((c) => c.clientName === selectedClient) : null

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

  const exportToPDF = (client?: ClientDebt) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const currentDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    let content = ""

    if (client) {
      // PDF for individual client
      content = `
        <div class="client-info">
          <h2>${client.clientName}</h2>
          <p>Reporte generado el ${currentDate}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Presupuestado</div>
            <div class="summary-value">$${client.totalBudgets.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Facturado</div>
            <div class="summary-value" style="color: #10b981;">$${client.totalInvoiced.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Deuda Pendiente</div>
            <div class="summary-value" style="color: ${client.pendingDebt > 0 ? "#f97316" : "#10b981"};">$${client.pendingDebt.toLocaleString()}</div>
          </div>
        </div>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #374151;">Presupuestos (${client.budgetCount})</h3>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Proyecto</th>
              <th>Fecha</th>
              <th style="text-align: right;">Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${client.budgets
              .map(
                (budget) => `
              <tr>
                <td>#${budget.number}</td>
                <td>${budget.project_name}</td>
                <td>${new Date(budget.date).toLocaleDateString("es-ES")}</td>
                <td style="text-align: right;">$${Number(budget.total).toLocaleString()}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${
                    budget.status === "paid"
                      ? "background-color: #d1fae5; color: #065f46;"
                      : budget.status === "pending"
                        ? "background-color: #fef3c7; color: #92400e;"
                        : "background-color: #fee2e2; color: #991b1b;"
                  }">
                    ${budget.status === "paid" ? "Pagado" : budget.status === "pending" ? "Pendiente" : "Vencido"}
                  </span>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #374151;">Facturas (${client.invoiceCount})</h3>
        ${
          client.invoiceCount > 0
            ? `
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th style="text-align: right;">Monto</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${client.invoices
              .map(
                (invoice) => `
              <tr>
                <td>#${invoice.number}</td>
                <td>${new Date(invoice.date).toLocaleDateString("es-ES")}</td>
                <td style="text-align: right;">$${Number(invoice.total).toLocaleString()}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${
                    invoice.status === "paid"
                      ? "background-color: #d1fae5; color: #065f46;"
                      : invoice.status === "pending"
                        ? "background-color: #fef3c7; color: #92400e;"
                        : "background-color: #fee2e2; color: #991b1b;"
                  }">
                    ${invoice.status === "paid" ? "Pagado" : invoice.status === "pending" ? "Pendiente" : "Vencido"}
                  </span>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        `
            : '<p style="text-align: center; color: #6b7280; padding: 20px;">No hay facturas emitidas</p>'
        }
      `
    } else {
      // PDF for all clients summary
      content = `
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Presupuestado</div>
            <div class="summary-value">$${totalBudgeted.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Facturado</div>
            <div class="summary-value" style="color: #10b981;">$${totalInvoiced.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Deuda Pendiente</div>
            <div class="summary-value" style="color: #f97316;">$${totalPendingDebt.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Tasa de Cobro</div>
            <div class="summary-value" style="color: #8b5cf6;">${collectionRate}%</div>
          </div>
        </div>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #374151;">Resumen por Cliente</h3>
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th style="text-align: right;">Presupuestado</th>
              <th style="text-align: right;">Facturado</th>
              <th style="text-align: right;">Pendiente</th>
              <th style="text-align: center;">Docs</th>
              <th style="text-align: center;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${clientDebts
              .map(
                (client) => `
              <tr>
                <td>${client.clientName}</td>
                <td style="text-align: right;">$${client.totalBudgets.toLocaleString()}</td>
                <td style="text-align: right; color: #10b981;">$${client.totalInvoiced.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600; color: ${client.pendingDebt > 0 ? "#f97316" : "#10b981"};">$${client.pendingDebt.toLocaleString()}</td>
                <td style="text-align: center;">${client.budgetCount} P / ${client.invoiceCount} F</td>
                <td style="text-align: center;">
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${
                    client.pendingDebt === 0
                      ? "background-color: #d1fae5; color: #065f46;"
                      : client.pendingDebt === client.totalBudgets
                        ? "background-color: #fee2e2; color: #991b1b;"
                        : "background-color: #fed7aa; color: #9a3412;"
                  }">
                    ${client.pendingDebt === 0 ? "Al día" : client.pendingDebt === client.totalBudgets ? "Sin facturar" : "Parcial"}
                  </span>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      `
    }

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${client ? `Reporte de Deudas - ${client.clientName}` : "Reporte de Deudas - Todos los Clientes"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; background: white; }
    .container { max-width: 900px; margin: 0 auto; }
    
    .header { 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      margin-bottom: 30px; 
      padding-bottom: 20px; 
      border-bottom: 3px solid #3b82f6; 
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .company-logo { 
      width: 80px; 
      height: 80px; 
      object-fit: contain; 
    }
    .company-info h1 { 
      color: #1e40af; 
      font-size: 28px; 
      font-weight: bold; 
      margin-bottom: 5px; 
    }
    .company-info .tagline { 
      font-size: 14px; 
      color: #6b7280; 
    }
    .header-right {
      text-align: right;
    }
    .report-title { 
      font-size: 24px; 
      font-weight: 600; 
      color: #374151; 
      margin-bottom: 20px;
      text-align: center;
    }
    
    .client-info {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    .client-info h2 {
      font-size: 26px;
      margin-bottom: 8px;
    }
    .client-info p {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .summary { 
      display: grid;
      grid-template-columns: repeat(${client ? 3 : 4}, 1fr);
      gap: 15px;
      margin-bottom: 30px; 
    }
    .summary-item { 
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px; 
      text-align: center;
    }
    .summary-label { 
      font-size: 13px; 
      color: #6b7280; 
      margin-bottom: 8px;
      font-weight: 500;
    }
    .summary-value { 
      font-size: 26px; 
      font-weight: bold; 
      color: #1e40af; 
    }
    
    h3 {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th { 
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      padding: 14px 12px; 
      text-align: left; 
      font-weight: 600; 
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td { 
      padding: 12px; 
      font-size: 14px; 
      border-bottom: 1px solid #e5e7eb; 
      background: white;
    }
    tr:hover td {
      background: #f9fafb;
    }
    
    .footer { 
      text-align: center; 
      margin-top: 50px; 
      padding-top: 20px; 
      border-top: 2px solid #e5e7eb; 
      color: #6b7280; 
      font-size: 13px;
    }
    
    .no-print { 
      text-align: center; 
      margin-top: 30px; 
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }
    .no-print button {
      padding: 12px 24px;
      margin: 0 8px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .print-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
    }
    .print-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    .close-btn {
      background: #6b7280;
      color: white;
    }
    .close-btn:hover {
      background: #4b5563;
    }
    
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
      .summary-item { break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="Logo" class="company-logo" />` : ""}
        <div class="company-info">
          <h1>${companyName}</h1>
          <p class="tagline">Reporte de Deudas y Cobranza</p>
        </div>
      </div>
      <div class="header-right">
        <p style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Fecha de emisión</p>
        <p style="font-size: 14px; font-weight: 600; color: #374151;">${currentDate}</p>
      </div>
    </div>
    
    <h2 class="report-title">${client ? `Reporte de Cliente: ${client.clientName}` : "Reporte General de Deudas por Cliente"}</h2>
    
    ${content}
    
    <div class="footer">
      <p>Este documento es un reporte generado automáticamente por ${companyName}</p>
      <p style="margin-top: 5px;">Para más información, contacte con el departamento de contabilidad</p>
    </div>
    
    <div class="no-print">
      <button onclick="window.print()" class="print-btn">
        Imprimir / Guardar PDF
      </button>
      <button onclick="window.close()" class="close-btn">
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

  if (selectedClientData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button onClick={() => setSelectedClient(null)} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al resumen
          </Button>
          <Button onClick={() => exportToPDF(selectedClientData)} variant="default" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir PDF
          </Button>
        </div>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-3xl text-blue-900">{selectedClientData.clientName}</CardTitle>
            <CardDescription>Reporte detallado de presupuestos y facturas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-l-4 border-l-blue-500 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Presupuestado</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${selectedClientData.totalBudgets.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">{selectedClientData.budgetCount} presupuestos</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-l-green-500 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Total Facturado</div>
                <div className="text-2xl font-bold text-green-600">
                  ${selectedClientData.totalInvoiced.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">{selectedClientData.invoiceCount} facturas</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-l-orange-500 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">Deuda Pendiente</div>
                <div
                  className={`text-2xl font-bold ${selectedClientData.pendingDebt > 0 ? "text-orange-600" : "text-green-600"}`}
                >
                  ${selectedClientData.pendingDebt.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedClientData.pendingDebt === 0
                    ? "Al día"
                    : selectedClientData.pendingDebt === selectedClientData.totalBudgets
                      ? "Sin facturar"
                      : "Parcialmente facturado"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Presupuestos ({selectedClientData.budgetCount})
            </CardTitle>
            <CardDescription>Lista completa de presupuestos emitidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Número</TableHead>
                    <TableHead className="font-semibold">Proyecto</TableHead>
                    <TableHead className="font-semibold">Fecha</TableHead>
                    <TableHead className="text-right font-semibold">Monto</TableHead>
                    <TableHead className="text-center font-semibold">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedClientData.budgets.map((budget) => (
                    <TableRow key={budget.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">#{budget.number}</TableCell>
                      <TableCell>{budget.project_name}</TableCell>
                      <TableCell>{new Date(budget.date).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell className="text-right font-mono">${Number(budget.total).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {budget.status === "paid" ? (
                          <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
                        ) : budget.status === "pending" ? (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>
                        ) : (
                          <Badge variant="destructive">Vencido</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Facturas ({selectedClientData.invoiceCount})
            </CardTitle>
            <CardDescription>Lista completa de facturas emitidas</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedClientData.invoiceCount > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Número</TableHead>
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="text-right font-semibold">Monto</TableHead>
                      <TableHead className="text-center font-semibold">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClientData.invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">#{invoice.number}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          ${Number(invoice.total).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {invoice.status === "paid" ? (
                            <Badge className="bg-green-500 hover:bg-green-600">Pagado</Badge>
                          ) : invoice.status === "pending" ? (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">Pendiente</Badge>
                          ) : (
                            <Badge variant="destructive">Vencido</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay facturas emitidas para este cliente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
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
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportToPDF()} variant="default" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
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
                  <TableHead className="text-center font-semibold">Acciones</TableHead>
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
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          onClick={() => setSelectedClient(client.clientName)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                        >
                          Ver detalle
                        </Button>
                        <Button onClick={() => exportToPDF(client)} variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
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
