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
import {
  TrendingUpIcon,
  DollarSignIcon,
  UsersIcon,
  ClockIcon,
  FileTextIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from "lucide-react"

interface DashboardCardsProps {
  budgets: any[]
  clients: any[]
  hourEntries: any[]
  hourQuotes: any[]
}

export function DashboardCards({ budgets, clients, hourEntries, hourQuotes }: DashboardCardsProps) {
  // Calcular métricas
  const totalRevenue = budgets.reduce((sum, budget) => sum + budget.total, 0)
  const paidBudgets = budgets.filter((b) => b.status === "paid")
  const pendingBudgets = budgets.filter((b) => b.status === "pending")
  const totalPaidRevenue = paidBudgets.reduce((sum, budget) => sum + budget.total, 0)
  const totalPendingRevenue = pendingBudgets.reduce((sum, budget) => sum + budget.total, 0)

  const consumedHours = clients.reduce((sum, client) => sum + client.consumed_hours, 0)

  const pendingQuotes = hourQuotes.filter((q) => q.status === "pending")
  const approvedQuotes = hourQuotes.filter((q) => q.status === "approved")

  // Datos para gráficos
  const budgetStatusData = [
    { name: "Pagados", value: paidBudgets.length, color: "#10b981" },
    { name: "Pendientes", value: pendingBudgets.length, color: "#f59e0b" },
    { name: "Vencidos", value: budgets.filter((b) => b.status === "overdue").length, color: "#ef4444" },
  ]

  const revenueData = [
    { name: "Ingresos Confirmados", amount: totalPaidRevenue },
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
              <span className="text-green-600 flex items-center">
                <TrendingUpIcon className="h-3 w-3 mr-1" />${totalPaidRevenue.toLocaleString()} confirmados
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter((c) => c.consumed_hours > 0).length} con horas pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Pendientes de Pago</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consumedHours}h</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-orange-600">
                {clients.filter((c) => c.consumed_hours > 0).length} clientes con horas por cobrar
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuestos</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{paidBudgets.length} pagados</span> •{" "}
              <span className="text-yellow-600">{pendingBudgets.length} pendientes</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de estado de presupuestos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Presupuestos</CardTitle>
            <CardDescription>Distribución por estado de pago</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
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
          </CardContent>
        </Card>

        {/* Gráfico de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle>Análisis de Ingresos</CardTitle>
            <CardDescription>Ingresos confirmados vs pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Monto"]} />
                <Bar dataKey="amount" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de horas pendientes por cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Horas Pendientes por Cliente</CardTitle>
            <CardDescription>Clientes con horas por cobrar</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={clients
                  .filter((c) => c.consumed_hours > 0)
                  .slice(0, 10)
                  .map((c) => ({ name: c.name, hours: c.consumed_hours }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}h`, "Horas Pendientes"]} />
                <Bar dataKey="hours" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actividad mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Mensual</CardTitle>
            <CardDescription>Tendencia de presupuestos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="presupuestos" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
              Cotizaciones Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingQuotes.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Requieren tu atención</p>
            {pendingQuotes.slice(0, 3).map((quote) => (
              <div key={quote.id} className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                <div className="font-medium">{quote.client_name}</div>
                <div className="text-xs text-gray-600">
                  {quote.requested_hours}h - {quote.project}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              Cotizaciones Aprobadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{approvedQuotes.length}</div>
            <p className="text-sm text-muted-foreground mt-2">Este mes</p>
            <div className="mt-2 text-sm">
              <div className="text-green-600 font-medium">
                {approvedQuotes.reduce((sum, q) => sum + q.requested_hours, 0)}h aprobadas
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-orange-500" />
              Horas por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{consumedHours}h</div>
            <p className="text-sm text-muted-foreground mt-2">Total pendientes de pago</p>
            {clients
              .filter((c) => c.consumed_hours > 0)
              .slice(0, 3)
              .map((client) => (
                <div key={client.id} className="mt-2 p-2 bg-orange-50 rounded text-sm">
                  <div className="font-medium">{client.name}</div>
                  <div className="text-xs text-orange-600">{client.consumed_hours}h pendientes</div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Resumen de actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hourEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <div className="font-medium">{entry.client_name}</div>
                    <div className="text-sm text-gray-600">{entry.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{entry.hours}h</div>
                  <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString("es-ES")}</div>
                </div>
              </div>
            ))}
            {hourEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">No hay actividad reciente</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
