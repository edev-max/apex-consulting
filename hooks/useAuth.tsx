"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  updateEmail: (newEmail: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let supabase
    try {
      supabase = createClient()
      console.log("[v0] Supabase client created successfully")
    } catch (err) {
      console.error("[v0] Failed to create Supabase client:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize Supabase client")
      setLoading(false)
      return
    }

    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("[v0] Error getting session:", error)
          setError(`Error de conexión: ${error.message}`)
        } else {
          console.log("[v0] Session retrieved:", session ? "Active session" : "No session")
          setSession(session)
          setUser(session?.user ?? null)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Supabase connection error:", err)
        setError("No se pudo conectar con Supabase")
        setLoading(false)
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("[v0] Auth state changed:", _event, session ? "Has session" : "No session")
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      console.log("[v0] Attempting sign in for:", email)
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("[v0] Sign in error:", error)
      } else {
        console.log("[v0] Sign in successful")
      }

      return { error }
    } catch (err) {
      console.error("[v0] Sign in exception:", err)
      return { error: { message: "Error de conexión con Supabase" } }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (err) {
      return { error: { message: "Error de conexión con Supabase" } }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setError(null)
    } catch (err) {
      console.error("Error signing out:", err)
      setError("Error al cerrar sesión")
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      return { error }
    } catch (err) {
      return { error: { message: "Error actualizando contraseña" } }
    }
  }

  const updateEmail = async (newEmail: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      })
      return { error }
    } catch (err) {
      return { error: { message: "Error actualizando email" } }
    }
  }

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updatePassword,
    updateEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
