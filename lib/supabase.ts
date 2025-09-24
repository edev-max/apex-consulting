import { createClient } from "@supabase/supabase-js"

// Configuración de Supabase con las credenciales correctas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdyjnolivynofgmdsmgs.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWpub2xpdnlub2ZnbWRzbWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MzkyNjMsImV4cCI6MjA1MzMxNTI2M30.PzWXHMFWfPVkFrzytvPKrhM9kXxQaWiurx_0JL0PlxI"

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para verificar la conexión
export const checkSupabaseConnection = () => {
  console.log("Supabase URL:", supabaseUrl)
  console.log("Supabase Key (first 20 chars):", supabaseAnonKey.substring(0, 20) + "...")

  return {
    url: supabaseUrl,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isConfigured: !!supabaseUrl && !!supabaseAnonKey,
    keyLength: supabaseAnonKey.length,
  }
}

// Función para probar la conexión
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from("budgets").select("count", { count: "exact", head: true })
    if (error) {
      console.error("Supabase connection test failed:", error)
      return { success: false, error: error.message }
    }
    console.log("Supabase connection test successful")
    return { success: true, data }
  } catch (err) {
    console.error("Supabase connection test error:", err)
    return { success: false, error: "Connection failed" }
  }
}

// Tipos para TypeScript
export interface Database {
  public: {
    Tables: {
      budgets: {
        Row: {
          id: string
          number: string
          client_name: string
          project_name: string
          project_description: string | null
          total: number
          date: string
          status: "pending" | "paid" | "overdue"
          items: any[] | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          number: string
          client_name: string
          project_name: string
          project_description?: string | null
          total: number
          date: string
          status?: "pending" | "paid" | "overdue"
          items?: any[] | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          number?: string
          client_name?: string
          project_name?: string
          project_description?: string | null
          total?: number
          date?: string
          status?: "pending" | "paid" | "overdue"
          items?: any[] | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string
          total_hours: number
          consumed_hours: number
          remaining_hours: number
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          total_hours?: number
          consumed_hours?: number
          remaining_hours?: number
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          total_hours?: number
          consumed_hours?: number
          remaining_hours?: number
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      hour_entries: {
        Row: {
          id: string
          client_id: string
          client_name: string
          date: string
          hours: number
          description: string
          project: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          client_name: string
          date: string
          hours: number
          description: string
          project: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          client_name?: string
          date?: string
          hours?: number
          description?: string
          project?: string
          user_id?: string
          created_at?: string
        }
      }
      hour_quotes: {
        Row: {
          id: string
          client_id: string
          client_name: string
          requested_hours: number
          description: string
          project: string
          request_date: string
          status: "pending" | "approved" | "rejected"
          approved_date: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          client_name: string
          requested_hours: number
          description: string
          project: string
          request_date: string
          status?: "pending" | "approved" | "rejected"
          approved_date?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          client_name?: string
          requested_hours?: number
          description?: string
          project?: string
          request_date?: string
          status?: "pending" | "approved" | "rejected"
          approved_date?: string | null
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
