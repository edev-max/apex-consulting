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
  total_hours: number
  consumed_hours: number
  remaining_hours: number
}

interface HourEntry {
  id: string
  client_id: string
  client_name: string
  date: string
  hours: number
  description: string
  project: string
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

export const useSupabaseData = () => {
  const { user } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [hourEntries, setHourEntries] = useState<HourEntry[]>([])
  const [hourQuotes, setHourQuotes] = useState<HourQuote[]>([])
  const [loading, setLoading] = useState(true)

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
    try {
      await Promise.all([loadBudgets(), loadClients(), loadHourEntries(), loadHourQuotes()])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Funciones para presupuestos
  const loadBudgets = async () => {
    if (!user) return

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
    if (!user) return null

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
    if (!user) return

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
    if (!user) return

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
    if (!user) return 589

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
    if (!user) return

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
    if (!user) return

    try {
      const { error } = await supabase.from("clients").insert({
        name: clientData.name,
        email: clientData.email,
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
    if (!user) return

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
    if (!user) return

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
    if (!user) return

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
    if (!user) return

    try {
      const { error } = await supabase.from("hour_entries").insert({
        client_id: entryData.clientId,
        client_name: entryData.clientName,
        hours: entryData.hours,
        description: entryData.description,
        project: entryData.project,
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
    if (!user) return

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

  // Funciones para cotizaciones de horas
  const loadHourQuotes = async () => {
    if (!user) return

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
    if (!user) return

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
    if (!user) return

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
    if (!user) return

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

  return {
    // Data
    budgets,
    clients,
    hourEntries,
    hourQuotes,
    loading,

    // Budget functions
    saveBudget,
    updateBudget,
    deleteBudget,
    getNextBudgetNumber,

    // Client functions
    saveClient,
    updateClient,
    deleteClient,

    // Hour entry functions
    saveHourEntry,
    deleteHourEntry,

    // Hour quote functions
    saveHourQuote,
    updateHourQuote,
    deleteHourQuote,

    // Utility
    loadAllData,
  }
}
