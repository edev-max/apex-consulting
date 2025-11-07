import { createClient } from "./supabase/client"

// Configuración de Supabase con las credenciales correctas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vdyjnolivynofgmdsmgs.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeWpub2xpdnlub2ZnbWRzbWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc3MzkyNjMsImV4cCI6MjA1MzMxNTI2M30.PzWXHMFWfPVkFrzytvPKrhM9kXxQaWiurx_0JL0PlxI"

// Crear cliente de Supabase
export const supabase = createClient()

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

// Función mejorada para probar la conexión
export const testSupabaseConnection = async () => {
  try {
    console.log("🔍 Iniciando test de conexión a Supabase...")

    // Test 1: Verificar configuración básica
    const config = checkSupabaseConnection()
    if (!config.isConfigured) {
      return {
        success: false,
        error: "Configuración incompleta - URL o API Key faltante",
        details: config,
      }
    }

    // Test 2: Probar conexión básica con auth
    console.log("🔍 Probando conexión de autenticación...")
    const { data: authData, error: authError } = await supabase.auth.getSession()
    if (authError) {
      console.error("❌ Error en auth:", authError)
      return {
        success: false,
        error: `Error de autenticación: ${authError.message}`,
        details: { authError },
      }
    }

    // Test 3: Probar acceso a la base de datos
    console.log("🔍 Probando acceso a base de datos...")
    const { data, error } = await supabase.from("budgets").select("count", { count: "exact", head: true })

    if (error) {
      console.error("❌ Error en base de datos:", error)
      return {
        success: false,
        error: `Error de base de datos: ${error.message}`,
        details: { dbError: error },
      }
    }

    // Test 4: Verificar que las tablas existen
    console.log("🔍 Verificando estructura de tablas...")
    const tables = ["budgets", "clients", "hour_entries", "hour_quotes"]
    const tableTests = []

    for (const table of tables) {
      try {
        const { error: tableError } = await supabase.from(table).select("count", { count: "exact", head: true })

        tableTests.push({
          table,
          exists: !tableError,
          error: tableError?.message,
        })
      } catch (err) {
        tableTests.push({
          table,
          exists: false,
          error: "Error al verificar tabla",
        })
      }
    }

    const missingTables = tableTests.filter((t) => !t.exists)
    if (missingTables.length > 0) {
      console.warn("⚠️ Tablas faltantes:", missingTables)
      return {
        success: false,
        error: `Tablas faltantes: ${missingTables.map((t) => t.table).join(", ")}`,
        details: { tableTests, missingTables },
      }
    }

    console.log("✅ Test de conexión exitoso")
    return {
      success: true,
      message: "Conexión exitosa - Todas las verificaciones pasaron",
      details: {
        config,
        authStatus: "OK",
        dbStatus: "OK",
        tablesStatus: "OK",
        tableTests,
      },
    }
  } catch (err: any) {
    console.error("❌ Error inesperado en test de conexión:", err)
    return {
      success: false,
      error: `Error inesperado: ${err.message || "Error desconocido"}`,
      details: { unexpectedError: err },
    }
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
