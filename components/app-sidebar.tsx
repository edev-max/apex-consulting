"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  AlertCircleIcon,
  FileTextIcon,
  UserIcon,
  ClockIcon,
  TrendingUpIcon,
  SettingsIcon,
  LogOutIcon,
  PlusIcon,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  budgetsCount: number
  clientsCount: number
  quotesCount: number
  hoursCount: number
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({
  budgetsCount,
  clientsCount,
  quotesCount,
  hoursCount,
  activeTab,
  onTabChange,
  ...props
}: AppSidebarProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  // const [activeTab, setActiveTab] = useState("quotes") // Removed useState

  const handleSignOut = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await signOut()
    }
  }

  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: TrendingUpIcon,
      count: 0,
      description: "Resumen general",
    },
    {
      id: "quotes",
      title: "Cotizaciones",
      icon: AlertCircleIcon,
      count: quotesCount,
      description: "Solicitudes de horas",
    },
    {
      id: "budgets",
      title: "Presupuestos",
      icon: FileTextIcon,
      count: budgetsCount,
      description: "Gestión de presupuestos",
    },
    {
      id: "clients",
      title: "Clientes",
      icon: UserIcon,
      count: clientsCount,
      description: "Base de clientes",
    },
    {
      id: "hours",
      title: "Control de Horas",
      icon: ClockIcon,
      count: hoursCount,
      description: "Registro de tiempo",
    },
    {
      id: "reports",
      title: "Reportes",
      icon: TrendingUpIcon,
      count: 0,
      description: "Análisis y reportes",
    },
    {
      id: "settings",
      title: "Configuración",
      icon: SettingsIcon,
      count: 0,
      description: "Ajustes del sistema",
    },
  ]

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">AC</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">APEX CONSULTING</span>
            <span className="truncate text-xs text-muted-foreground">Sistema de Gestión</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={activeTab === item.id}
                    onClick={() => onTabChange(item.id)}
                    className="w-full justify-start"
                  >
                    <button className="flex items-center gap-3 w-full">
                      <item.icon className="h-4 w-4" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                      {item.count > 0 && (
                        <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {item.count}
                        </span>
                      )}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/budget-report" className="flex items-center gap-3">
                    <PlusIcon className="h-4 w-4" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Nuevo Presupuesto</div>
                      <div className="text-xs text-muted-foreground">Crear presupuesto</div>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="px-2 py-1">
              <div className="text-xs text-muted-foreground">Usuario:</div>
              <div className="text-sm font-medium">
                {user?.email === "admin@apexconsulting.com" ? "admin" : user?.email}
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOutIcon className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
