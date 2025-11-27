"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Code2,
  Layers,
  Zap,
  Shield,
  Users,
  BarChart3,
  ChevronRight,
  ExternalLink,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Code2,
    title: "Desarrollo de Software",
    description: "Soluciones tecnológicas a medida para impulsar tu negocio hacia la transformación digital.",
  },
  {
    icon: Layers,
    title: "Arquitectura de Sistemas",
    description: "Diseño e implementación de arquitecturas escalables y robustas para empresas.",
  },
  {
    icon: Zap,
    title: "Optimización de Procesos",
    description: "Automatización y mejora de procesos empresariales para maximizar la eficiencia.",
  },
  {
    icon: Shield,
    title: "Consultoría IT",
    description: "Asesoramiento estratégico en tecnología para la toma de decisiones informadas.",
  },
]

const projects = [
  {
    title: "Sistema de Gestión Empresarial",
    category: "Enterprise Software",
    description: "Plataforma integral para la gestión de operaciones, finanzas y recursos humanos.",
    image: "/enterprise-dashboard-software-dark-theme.jpg",
  },
  {
    title: "Portal de Servicios Digitales",
    category: "Web Application",
    description: "Solución web para la digitalización de servicios gubernamentales.",
    image: "/modern-web-portal-dark-theme-government.jpg",
  },
  {
    title: "App de Logística Inteligente",
    category: "Mobile & Backend",
    description: "Sistema completo de tracking y optimización de rutas en tiempo real.",
    image: "/logistics-tracking-app-dark-theme.jpg",
  },
]

const stats = [
  { value: "150+", label: "Proyectos Completados" },
  { value: "50+", label: "Clientes Satisfechos" },
  { value: "10+", label: "Años de Experiencia" },
  { value: "99%", label: "Tasa de Satisfacción" },
]

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAccessSystem = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-semibold tracking-tight">APEX CONSULTING</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#servicios" className="text-sm text-gray-400 hover:text-white transition-colors">
                Servicios
              </a>
              <a href="#proyectos" className="text-sm text-gray-400 hover:text-white transition-colors">
                Proyectos
              </a>
              <a href="#nosotros" className="text-sm text-gray-400 hover:text-white transition-colors">
                Nosotros
              </a>
              <a href="#contacto" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contacto
              </a>
            </div>

            <Button onClick={handleAccessSystem} className="bg-white text-black hover:bg-gray-200 rounded-full px-6">
              {user ? "Ir al Dashboard" : "Acceso Interno"}
              <Lock className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-up">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-400">Transformando empresas desde 2014</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-up animation-delay-100">
            Soluciones Tecnológicas
            <br />
            <span className="gradient-text">de Alto Impacto</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 animate-fade-up animation-delay-200">
            Impulsamos la transformación digital de tu empresa con soluciones innovadoras y consultoría especializada en
            tecnología.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-300">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 rounded-full px-8 py-6 text-lg"
              onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
            >
              Iniciar Proyecto
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-lg border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Proyectos
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Ofrecemos soluciones integrales adaptadas a las necesidades específicas de cada cliente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
                  <service.icon className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                <p className="text-sm text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="proyectos" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Proyectos Destacados</h2>
              <p className="text-gray-400 max-w-xl">
                Una selección de nuestros trabajos más recientes que demuestran nuestra capacidad de entrega.
              </p>
            </div>
            <Button variant="ghost" className="text-gray-400 hover:text-white mt-4 md:mt-0">
              Ver todos los proyectos
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="text-xs text-blue-400 font-medium mb-2">{project.category}</div>
                  <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{project.description}</p>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white p-0">
                    Ver caso de estudio
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Un equipo comprometido con la excelencia</h2>
              <p className="text-gray-400 mb-6">
                En APEX CONSULTING combinamos experiencia técnica con visión estratégica para ofrecer soluciones que
                realmente transforman negocios. Nuestro equipo multidisciplinario trabaja de la mano con cada cliente
                para entender sus desafíos y diseñar la mejor ruta hacia el éxito.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Equipo Experto</div>
                    <div className="text-sm text-gray-500">Profesionales certificados</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium mb-1">Resultados Medibles</div>
                    <div className="text-sm text-gray-500">ROI garantizado</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden">
                <img src="/modern-office-team-meeting-dark-professional.jpg" alt="Equipo APEX" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-blue-600/30 rounded-2xl blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-24 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para transformar tu negocio?</h2>
          <p className="text-gray-400 mb-10">
            Contáctanos hoy y descubre cómo podemos ayudarte a alcanzar tus objetivos tecnológicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 rounded-full px-8">
              Agendar Reunión
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              info@apexconsulting.com
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">A</span>
              </div>
              <span className="font-semibold">APEX CONSULTING</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">
                Privacidad
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Términos
              </a>
              <span>© 2025 APEX CONSULTING</span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleAccessSystem} className="text-gray-500 hover:text-white">
              <Lock className="mr-2 h-4 w-4" />
              {user ? "Dashboard" : "Acceso Interno"}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
