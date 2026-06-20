"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  LineChart,
  Line,
} from "recharts"
import { DollarSignIcon, UsersIcon, ClockIcon, AlertCircleIcon } from "lucide-react"

interface DashboardCardsProps {
  budgets: any[]
  clients: any[]
  hourEntries: any[]
}

export function DashboardCards({ budgets, clients, hourEntries }: DashboardCardsProps) {
  // Excluir presupuestos cancelados: no cuentan como ingreso ni como cuenta por cobrar
  const activeBudgets = budgets.filter((b) => b.status !== "cancelled")

  const totalRevenue = activeBudgets.reduce((sum, budget) => sum + budget.total, 0)
  const totalPaidRevenue = activeBudgets.reduce((sum, budget) => sum + (budget.paid_amount || 0), 0)
  const totalPendingRevenue = totalRevenue - totalPaidRevenue

  const paidBudgets = activeBudgets.filter((b) => b.payment_status === "paid" || b.paid_amount >= b.total)
  const pendingBudgets = activeBudgets.filter((b) => (b.paid_amount || 0) < b.total)

  const consumedHours = clients.reduce((sum, client) => sum + client.consumed_hours, 0)

  const totalHoursAdded = hourEntries
    .filter((e) => e.type === "add" || e.hours > 0)
    .reduce((sum, e) => sum + Math.abs(e.hours), 0)
  const totalHoursSubtracted = hourEntries
    .filter((e) => e.type === "subtract" || e.hours < 0)
    .reduce((sum, e) => sum + Math.abs(e.hours), 0)

  const budgetStatusData = [
    { name: "Pagados", value: paidBudgets.length, color: "#10b981" },
    {
      name: "Pendientes",
      value: activeBudgets.filter((b) => (b.paid_amount || 0) > 0 && (b.paid_amount || 0) < b.total).length,
      color: "#f59e0b",
    },
    { name: "Sin pagar", value: activeBudgets.filter((b) => (b.paid_amount || 0) === 0).length, color: "#ef4444" },
  ]

  const revenueData = [
    { name: "Ingresos Pagados", amount: totalPaidRevenue },
    { name: "Ingresos Pendientes", amount: totalPendingRevenue },
  ]

  // Datos de actividad mensual (simulados)
  const getMonthlyData = () => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    return months.map((month) => ({
      month,
      presupuestos: Math.floor(Math.random() * 10) + 1,
      ingresos: Math.floor(Math.random() * 50000) + 10000,
    }))
  }

  const monthlyData = getMonthlyData()

  return (
    <div className="space-y-6">
      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">${totalPaidRevenue.toLocaleString()}</span> pagados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente por Cobrar</CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">${totalPendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{pendingBudgets.length} presupuestos pendientes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">{consumedHours} horas consumidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Registradas</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hourEntries.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{totalHoursAdded}h</span> /{" "}
              <span className="text-red-600">-{totalHoursSubtracted}h</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingresos: Pagados vs Pendientes</CardTitle>
            <CardDescription>Comparación de ingresos cobrados y pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de estado de presupuestos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de Presupuestos</CardTitle>
            <CardDescription>Distribución por estado de pago</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {budgetStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actividad mensual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad Mensual</CardTitle>
          <CardDescription>Presupuestos e ingresos por mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="presupuestos" stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
