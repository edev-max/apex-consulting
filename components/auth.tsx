"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { checkSupabaseConnection, testSupabaseConnection } from "@/lib/supabase"

export default function Auth() {
  const { signIn, signUp, error: authError } = useAuth()
  const [email, setEmail] = useState("admin")
  const [password, setPassword] = useState("Coromoto_09")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [connectionTest, setConnectionTest] = useState<any>(null)

  useEffect(() => {
    // Obtener información de debug
    const config = checkSupabaseConnection()
    setDebugInfo(config)

    // Probar conexión
    testSupabaseConnection().then((result) => {
      setConnectionTest(result)
    })
  }, [])

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

            {debugInfo && (
              <div className="bg-gray-100 text-gray-700 p-3 rounded-md text-xs mb-4">
                <p className="font-semibold mb-2">Información de Debug:</p>
                <p>URL configurada: {debugInfo.hasUrl ? "✅ Sí" : "❌ No"}</p>
                <p>Key configurada: {debugInfo.hasKey ? "✅ Sí" : "❌ No"}</p>
                <p>URL: {debugInfo.url}</p>
                <p>Key length: {debugInfo.keyLength}</p>
                <p>Configuración completa: {debugInfo.isConfigured ? "✅ Sí" : "❌ No"}</p>
              </div>
            )}

            {connectionTest && (
              <div
                className={`p-3 rounded-md text-xs mb-4 ${
                  connectionTest.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                <p className="font-semibold mb-2">Test de Conexión:</p>
                <p>Estado: {connectionTest.success ? "✅ Exitoso" : "❌ Fallido"}</p>
                {connectionTest.error && <p>Error: {connectionTest.error}</p>}
              </div>
            )}

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Para registro, también convertir admin a email
    const signupEmail = email === "admin" ? "admin@apexconsulting.com" : email

    const { error } = await signUp(signupEmail, password)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("¡Cuenta creada! Revisa tu email para confirmar tu cuenta.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">APEX CONSULTING</CardTitle>
          <CardDescription>Sistema de Gestión de Presupuestos</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Información de debug si hay problemas */}
          {debugInfo && !debugInfo.isConfigured && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">⚠️ Problema de Configuración</p>
              <p className="text-xs text-red-700 mt-1">
                URL: {debugInfo.hasUrl ? "✅" : "❌"} | Key: {debugInfo.hasKey ? "✅" : "❌"} | Length:{" "}
                {debugInfo.keyLength}
              </p>
            </div>
          )}

          {connectionTest && !connectionTest.success && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">❌ Error de Conexión</p>
              <p className="text-xs text-red-700 mt-1">{connectionTest.error}</p>
            </div>
          )}

          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="signup">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 font-medium">Credenciales de Administrador:</p>
                <p className="text-sm text-blue-700">
                  Usuario: <code className="bg-blue-100 px-1 rounded">admin</code>
                </p>
                <p className="text-sm text-blue-700">
                  Contraseña: <code className="bg-blue-100 px-1 rounded">Coromoto_09</code>
                </p>
              </div>

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
                    placeholder="Coromoto_09"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Para crear la cuenta de administrador, usa "admin" como usuario y "Coromoto_09"
                  como contraseña.
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Usuario</Label>
                  <Input
                    id="signup-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Contraseña</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Coromoto_09"
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {message && (
            <div
              className={`mt-4 p-3 rounded-md text-sm ${
                message.includes("exitoso") || message.includes("creada")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => {
                setEmail("admin")
                setPassword("Coromoto_09")
              }}
              className="text-sm"
            >
              Usar Credenciales de Admin
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
