import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "APEX CONSULTING | Soluciones Tecnológicas de Alto Impacto",
  description:
    "Impulsamos la transformación digital de tu empresa con soluciones innovadoras y consultoría especializada en tecnología.",
  keywords: ["consultoría", "tecnología", "software", "desarrollo", "transformación digital"],
  authors: [{ name: "APEX CONSULTING" }],
  openGraph: {
    title: "APEX CONSULTING | Soluciones Tecnológicas",
    description: "Impulsamos la transformación digital de tu empresa",
    type: "website",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
