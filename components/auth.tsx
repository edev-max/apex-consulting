"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

export default function Auth() {
  const { signIn, error: authError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Si hay un error de configuración de Supabase, mostrarlo
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Error de Configuración</CardTitle>
            <CardDescription>No se pudo conectar con la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm mb-4">
              <p className="font-semibold">Error:</p>
              <p>{authError}</p>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold">Pasos para solucionar:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Verifica que el archivo .env.local existe</li>
                <li>Verifica que las variables empiecen con NEXT_PUBLIC_</li>
                <li>Reinicia el servidor de desarrollo</li>
                <li>Si estás en producción, configura las variables en Vercel</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Para el sistema de administrador, convertimos el username a email
    const loginEmail = email === "admin" ? "admin@apexconsulting.com" : email

    const { error } = await signIn(loginEmail, password)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("¡Inicio de sesión exitoso!")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">APEX CONSULTING</CardTitle>
          <CardDescription>Sistema de Gestión Privado</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Usuario</Label>
              <Input
                id="signin-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Contraseña</Label>
              <Input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                message.includes("exitoso") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
