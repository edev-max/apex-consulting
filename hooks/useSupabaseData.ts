"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./useAuth"

interface Budget {
  id: string
  number: string
  client_name: string
  project_name: string
  project_description?: string
  total: number
  date: string
  status: "pending" | "paid" | "overdue"
  items?: any[]
}

interface Client {
  id: string
  name: string
  email: string
  consumed_hours: number
}

interface HourEntry {
  id: string
  client_id: string
  client_name: string
  date: string
  hours: number
  description: string
  project: string
  paid: boolean // Agregar este campo
}

interface HourQuote {
  id: string
  client_id: string
  client_name: string
  requested_hours: number
  description: string
  project: string
  request_date: string
  status: "pending" | "approved" | "rejected"
  approved_date?: string
}

interface CompanySettings {
  id: string
  company_name: string
  company_logo_url: string | null
}

interface UserProfile {
  id: string
  avatar_url: string | null
  full_name: string | null
}

export const useSupabaseData = () => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [hourEntries, setHourEntries] = useState<HourEntry[]>([])
  const [hourQuotes, setHourQuotes] = useState<HourQuote[]>([])
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [tablesExist, setTablesExist] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

  // Verificar si las tablas existen
  const checkTablesExist = async () => {
    if (!user) return false

    try {
      const tables = ["budgets", "clients", "hour_entries", "hour_quotes", "company_settings", "user_profiles"]
      const tableChecks = await Promise.all(
        tables.map(async (table) => {
          try {
            const { error } = await supabase.from(table).select("count", { count: "exact", head: true })
            return { table, exists: !error, error: error?.message }
          } catch (err) {
            return { table, exists: false, error: "Table check failed" }
          }
        }),
      )

      const missingTables = tableChecks.filter((check) => !check.exists)

      if (missingTables.length > 0) {
        setDbError(
          `Tablas faltantes: ${missingTables.map((t) => t.table).join(", ")}. Ejecuta los scripts SQL primero.`,
        )
        setTablesExist(false)
        return false
      }

      setTablesExist(true)
      setDbError(null)
      return true
    } catch (error) {
      console.error("Error checking tables:", error)
      setDbError("Error verificando la estructura de la base de datos")
      setTablesExist(false)
      return false
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (user) {
      loadAllData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadAllData = async () => {
    if (!user) return

    setLoading(true)

    const tablesOk = await checkTablesExist()

    if (!tablesOk) {
      setLoading(false)
      return
    }

    try {
      await Promise.all([
        loadBudgets(),
        loadClients(),
        loadHourEntries(),
        loadHourQuotes(),
        loadCompanySettings(),
        loadUserProfile(),
      ])
    } catch (error) {
      console.error("Error loading data:", error)
      setDbError("Error cargando datos de la base de datos")
    } finally {
      setLoading(false)
    }
  }

  // Funciones para presupuestos
  const loadBudgets = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading budgets:", error)
        return
      }

      setBudgets(
        data.map((budget) => ({
          id: budget.id,
          number: budget.number,
          client_name: budget.client_name,
          project_name: budget.project_name,
          project_description: budget.project_description,
          total: budget.total,
          date: budget.date,
          status: budget.status,
          items: budget.items,
        })),
      )
    } catch (error) {
      console.error("Error loading budgets:", error)
    }
  }

  const saveBudget = async (budgetData: {
    clientName: string
    projectName: string
    projectDescription: string
    budgetItems: any[]
    reportNumber: number
    total: number
  }) => {
    if (!user || !tablesExist) return null

    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert({
          number: budgetData.reportNumber.toString().padStart(4, "0"),
          client_name: budgetData.clientName,
          project_name: budgetData.projectName,
          project_description: budgetData.projectDescription,
          total: budgetData.total,
          items: budgetData.budgetItems,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) {
        console.error("Error saving budget:", error)
        return null
      }

      await loadBudgets()
      return data
    } catch (error) {
      console.error("Error saving budget:", error)
      return null
    }
  }

  const updateBudget = async (budgetId: string, updates: Partial<Budget>) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase
        .from("budgets")
        .update({
          client_name: updates.client_name,
          project_name: updates.project_name,
          project_description: updates.project_description,
          total: updates.total,
          status: updates.status,
          items: updates.items,
        })
        .eq("id", budgetId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error updating budget:", error)
        return
      }

      await loadBudgets()
    } catch (error) {
      console.error("Error updating budget:", error)
    }
  }

  const deleteBudget = async (budgetId: string) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("budgets").delete().eq("id", budgetId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting budget:", error)
        return
      }

      await loadBudgets()
    } catch (error) {
      console.error("Error deleting budget:", error)
    }
  }

  const getNextBudgetNumber = async () => {
    if (!user || !tablesExist) return 589

    try {
      const { data, error } = await supabase.rpc("get_next_budget_number", { user_uuid: user.id })

      if (error) {
        console.error("Error getting next budget number:", error)
        return 589
      }

      return data || 589
    } catch (error) {
      console.error("Error getting next budget number:", error)
      return 589
    }
  }

  // Funciones para clientes
  const loadClients = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading clients:", error)
        return
      }

      setClients(data)
    } catch (error) {
      console.error("Error loading clients:", error)
    }
  }

  const saveClient = async (clientData: { name: string; email: string }) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("clients").insert({
        name: clientData.name,
        email: clientData.email,
        consumed_hours: 0,
        user_id: user.id,
      })

      if (error) {
        console.error("Error saving client:", error)
        return
      }

      await loadClients()
    } catch (error) {
      console.error("Error saving client:", error)
    }
  }

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("clients").update(updates).eq("id", clientId).eq("user_id", user.id)

      if (error) {
        console.error("Error updating client:", error)
        return
      }

      await loadClients()
    } catch (error) {
      console.error("Error updating client:", error)
    }
  }

  const deleteClient = async (clientId: string) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting client:", error)
        return
      }

      await loadClients()
    } catch (error) {
      console.error("Error deleting client:", error)
    }
  }

  // Funciones para registros de horas
  const loadHourEntries = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase
        .from("hour_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading hour entries:", error)
        return
      }

      setHourEntries(data)
    } catch (error) {
      console.error("Error loading hour entries:", error)
    }
  }

  const saveHourEntry = async (entryData: {
    clientId: string
    clientName: string
    hours: number
    description: string
    project: string
  }) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("hour_entries").insert({
        client_id: entryData.clientId,
        client_name: entryData.clientName,
        hours: entryData.hours,
        description: entryData.description,
        project: entryData.project,
        paid: false, // Agregar este campo
        user_id: user.id,
      })

      if (error) {
        console.error("Error saving hour entry:", error)
        return
      }

      await loadHourEntries()
    } catch (error) {
      console.error("Error saving hour entry:", error)
    }
  }

  const deleteHourEntry = async (entryId: string) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("hour_entries").delete().eq("id", entryId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting hour entry:", error)
        return
      }

      await loadHourEntries()
    } catch (error) {
      console.error("Error deleting hour entry:", error)
    }
  }

  const markHourEntryAsPaid = async (entryId: string) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase
        .from("hour_entries")
        .update({ paid: true })
        .eq("id", entryId)
        .eq("user_id", user.id)

      if (error) {
        console.error("Error marking hour entry as paid:", error)
        return
      }

      await loadHourEntries()
    } catch (error) {
      console.error("Error marking hour entry as paid:", error)
    }
  }

  // Funciones para cotizaciones de horas
  const loadHourQuotes = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase
        .from("hour_quotes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading hour quotes:", error)
        return
      }

      setHourQuotes(data)
    } catch (error) {
      console.error("Error loading hour quotes:", error)
    }
  }

  const saveHourQuote = async (quoteData: {
    clientId: string
    clientName: string
    requestedHours: number
    description: string
    project: string
  }) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("hour_quotes").insert({
        client_id: quoteData.clientId,
        client_name: quoteData.clientName,
        requested_hours: quoteData.requestedHours,
        description: quoteData.description,
        project: quoteData.project,
        user_id: user.id,
      })

      if (error) {
        console.error("Error saving hour quote:", error)
        return
      }

      await loadHourQuotes()
    } catch (error) {
      console.error("Error saving hour quote:", error)
    }
  }

  const updateHourQuote = async (quoteId: string, updates: Partial<HourQuote>) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("hour_quotes").update(updates).eq("id", quoteId).eq("user_id", user.id)

      if (error) {
        console.error("Error updating hour quote:", error)
        return
      }

      await loadHourQuotes()
    } catch (error) {
      console.error("Error updating hour quote:", error)
    }
  }

  const deleteHourQuote = async (quoteId: string) => {
    if (!user || !tablesExist) return

    try {
      const { error } = await supabase.from("hour_quotes").delete().eq("id", quoteId).eq("user_id", user.id)

      if (error) {
        console.error("Error deleting hour quote:", error)
        return
      }

      await loadHourQuotes()
    } catch (error) {
      console.error("Error deleting hour quote:", error)
    }
  }

  // Funciones para configuración de empresa
  const loadCompanySettings = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase.from("company_settings").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading company settings:", error)
        return
      }

      setCompanySettings(data)
    } catch (error) {
      console.error("Error loading company settings:", error)
    }
  }

  const saveCompanySettings = async (settings: { company_name: string; company_logo_url?: string }) => {
    if (!user || !tablesExist) return null

    try {
      const { data: existingSettings } = await supabase
        .from("company_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      let data, error

      if (existingSettings) {
        const result = await supabase
          .from("company_settings")
          .update({
            company_name: settings.company_name,
            company_logo_url: settings.company_logo_url || existingSettings.company_logo_url,
          })
          .eq("user_id", user.id)
          .select()
          .single()

        data = result.data
        error = result.error
      } else {
        const result = await supabase
          .from("company_settings")
          .insert({
            user_id: user.id,
            company_name: settings.company_name,
            company_logo_url: settings.company_logo_url || null,
          })
          .select()
          .single()

        data = result.data
        error = result.error
      }

      if (error) {
        console.error("Error saving company settings:", error)
        return null
      }

      setCompanySettings(data)
      return data
    } catch (error) {
      console.error("Error saving company settings:", error)
      return null
    }
  }

  // Funciones para perfil de usuario
  const loadUserProfile = async () => {
    if (!user || !tablesExist) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading user profile:", error)
        return
      }

      setUserProfile(data)
    } catch (error) {
      console.error("Error loading user profile:", error)
    }
  }

  const saveUserProfile = async (profile: { avatar_url?: string; full_name?: string }) => {
    if (!user || !tablesExist) return null

    try {
      const { data: existingProfile } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      let data, error

      if (existingProfile) {
        const result = await supabase
          .from("user_profiles")
          .update({
            avatar_url: profile.avatar_url || existingProfile.avatar_url,
            full_name: profile.full_name || existingProfile.full_name,
          })
          .eq("user_id", user.id)
          .select()
          .single()

        data = result.data
        error = result.error
      } else {
        const result = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            avatar_url: profile.avatar_url || null,
            full_name: profile.full_name || null,
          })
          .select()
          .single()

        data = result.data
        error = result.error
      }

      if (error) {
        console.error("Error saving user profile:", error)
        return null
      }

      setUserProfile(data)
      return data
    } catch (error) {
      console.error("Error saving user profile:", error)
      return null
    }
  }

  const uploadFile = async (file: File, bucket: string, path: string) => {
    if (!user) return null

    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Error uploading file:", error)
        return null
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path)

      return publicUrl
    } catch (error) {
      console.error("Error uploading file:", error)
      return null
    }
  }

  return {
    budgets,
    clients,
    hourEntries,
    hourQuotes,
    companySettings,
    userProfile,
    loading,
    tablesExist,
    dbError,
    saveBudget,
    updateBudget,
    deleteBudget,
    getNextBudgetNumber,
    saveClient,
    updateClient,
    deleteClient,
    saveHourEntry,
    deleteHourEntry,
    markHourEntryAsPaid, // Agregar esta línea
    saveHourQuote,
    updateHourQuote,
    deleteHourQuote,
    loadCompanySettings,
    saveCompanySettings,
    loadUserProfile,
    saveUserProfile,
    loadAllData,
    checkTablesExist,
    uploadFile,
  }
}
