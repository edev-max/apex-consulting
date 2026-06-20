"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
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
  CheckCircleIcon,
  DollarSignIcon,
  Eye,
  Pencil,
  Ban,
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
  paid_amount?: number
  payment_status?: "unpaid" | "partial" | "paid"
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
  paid_amount?: number
  payment_status?: "unpaid" | "partial" | "paid"
  date: string
  status: "pending" | "paid" | "overdue"
}

interface ClientDebt {
  clientName: string
  totalBudgets: number
  totalPaid: number
  pendingDebt: number
  budgetCount: number
  invoiceCount: number
  budgets: Budget[]
  invoices: Invoice[]
}

interface DebtReportProps {
  budgets: Budget[]
  clients: Client[] // Assuming Client interface exists elsewhere
  invoices: Invoice[]
  selectedClientId?: string
  companyName?: string
  companyLogoUrl?: string | null
  onRegisterPayment?: (budgetId?: string) => void
  onViewBudget?: (budget: Budget) => void
  onPrintBudget?: (budget: Budget) => void
  onCancelBudget?: (budget: Budget) => void
  budgetPayments?: any[] // Assuming this is an array of payment objects
  getPaymentsByBudget?: (budgetId: string) => any[]
}

export function DebtReport({
  budgets,
  clients, // This prop is not used in the current logic, but is part of the update
  invoices,
  selectedClientId,
  companyName = "APEX CONSULTING",
  companyLogoUrl,
  onRegisterPayment,
  onViewBudget,
  onPrintBudget,
  onCancelBudget,
  budgetPayments = [], // Default value for budgetPayments
  getPaymentsByBudget,
}: DebtReportProps) {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [overdueIds, setOverdueIds] = useState<Set<string>>(new Set())

  const toggleOverdue = (id: string) => {
    setOverdueIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const calculateClientDebts = (): ClientDebt[] => {
    const clientMap = new Map<string, ClientDebt>()

    // Procesar presupuestos (excluir cancelados)
    budgets.forEach((budget) => {
      // Filtrar presupuestos cancelados
      if (budget.status === 'cancelled') return
      
      const existing = clientMap.get(budget.client_name) || {
        clientName: budget.client_name,
        totalBudgets: 0,
        totalPaid: 0,
        pendingDebt: 0,
        budgetCount: 0,
        invoiceCount: 0,
        budgets: [],
        invoices: [],
      }

      const paidAmount = Number(budget.paid_amount || 0)
      existing.totalBudgets += Number(budget.total)
      existing.totalPaid += paidAmount
      existing.budgetCount += 1
      existing.budgets.push(budget)
      clientMap.set(budget.client_name, existing)
    })

    // Contar facturas por cliente
    invoices.forEach((invoice) => {
      const existing = clientMap.get(invoice.client_name)
      if (existing) {
        existing.invoiceCount += 1
        existing.invoices.push(invoice)
      }
    })

    // Calcular deuda pendiente
    clientMap.forEach((client) => {
      client.pendingDebt = client.totalBudgets - client.totalPaid
    })

    return Array.from(clientMap.values()).sort((a, b) => b.pendingDebt - a.pendingDebt)
  }

  const clientDebts = calculateClientDebts()

  const selectedClientData = selectedClient
    ? (() => {
        const client = clientDebts.find((c) => c.clientName === selectedClient)
        if (!client) return null

        // Filtrar solo presupuestos con saldo pendiente y no cancelados
        const budgetsWithDebt = client.budgets.filter((budget) => {
          if (budget.status === 'cancelled') return false
          const paidAmount = Number(budget.paid_amount || 0)
          const totalAmount = Number(budget.total)
          return paidAmount < totalAmount
        })

        return {
          ...client,
          budgets: budgetsWithDebt,
          budgetCount: budgetsWithDebt.length,
          totalBudgets: budgetsWithDebt.reduce((sum, b) => sum + Number(b.total), 0),
          totalPaid: budgetsWithDebt.reduce((sum, b) => sum + Number(b.paid_amount || 0), 0),
          pendingDebt: budgetsWithDebt.reduce((sum, b) => sum + (Number(b.total) - Number(b.paid_amount || 0)), 0),
        }
      })()
    : null

  const totalPendingDebt = clientDebts.reduce((sum, client) => sum + client.pendingDebt, 0)
  const totalBudgeted = clientDebts.reduce((sum, c) => sum + c.totalBudgets, 0)
  const totalPaid = clientDebts.reduce((sum, c) => sum + c.totalPaid, 0)
  const collectionRate = totalBudgeted > 0 ? ((totalPaid / totalBudgeted) * 100).toFixed(1) : "0"

  const topDebtors = clientDebts.slice(0, 10)
  const chartData = topDebtors.map((client) => ({
    name: client.clientName.length > 15 ? client.clientName.substring(0, 15) + "..." : client.clientName,
    Presupuestado: client.totalBudgets,
    Pagado: client.totalPaid,
    Pendiente: client.pendingDebt,
  }))

  const statusDistribution = [
    {
      name: "Pagado",
      value: clientDebts.filter((c) => c.pendingDebt === 0).length,
      color: "#10b981",
    },
    {
      name: "Sin pagar",
      value: clientDebts.filter((c) => c.totalPaid === 0 && c.totalBudgets > 0).length,
      color: "#ef4444",
    },
    {
      name: "Parcial",
      value: clientDebts.filter((c) => c.pendingDebt > 0 && c.totalPaid > 0).length,
      color: "#f97316",
    },
  ].filter((item) => item.value > 0)

  const exportToCSV = () => {
    const headers = ["Cliente", "Total Presupuestos", "Total Pagado", "Deuda Pendiente", "# Presupuestos", "# Facturas"]
    const rows = clientDebts.map((client) => [
      client.clientName,
      client.totalBudgets.toFixed(2),
      client.totalPaid.toFixed(2),
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
      const overdueList = client.budgets.filter((b) => overdueIds.has(b.id))
      const overdueTotal = overdueList.reduce(
        (sum, b) => sum + (Number(b.total) - Number(b.paid_amount || 0)),
        0,
      )
      const notOverdueTotal = client.pendingDebt - overdueTotal

      content = `
        <div class="client-info">
          <h2>${client.clientName}</h2>
          <p>Reporte de Deudas Pendientes - Generado el ${currentDate}</p>
        </div>

        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Presupuestado</div>
            <div class="summary-value">$${client.totalBudgets.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Pagado</div>
            <div class="summary-value" style="color: #10b981;">$${client.totalPaid.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Deuda Pendiente</div>
            <div class="summary-value" style="color: ${client.pendingDebt > 0 ? "#f97316" : "#10b981"};">$${client.pendingDebt.toLocaleString()}</div>
          </div>
        </div>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #374151;">Presupuestos con Saldo Pendiente (${client.budgetCount})</h3>
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Proyecto</th>
              <th>Fecha</th>
              <th style="text-align: right;">Total</th>
              <th style="text-align: right;">Pagado</th>
              <th style="text-align: right;">Pendiente</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${client.budgets
              .map((budget) => {
                const paidAmount = Number(budget.paid_amount || 0)
                const totalAmount = Number(budget.total)
                const pendingAmount = totalAmount - paidAmount

                return `
              <tr>
                <td>#${budget.number}</td>
                <td>${budget.project_name}</td>
                <td>${new Date(budget.date).toLocaleDateString("es-ES")}</td>
                <td style="text-align: right;">$${totalAmount.toLocaleString()}</td>
                <td style="text-align: right; color: #10b981;">$${paidAmount.toLocaleString()}</td>
                <td style="text-align: right; color: #f97316; font-weight: 600;">$${pendingAmount.toLocaleString()}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${
                    paidAmount >= totalAmount
                      ? "background-color: #d1fae5; color: #065f46;"
                      : paidAmount > 0
                        ? "background-color: #fed7aa; color: #9a3412;"
                        : "background-color: #fee2e2; color: #991b1b;"
                  }">
                    ${paidAmount >= totalAmount ? "Pagado" : paidAmount > 0 ? "Parcial" : "Sin pagar"}
                  </span>
                  ${
                    overdueIds.has(budget.id)
                      ? '<span style="margin-left:6px;padding:4px 8px;border-radius:4px;font-size:11px;font-weight:700;background-color:#fee2e2;color:#991b1b;">VENCIDO</span>'
                      : ""
                  }
                </td>
              </tr>
            `
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6; font-weight: bold; border-top: 3px solid #3b82f6;">
              <td colspan="3" style="text-align: right; padding: 14px 12px;">TOTALES:</td>
              <td style="text-align: right; color: #1e40af; font-size: 15px;">$${client.totalBudgets.toLocaleString()}</td>
              <td style="text-align: right; color: #10b981; font-size: 15px;">$${client.totalPaid.toLocaleString()}</td>
              <td style="text-align: right; color: ${client.pendingDebt > 0 ? "#f97316" : "#10b981"}; font-size: 15px;">$${client.pendingDebt.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin:20px 0;">
          <div style="background:#fef2f2;border:2px solid #fecaca;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:13px;color:#6b7280;margin-bottom:6px;font-weight:500;">Saldo Pendiente Vencido</div>
            <div style="font-size:24px;font-weight:bold;color:#dc2626;">$${overdueTotal.toLocaleString()}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;">${overdueList.length} presupuesto(s) vencido(s)</div>
          </div>
          <div style="background:#fffbeb;border:2px solid #fde68a;border-radius:8px;padding:16px;text-align:center;">
            <div style="font-size:13px;color:#6b7280;margin-bottom:6px;font-weight:500;">Saldo Pendiente por Vencer</div>
            <div style="font-size:24px;font-weight:bold;color:#d97706;">$${notOverdueTotal.toLocaleString()}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:4px;">Resto del saldo pendiente</div>
          </div>
        </div>

        <h3 style="margin-top: 30px; margin-bottom: 15px; color: #374151;">Facturas Emitidas (${client.invoiceCount})</h3>
        ${
          client.invoiceCount > 0
            ? (
                () => {
                  const invoiceTotals = {
                    total: client.invoices.reduce((sum, inv) => sum + Number(inv.total), 0),
                    paid: client.invoices.reduce((sum, inv) => sum + Number(inv.paid_amount || 0), 0),
                  }
                  invoiceTotals.pending = invoiceTotals.total - invoiceTotals.paid

                  return `
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th style="text-align: right;">Total</th>
              <th style="text-align: right;">Pagado</th>
              <th style="text-align: right;">Pendiente</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            ${client.invoices
              .map((invoice) => {
                const paidAmount = Number(invoice.paid_amount || 0)
                const totalAmount = Number(invoice.total)
                const pendingAmount = totalAmount - paidAmount

                return `
              <tr>
                <td>#${invoice.number}</td>
                <td>${new Date(invoice.date).toLocaleDateString("es-ES")}</td>
                <td style="text-align: right;">$${totalAmount.toLocaleString()}</td>
                <td style="text-align: right; color: #10b981;">$${paidAmount.toLocaleString()}</td>
                <td style="text-align: right; color: ${pendingAmount > 0 ? "#f97316" : "#10b981"};">$${pendingAmount.toLocaleString()}</td>
                <td>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${
                    paidAmount >= totalAmount
                      ? "background-color: #d1fae5; color: #065f46;"
                      : paidAmount > 0
                        ? "background-color: #fed7aa; color: #9a3412;"
                        : "background-color: #fee2e2; color: #991b1b;"
                  }">
                    ${paidAmount >= totalAmount ? "Pagado" : paidAmount > 0 ? "Parcial" : "Sin pagar"}
                  </span>
                </td>
              </tr>
            `
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6; font-weight: bold; border-top: 3px solid #3b82f6;">
              <td colspan="2" style="text-align: right; padding: 14px 12px;">TOTALES:</td>
              <td style="text-align: right; color: #1e40af; font-size: 15px;">$${invoiceTotals.total.toLocaleString()}</td>
              <td style="text-align: right; color: #10b981; font-size: 15px;">$${invoiceTotals.paid.toLocaleString()}</td>
              <td style="text-align: right; color: ${invoiceTotals.pending > 0 ? "#f97316" : "#10b981"}; font-size: 15px;">$${invoiceTotals.pending.toLocaleString()}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        `
                }
              )()
            : '<p style="text-align: center; color: #6b7280; padding: 20px;">No hay facturas emitidas</p>'
        }
      `
    } else {
      content = `
        <div class="summary">
          <div class="summary-item">
            <div class="summary-label">Total Presupuestado</div>
            <div class="summary-value">$${totalBudgeted.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Pagado</div>
            <div class="summary-value" style="color: #10b981;">$${totalPaid.toLocaleString()}</div>
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
              <th style="text-align: right;">Pagado</th>
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
                <td style="text-align: right; color: #10b981;">$${client.totalPaid.toLocaleString()}</td>
                <td style="text-align: right; font-weight: 600; color: ${client.pendingDebt > 0 ? "#f97316" : "#10b981"};">$${client.pendingDebt.toLocaleString()}</td>
                <td style="text-align: center;">${client.budgetCount} P / ${client.invoiceCount} F</td>
                <td style="text-align: center;">
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; ${
                    client.pendingDebt === 0
                      ? "background-color: #d1fae5; color: #065f46;"
                      : client.totalPaid === 0
                        ? "background-color: #fee2e2; color: #991b1b;"
                        : "background-color: #fed7aa; color: #9a3412;"
                  }">
                    ${client.pendingDebt === 0 ? "Pagado" : client.totalPaid === 0 ? "Sin pagar" : "Parcial"}
                  </span>
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6; font-weight: bold; border-top: 3px solid #3b82f6;">
              <td style="text-align: right; padding: 14px 12px;">TOTALES GENERALES:</td>
              <td style="text-align: right; color: #1e40af; font-size: 16px;">$${totalBudgeted.toLocaleString()}</td>
              <td style="text-align: right; color: #10b981; font-size: 16px;">$${totalPaid.toLocaleString()}</td>
              <td style="text-align: right; color: #f97316; font-size: 16px;">$${totalPendingDebt.toLocaleString()}</td>
              <td colspan="2" style="text-align: center; color: #6b7280; font-size: 14px;">
                ${clientDebts.reduce((sum, c) => sum + c.budgetCount, 0)} P / ${clientDebts.reduce((sum, c) => sum + c.invoiceCount, 0)} F
              </td>
            </tr>
          </tfoot>
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
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #333; background: white; }
    .container { max-width: 100%; margin: 0 auto; }
    
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
    tfoot td {
      background: #f3f4f6 !important;
      border-top: 3px solid #3b82f6;
      padding: 14px 12px;
      font-weight: bold;
      font-size: 14px;
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
      body { padding: 15px; }
      .no-print { display: none; }
      .summary-item { break-inside: avoid; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      tfoot { break-inside: avoid; }
      @page {
        size: landscape;
        margin: 15mm;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-left">
        ${companyLogoUrl ? `<img src="${companyLogoUrl}" alt="Logo" class="company-logo" />` : ""}
        <div class="company-info">
          <h1>${companyName}</h1>
          <p class="tagline">Reporte de Deudas Pendientes</p>
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

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      transfer: "Transferencia",
      cash: "Efectivo",
      check: "Cheque",
      card: "Tarjeta",
      paypal: "PayPal",
      zelle: "Zelle",
      other: "Otro",
    }
    return labels[method] || method
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
    const overdueBudgets = selectedClientData.budgets.filter((b) => overdueIds.has(b.id))
    const overdueTotal = overdueBudgets.reduce(
      (sum, b) => sum + (Number(b.total) - Number(b.paid_amount || 0)),
      0,
    )
    const notOverdueTotal = selectedClientData.pendingDebt - overdueTotal

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

        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-white">{selectedClientData.clientName}</CardTitle>
            <CardDescription className="text-gray-400">Presupuestos con saldo pendiente de pago</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border-l-4 border-l-blue-500">
                <div className="text-sm text-gray-400 mb-1">Total Presupuestado</div>
                <div className="text-2xl font-bold text-blue-400">
                  ${selectedClientData.totalBudgets.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedClientData.budgetCount} presupuestos pendientes
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border-l-4 border-l-green-500">
                <div className="text-sm text-gray-400 mb-1">Total Pagado</div>
                <div className="text-2xl font-bold text-green-400">
                  ${selectedClientData.totalPaid.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Pagos recibidos</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border-l-4 border-l-orange-500">
                <div className="text-sm text-gray-400 mb-1">Deuda Pendiente</div>
                <div
                  className={`text-2xl font-bold ${selectedClientData.pendingDebt > 0 ? "text-orange-400" : "text-green-400"}`}
                >
                  ${selectedClientData.pendingDebt.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {selectedClientData.pendingDebt === 0 ? "Todo pagado" : "Por cobrar"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-red-500/10 rounded-lg p-4 border-l-4 border-l-red-500">
                <div className="text-sm text-gray-400 mb-1">Saldo Pendiente Vencido</div>
                <div className="text-2xl font-bold text-red-400">${overdueTotal.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {overdueBudgets.length} presupuesto(s) marcado(s) como vencido
                </div>
              </div>
              <div className="bg-yellow-500/10 rounded-lg p-4 border-l-4 border-l-yellow-500">
                <div className="text-sm text-gray-400 mb-1">Saldo Pendiente por Vencer</div>
                <div className="text-2xl font-bold text-yellow-400">${notOverdueTotal.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-1">Resto del saldo pendiente</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedClientData.budgetCount > 0 ? (
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-blue-400" />
                Presupuestos con Saldo Pendiente ({selectedClientData.budgetCount})
              </CardTitle>
              <CardDescription className="text-gray-400">Solo presupuestos que aún tienen montos por cobrar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/5 border-white/10">
                      <TableHead className="font-semibold text-gray-300">Número</TableHead>
                      <TableHead className="font-semibold text-gray-300">Proyecto</TableHead>
                      <TableHead className="font-semibold text-gray-300">Fecha</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">Total</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">Pagado</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">Pendiente</TableHead>
                      <TableHead className="text-center font-semibold text-gray-300">Estado</TableHead>
                      <TableHead className="text-center font-semibold text-gray-300">Vencido</TableHead>
                      <TableHead className="text-center font-semibold text-gray-300">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClientData.budgets.map((budget) => {
                      const paidAmount = Number(budget.paid_amount || 0)
                      const totalAmount = Number(budget.total)
                      const pendingAmount = totalAmount - paidAmount

                      return (
                        <TableRow key={budget.id} className="hover:bg-white/5 transition-colors border-white/10">
                          <TableCell className="font-medium text-white">#{budget.number}</TableCell>
                          <TableCell className="text-gray-300">{budget.project_name}</TableCell>
                          <TableCell className="text-gray-300">{new Date(budget.date).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell className="text-right font-mono text-white">${totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-green-400">
                            ${paidAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono text-orange-400 font-semibold">
                            ${pendingAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-center">
                            {paidAmount >= totalAmount ? (
                              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Pagado</Badge>
                            ) : paidAmount > 0 ? (
                              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">Parcial</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">Sin pagar</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={overdueIds.has(budget.id)}
                              onChange={() => toggleOverdue(budget.id)}
                              className="h-4 w-4 accent-red-500 cursor-pointer"
                              title="Marcar como vencido"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              {onViewBudget && (
                                <Button
                                  onClick={() => onViewBudget(budget)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                                  title="Ver/Editar"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              {onPrintBudget && (
                                <Button
                                  onClick={() => onPrintBudget(budget)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                                  title="Reimprimir"
                                >
                                  <Printer className="h-4 w-4" />
                                </Button>
                              )}
                              {pendingAmount > 0 && onRegisterPayment && (
                                <Button
                                  onClick={() => onRegisterPayment(budget.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white h-8 px-2"
                                >
                                  <DollarSignIcon className="h-4 w-4 mr-1" />
                                  Pagar
                                </Button>
                              )}
                              {onCancelBudget && (
                                <Button
                                  onClick={() => onCancelBudget(budget)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                  title="Cancelar (no contará como deuda)"
                                >
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-white/10 bg-white/5">
            <CardContent className="text-center py-12">
              <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-semibold text-green-400 mb-2">¡Todo al día!</h3>
              <p className="text-gray-400">
                Este cliente no tiene presupuestos pendientes de pago. Todos sus presupuestos han sido pagados en su
                totalidad.
              </p>
            </CardContent>
          </Card>
        )}

        {selectedClientData.invoiceCount > 0 && (
          <Card className="border border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-green-400" />
                Facturas Emitidas ({selectedClientData.invoiceCount})
              </CardTitle>
              <CardDescription className="text-gray-400">Lista completa de facturas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-white/5 border-white/10">
                      <TableHead className="font-semibold text-gray-300">Número</TableHead>
                      <TableHead className="font-semibold text-gray-300">Fecha</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">Total</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">Pagado</TableHead>
                      <TableHead className="text-right font-semibold text-gray-300">Pendiente</TableHead>
                      <TableHead className="text-center font-semibold text-gray-300">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedClientData.invoices.map((invoice) => {
                      const paidAmount = Number(invoice.paid_amount || 0)
                      const totalAmount = Number(invoice.total)
                      const pendingAmount = totalAmount - paidAmount

                      return (
                        <TableRow key={invoice.id} className="hover:bg-white/5 transition-colors border-white/10">
                          <TableCell className="font-medium text-white">#{invoice.number}</TableCell>
                          <TableCell className="text-gray-300">{new Date(invoice.date).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell className="text-right font-mono text-white">${totalAmount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-green-400">
                            ${paidAmount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            <span className={pendingAmount > 0 ? "text-orange-400" : "text-green-400"}>
                              ${pendingAmount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {paidAmount >= totalAmount ? (
                              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Pagado</Badge>
                            ) : paidAmount > 0 ? (
                              <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">Parcial</Badge>
                            ) : (
                              <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">Sin pagar</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {getPaymentsByBudget && (
          <Card className="border border-white/10 bg-white/5 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSignIcon className="h-5 w-5 text-green-400" />
                Historial de Pagos
              </CardTitle>
              <CardDescription className="text-gray-400">Pagos registrados para los presupuestos pendientes de este cliente</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const clientPayments = selectedClientData.budgets.flatMap((budget) => {
                  const payments = getPaymentsByBudget(budget.id)
                  return payments.map((p) => ({
                    ...p,
                    budget_number: budget.number,
                    project_name: budget.project_name,
                  }))
                })

                if (clientPayments.length === 0) {
                  return <p className="text-gray-400 text-center py-4">No hay pagos registrados</p>
                }

                return (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-green-500/10 border-white/10">
                        <TableHead className="text-gray-300">Fecha</TableHead>
                        <TableHead className="text-gray-300">Presupuesto</TableHead>
                        <TableHead className="text-gray-300">Método</TableHead>
                        <TableHead className="text-gray-300">Referencia</TableHead>
                        <TableHead className="text-right text-gray-300">Monto</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientPayments
                        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                        .map((payment) => (
                          <TableRow key={payment.id} className="border-white/10">
                            <TableCell className="text-gray-300">{new Date(payment.payment_date).toLocaleDateString("es-ES")}</TableCell>
                            <TableCell className="text-white">
                              #{payment.budget_number} - {payment.project_name}
                            </TableCell>
                            <TableCell className="text-gray-300">{getPaymentMethodLabel(payment.payment_method)}</TableCell>
                            <TableCell className="text-gray-400">{payment.reference_number || "-"}</TableCell>
                            <TableCell className="text-right font-bold text-green-400">
                              ${Number(payment.amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow className="bg-green-500/20 border-white/10">
                        <TableCell colSpan={4} className="text-right font-bold text-white">
                          Total Pagado:
                        </TableCell>
                        <TableCell className="text-right font-bold text-green-400 text-lg">
                          ${clientPayments.reduce((sum, p) => sum + Number(p.amount), 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                )
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500 border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Presupuestado</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">${totalBudgeted.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {clientDebts.reduce((sum, c) => sum + c.budgetCount, 0)} presupuestos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">${totalPaid.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Pagos recibidos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Deuda Pendiente</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">${totalPendingDebt.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              {clientDebts.filter((c) => c.pendingDebt > 0).length} clientes con deuda
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 border border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tasa de Cobro</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{collectionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Del total presupuestado</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Top 10 Clientes - Desglose Financiero</CardTitle>
            <CardDescription className="text-gray-400">Comparación de presupuestos, pagos y deudas pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} tick={{ fill: '#9ca3af' }} />
                <YAxis tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Legend wrapperStyle={{ color: "#9ca3af" }} />
                <Bar dataKey="Presupuestado" fill="#3b82f6" />
                <Bar dataKey="Pagado" fill="#10b981" />
                <Bar dataKey="Pendiente" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Distribución por Estado de Pago</CardTitle>
            <CardDescription className="text-gray-400">Clientes según su estado de cuenta</CardDescription>
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
                <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              {statusDistribution.map((status, index) => (
                <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-2xl font-bold" style={{ color: status.color }}>
                    {status.value}
                  </div>
                  <div className="text-xs text-gray-400">{status.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/10 bg-white/5">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Users className="h-5 w-5 text-blue-400" />
                Detalle por Cliente
              </CardTitle>
              <CardDescription className="text-gray-400">Desglose completo de presupuestos y pagos por cliente</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm" className="border-white/20 text-gray-300 hover:bg-white/10">
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
          <div className="rounded-md border border-white/10">
            <Table>
              <TableHeader>
                <TableRow className="bg-white/5 border-white/10">
                  <TableHead className="font-semibold text-gray-300">Cliente</TableHead>
                  <TableHead className="text-right font-semibold text-gray-300">Presupuestado</TableHead>
                  <TableHead className="text-right font-semibold text-gray-300">Pagado</TableHead>
                  <TableHead className="text-right font-semibold text-gray-300">Pendiente</TableHead>
                  <TableHead className="text-center font-semibold text-gray-300">Docs</TableHead>
                  <TableHead className="text-center font-semibold text-gray-300">Estado</TableHead>
                  <TableHead className="text-center font-semibold text-gray-300">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientDebts.map((client, index) => (
                  <TableRow key={index} className="hover:bg-white/5 transition-colors border-white/10">
                    <TableCell className="font-medium text-white">{client.clientName}</TableCell>
                    <TableCell className="text-right font-mono text-white">${client.totalBudgets.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono text-green-400">
                      ${client.totalPaid.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span
                        className={`font-semibold ${client.pendingDebt > 0 ? "text-orange-400" : "text-green-400"}`}
                      >
                        ${client.pendingDebt.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-medium border border-blue-500/30">
                          {client.budgetCount} P
                        </span>
                        <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded font-medium border border-green-500/30">
                          {client.invoiceCount} F
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {client.pendingDebt === 0 ? (
                        <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Pagado</Badge>
                      ) : client.totalPaid === 0 ? (
                        <Badge className="bg-red-500/20 text-red-300 border border-red-500/30">Sin pagar</Badge>
                      ) : (
                        <Badge className="bg-orange-500/20 text-orange-300 border border-orange-500/30">Parcial</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          onClick={() => setSelectedClient(client.clientName)}
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-gray-300 hover:text-white hover:bg-white/10"
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
