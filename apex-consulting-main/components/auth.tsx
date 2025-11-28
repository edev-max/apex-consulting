"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"
import { Lock, User, AlertCircle, CheckCircle2 } from "lucide-react"

export default function Auth() {
  const { signIn, error: authError } = useAuth()
  const [email, setEmail] = useState("admin")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
        <Card className="w-full max-w-md bg-[#12121a] border-red-500/30">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-400">Error de Configuración</CardTitle>
            <CardDescription className="text-gray-400">No se pudo conectar con la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg text-sm mb-4">
              <p className="font-semibold">Error:</p>
              <p className="mt-1">{authError}</p>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              <p className="font-semibold text-gray-300">Pasos para solucionar:</p>
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-bold text-2xl">A</span>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">APEX CONSULTING</span>
          </div>
          <p className="text-gray-400">Acceso al Sistema de Gestión</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Lock className="h-7 w-7 text-blue-400" />
            </div>
            <CardTitle className="text-xl font-semibold text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-400">Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-gray-300">
                  Usuario
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="signin-email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin"
                    required
                    autoComplete="username"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-gray-300">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-200 font-medium py-5"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Iniciando sesión...
                  </div>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>

            {message && (
              <div
                className={`mt-5 p-4 rounded-lg text-sm flex items-center gap-3 ${
                  message.includes("exitoso")
                    ? "bg-green-500/10 border border-green-500/30 text-green-300"
                    : "bg-red-500/10 border border-red-500/30 text-red-300"
                }`}
              >
                {message.includes("exitoso") ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                )}
                {message}
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm font-medium">Credenciales por defecto:</p>
              <p className="text-blue-200/80 text-sm mt-2">
                Usuario: <code className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-200">admin</code>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Si es tu primera vez, usa "admin" como usuario y configura tu contraseña en Supabase.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">© 2025 APEX CONSULTING. Todos los derechos reservados.</p>
      </div>
    </div>
  )
}
