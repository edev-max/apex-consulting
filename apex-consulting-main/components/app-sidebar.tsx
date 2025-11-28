"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  FileTextIcon,
  UserIcon,
  ClockIcon,
  TrendingUpIcon,
  SettingsIcon,
  LogOutIcon,
  PlusIcon,
  Building2Icon,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useSupabaseData } from "@/hooks/useSupabaseData"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  budgetsCount: number
  clientsCount: number
  hoursCount: number
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AppSidebar({
  budgetsCount,
  clientsCount,
  hoursCount,
  activeTab,
  onTabChange,
  ...props
}: AppSidebarProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { companySettings, userProfile } = useSupabaseData()

  const handleSignOut = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      await signOut()
      router.push("/")
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
          {companySettings?.company_logo_url ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden bg-primary/10">
              <img
                src={companySettings.company_logo_url || "/placeholder.svg"}
                alt="Logo"
                className="h-full w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.nextElementSibling?.classList.remove("hidden")
                }}
              />
              <div className="hidden flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2Icon className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2Icon className="h-4 w-4" />
            </div>
          )}
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{companySettings?.company_name || "APEX CONSULTING"}</span>
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
            <div className="px-2 py-1 flex items-center gap-2">
              {userProfile?.avatar_url ? (
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={userProfile.avatar_url || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                      target.nextElementSibling?.classList.remove("hidden")
                    }}
                  />
                  <div className="hidden w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <span className="text-xs font-bold">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
                  </div>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="text-xs font-bold">{user?.email?.charAt(0).toUpperCase() || "U"}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground">Usuario:</div>
                <div className="text-sm font-medium truncate">
                  {userProfile?.full_name || (user?.email === "admin@apexconsulting.com" ? "admin" : user?.email)}
                </div>
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
