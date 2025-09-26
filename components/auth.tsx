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
import { CheckCircleIcon, XCircleIcon, RefreshCwIcon, WifiIcon } from "lucide-react"

export default function Auth() {
  const { signIn, signUp, error: authError } = useAuth()
  const [email, setEmail] = useState("admin")
  const [password, setPassword] = useState("Coromoto_09")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [connectionTest, setConnectionTest] = useState<any>(null)
  const [testingConnection, setTestingConnection] = useState(false)

  useEffect(() => {
    // Obtener información de debug
    const config = checkSupabaseConnection()
    setDebugInfo(config)

    // Probar conexión automáticamente al cargar
    runConnectionTest()
  }, [])

  const runConnectionTest = async () => {
    setTestingConnection(true)
    try {
      const result = await testSupabaseConnection()
      setConnectionTest(result)
    } catch (error) {
      setConnectionTest({ success: false, error: "Error inesperado al probar conexión" })
    } finally {
      setTestingConnection(false)
    }
  }

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

            <Button
              onClick={runConnectionTest}
              disabled={testingConnection}
              className="w-full mb-4 bg-transparent"
              variant="outline"
            >
              {testingConnection ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Probando Conexión...
                </>
              ) : (
                <>
                  <WifiIcon className="h-4 w-4 mr-2" />
                  Probar Conexión a Supabase
                </>
              )}
            </Button>

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
          {/* Panel de Estado de Conexión */}
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-gray-700">Estado de Conexión</h3>
              <Button
                onClick={runConnectionTest}
                disabled={testingConnection}
                size="sm"
                variant="outline"
                className="h-8 bg-transparent"
              >
                {testingConnection ? (
                  <RefreshCwIcon className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCwIcon className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Información de configuración */}
            {debugInfo && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span>URL Configurada:</span>
                  <span className="flex items-center">
                    {debugInfo.hasUrl ? (
                      <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <XCircleIcon className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    {debugInfo.hasUrl ? "Sí" : "No"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span>API Key Configurada:</span>
                  <span className="flex items-center">
                    {debugInfo.hasKey ? (
                      <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
                    ) : (
                      <XCircleIcon className="h-3 w-3 text-red-500 mr-1" />
                    )}
                    {debugInfo.hasKey ? `Sí (${debugInfo.keyLength} chars)` : "No"}
                  </span>
                </div>
              </div>
            )}

            {/* Resultado del test de conexión */}
            {connectionTest && (
              <div
                className={`p-3 rounded-md text-sm ${
                  connectionTest.success
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : "bg-red-100 text-red-800 border border-red-200"
                }`}
              >
                <div className="flex items-center mb-1">
                  {connectionTest.success ? (
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircleIcon className="h-4 w-4 mr-2" />
                  )}
                  <span className="font-semibold">
                    {connectionTest.success ? "Conexión Exitosa" : "Error de Conexión"}
                  </span>
                </div>
                {connectionTest.error && <p className="text-xs mt-1">Error: {connectionTest.error}</p>}
                {connectionTest.success && <p className="text-xs mt-1">✅ Supabase está funcionando correctamente</p>}
              </div>
            )}

            {testingConnection && (
              <div className="flex items-center justify-center p-3 text-sm text-gray-600">
                <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                Probando conexión con Supabase...
              </div>
            )}
          </div>

          {/* Información de debug si hay problemas */}
          {debugInfo && !debugInfo.isConfigured && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800 font-medium">⚠️ Problema de Configuración</p>
              <p className="text-xs text-red-700 mt-1">Revisa tu archivo .env.local y reinicia el servidor</p>
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (connectionTest && !connectionTest.success)}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                {connectionTest && !connectionTest.success && (
                  <p className="text-xs text-red-600 text-center">⚠️ Primero resuelve los problemas de conexión</p>
                )}
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (connectionTest && !connectionTest.success)}
                >
                  {loading ? "Creando cuenta..." : "Crear Cuenta"}
                </Button>
                {connectionTest && !connectionTest.success && (
                  <p className="text-xs text-red-600 text-center">⚠️ Primero resuelve los problemas de conexión</p>
                )}
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

          <div className="mt-6 text-center space-y-2">
            <Button
              variant="outline"
              onClick={() => {
                setEmail("admin")
                setPassword("Coromoto_09")
              }}
              className="text-sm w-full"
            >
              Usar Credenciales de Admin
            </Button>

            <Button onClick={runConnectionTest} disabled={testingConnection} variant="ghost" className="text-sm w-full">
              {testingConnection ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Probando Conexión...
                </>
              ) : (
                <>
                  <WifiIcon className="h-4 w-4 mr-2" />
                  Probar Conexión Manual
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
