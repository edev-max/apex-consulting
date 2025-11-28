"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { useSupabaseData } from "@/hooks/useSupabaseData"
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
  Sparkles,
  Globe,
  Rocket,
  CheckCircle2,
  Star,
  ArrowUpRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

// Hook para detectar cuando un elemento está visible en el viewport
function useInView(options = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true)
      }
    }, { threshold: 0.1, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return { ref, isInView }
}

// Hook para efecto parallax del mouse
function useMouseParallax() {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setPosition({ x, y })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return position
}

const services = [
  {
    icon: Code2,
    title: "Desarrollo de Software",
    description: "Soluciones tecnológicas a medida para impulsar tu negocio hacia la transformación digital.",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "from-blue-600/20 to-cyan-600/20",
  },
  {
    icon: Layers,
    title: "Arquitectura de Sistemas",
    description: "Diseño e implementación de arquitecturas escalables y robustas para empresas.",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-600/20 to-pink-600/20",
  },
  {
    icon: Zap,
    title: "Optimización de Procesos",
    description: "Automatización y mejora de procesos empresariales para maximizar la eficiencia.",
    gradient: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-600/20 to-orange-600/20",
  },
  {
    icon: Shield,
    title: "Consultoría IT",
    description: "Asesoramiento estratégico en tecnología para la toma de decisiones informadas.",
    gradient: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-600/20 to-teal-600/20",
  },
]

const projects = [
  {
    title: "Sistema de Gestión Empresarial",
    category: "Enterprise Software",
    description: "Plataforma integral para la gestión de operaciones, finanzas y recursos humanos.",
    image: "/enterprise-dashboard-software-dark-theme.jpg",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    title: "Portal de Servicios Digitales",
    category: "Web Application",
    description: "Solución web para la digitalización de servicios gubernamentales.",
    image: "/modern-web-portal-dark-theme-government.jpg",
    tags: ["Next.js", "TypeScript", "AWS"],
  },
  {
    title: "App de Logística Inteligente",
    category: "Mobile & Backend",
    description: "Sistema completo de tracking y optimización de rutas en tiempo real.",
    image: "/logistics-tracking-app-dark-theme.jpg",
    tags: ["React Native", "Python", "ML"],
  },
]

const stats = [
  { value: "150+", label: "Proyectos Completados", icon: Rocket },
  { value: "50+", label: "Clientes Satisfechos", icon: Users },
  { value: "10+", label: "Años de Experiencia", icon: Star },
  { value: "99%", label: "Tasa de Satisfacción", icon: CheckCircle2 },
]

const testimonials = [
  {
    quote: "Transformaron completamente nuestra operación digital. Resultados excepcionales.",
    author: "Carlos Mendoza",
    role: "CEO, TechCorp",
    rating: 5,
  },
  {
    quote: "Profesionalismo y calidad en cada entrega. Altamente recomendados.",
    author: "María García",
    role: "CTO, InnovateLab",
    rating: 5,
  },
]

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { companySettings } = useSupabaseData()
  const [isScrolled, setIsScrolled] = useState(false)
  const mousePosition = useMouseParallax()

  // Hooks para animaciones de scroll
  const statsSection = useInView()
  const servicesSection = useInView()
  const projectsSection = useInView()
  const aboutSection = useInView()
  const contactSection = useInView()
  const testimonialsSection = useInView()

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

  // Obtener nombre de empresa y logo del sistema
  const companyName = companySettings?.company_name || "APEX CONSULTING"
  const companyLogoUrl = companySettings?.company_logo_url

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse"
          style={{ 
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` 
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-pulse"
          style={{ 
            transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px)`,
            animationDelay: "1s"
          }}
        />
        <div 
          className="absolute top-3/4 left-1/2 w-[400px] h-[400px] bg-cyan-600/8 rounded-full blur-[120px]"
          style={{ 
            transform: `translate(${mousePosition.x * 1}px, ${mousePosition.y * 1}px)` 
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/20" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-pointer">
              {companyLogoUrl ? (
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg">
                  <img 
                    src={companyLogoUrl} 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-11 h-11 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg shadow-white/10">
                  <span className="text-black font-bold text-xl">A</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {companyName}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Technology Solutions</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {[
                { href: "#servicios", label: "Servicios" },
                { href: "#proyectos", label: "Proyectos" },
                { href: "#nosotros", label: "Nosotros" },
                { href: "#contacto", label: "Contacto" },
              ].map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-all duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-3/4 transition-all duration-300" />
                </a>
              ))}
            </div>

            <Button 
              onClick={handleAccessSystem} 
              className="bg-white text-black hover:bg-gray-100 rounded-full px-6 font-medium shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-105 transition-all duration-300"
            >
              {user ? "Ir al Dashboard" : "Acceso Interno"}
              <Lock className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />
        
        {/* Main gradient orb */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-r from-blue-600/20 via-purple-600/15 to-cyan-600/20 rounded-full blur-[120px] animate-glow"
          style={{ 
            transform: `translate(calc(-50% + ${mousePosition.x * 3}px), calc(-50% + ${mousePosition.y * 3}px))` 
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10 backdrop-blur-sm mb-10 animate-fade-up hover:border-white/20 transition-colors group cursor-default">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            </div>
            <span className="text-sm text-gray-300 font-medium">Transformando empresas desde 2014</span>
            <Sparkles className="h-4 w-4 text-yellow-500 group-hover:rotate-12 transition-transform" />
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 animate-fade-up animation-delay-100">
            <span className="block mb-2">Soluciones</span>
            <span className="block relative">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                Tecnológicas
              </span>
            </span>
            <span className="block mt-2 text-4xl md:text-5xl lg:text-6xl text-gray-400 font-normal">de Alto Impacto</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 animate-fade-up animation-delay-200 leading-relaxed">
            Impulsamos la <span className="text-white font-medium">transformación digital</span> de tu empresa con 
            soluciones <span className="text-blue-400">innovadoras</span> y consultoría 
            <span className="text-purple-400"> especializada</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up animation-delay-300">
            <Button
              size="lg"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full px-10 py-7 text-lg font-medium shadow-2xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 transition-all duration-300 border-0"
              onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
            >
              Iniciar Proyecto
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group rounded-full px-10 py-7 text-lg border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 transition-all duration-300"
              onClick={() => document.getElementById("proyectos")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Proyectos
              <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 animate-fade-up animation-delay-400">
            <div className="flex items-center gap-2 text-gray-500">
              <Globe className="h-4 w-4" />
              <span className="text-sm">+15 países</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2 text-gray-500">
              <Shield className="h-4 w-4" />
              <span className="text-sm">ISO 27001</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2 text-gray-500">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Soporte 24/7</span>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 animate-bounce">
            <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-gradient-to-b from-white to-transparent rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsSection.ref}
        className="py-24 border-y border-white/5 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center group transition-all duration-700 ${
                  statsSection.isInView 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                  <div className="relative p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:border-white/20 group-hover:scale-110 transition-all duration-300">
                    <stat.icon className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section 
        id="servicios" 
        ref={servicesSection.ref}
        className="py-32 overflow-hidden relative"
      >
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[150px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div 
            className={`text-center mb-20 transition-all duration-700 ${
              servicesSection.isInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-medium">Lo que hacemos</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Nuestros <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Servicios</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Ofrecemos soluciones integrales adaptadas a las necesidades específicas de cada cliente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br ${service.bgGradient} border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 ${
                  servicesSection.isInView 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500`} />
                
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <service.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{service.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{service.description}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 group-hover:text-white transition-colors">
                    <span>Saber más</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section 
        id="proyectos" 
        ref={projectsSection.ref}
        className="py-32 bg-gradient-to-b from-white/[0.02] to-transparent overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div 
            className={`flex flex-col md:flex-row md:items-end md:justify-between mb-16 transition-all duration-700 ${
              projectsSection.isInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 mb-6">
                <Rocket className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-400 font-medium">Portfolio</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                Proyectos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Destacados</span>
              </h2>
              <p className="text-gray-400 max-w-xl text-lg">
                Una selección de nuestros trabajos más recientes que demuestran nuestra capacidad de entrega.
              </p>
            </div>
            <Button variant="ghost" className="text-gray-400 hover:text-white mt-6 md:mt-0 group">
              Ver todos los proyectos
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div
                key={index}
                className={`group relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 ${
                  projectsSection.isInView 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-20'
                }`}
                style={{ transitionDelay: `${index * 150 + 200}ms` }}
              >
                {/* Image container with overlay */}
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60" />
                  
                  {/* Floating tags */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {project.tags?.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-3 py-1 text-xs font-medium bg-black/50 backdrop-blur-sm rounded-full border border-white/10 text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="text-xs text-purple-400 font-semibold mb-2 uppercase tracking-wider">{project.category}</div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{project.description}</p>
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white p-0 group/btn">
                    Ver caso de estudio
                    <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </Button>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section 
        id="nosotros" 
        ref={aboutSection.ref}
        className="py-32 overflow-hidden relative"
      >
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-l from-blue-600/10 to-transparent rounded-full blur-[150px]" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div 
              className={`transition-all duration-1000 ${
                aboutSection.isInView 
                  ? 'opacity-100 translate-x-0' 
                  : 'opacity-0 -translate-x-20'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/10 border border-emerald-500/20 mb-6">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-medium">Sobre nosotros</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Un equipo comprometido con la{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  excelencia
                </span>
              </h2>
              <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                En <span className="text-white font-semibold">{companyName}</span> combinamos experiencia técnica con visión estratégica para ofrecer soluciones que
                realmente transforman negocios. Nuestro equipo multidisciplinario trabaja de la mano con cada cliente
                para entender sus desafíos y diseñar la mejor ruta hacia el éxito.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div 
                  className={`group p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 hover:border-white/20 transition-all duration-500 ${
                    aboutSection.isInView 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: '300ms' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-lg mb-1">Equipo Experto</div>
                  <div className="text-sm text-gray-500">Profesionales certificados</div>
                </div>
                <div 
                  className={`group p-6 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 border border-white/10 hover:border-white/20 transition-all duration-500 ${
                    aboutSection.isInView 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{ transitionDelay: '450ms' }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="font-bold text-lg mb-1">Resultados Medibles</div>
                  <div className="text-sm text-gray-500">ROI garantizado</div>
                </div>
              </div>
            </div>
            
            <div 
              className={`relative transition-all duration-1000 ${
                aboutSection.isInView 
                  ? 'opacity-100 translate-x-0 scale-100' 
                  : 'opacity-0 translate-x-20 scale-95'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              {/* Decorative elements */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-3xl blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 rounded-3xl blur-2xl animate-pulse" />
              
              <div className="relative aspect-square rounded-3xl overflow-hidden group border border-white/10">
                <img 
                  src="/modern-office-team-meeting-dark-professional.jpg" 
                  alt="Equipo" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/80 via-transparent to-transparent" />
                
                {/* Floating card */}
                <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="font-bold">+25 Expertos</div>
                      <div className="text-sm text-gray-400">En nuestro equipo</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsSection.ref}
        className="py-24 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div 
            className={`text-center mb-16 transition-all duration-700 ${
              testimonialsSection.isInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-600/10 border border-amber-500/20 mb-6">
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-sm text-amber-400 font-medium">Testimonios</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`p-8 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-white/20 transition-all duration-500 ${
                  testimonialsSection.isInView 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xl mb-6 leading-relaxed text-gray-300">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section 
        id="contacto" 
        ref={contactSection.ref}
        className="py-32 relative overflow-hidden"
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-full blur-[150px]" />
        
        <div 
          className={`max-w-4xl mx-auto px-6 text-center relative transition-all duration-1000 ${
            contactSection.isInView 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-16 scale-95'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-8">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Contáctanos</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            ¿Listo para{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              transformar
            </span>{" "}
            tu negocio?
          </h2>
          <p className="text-gray-400 mb-12 text-lg max-w-2xl mx-auto">
            Contáctanos hoy y descubre cómo podemos ayudarte a alcanzar tus objetivos tecnológicos con soluciones a medida.
          </p>
          
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ${
              contactSection.isInView 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <Button 
              size="lg" 
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full px-10 py-7 text-lg font-medium shadow-2xl shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 transition-all duration-300 border-0"
            >
              Agendar Reunión
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-10 py-7 text-lg border-white/20 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm hover:scale-105 transition-all duration-300"
            >
              info@apexconsulting.com
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-16 pt-16 border-t border-white/5">
            <p className="text-sm text-gray-500 mb-6">Confían en nosotros</p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
              {["TechCorp", "InnovateLab", "DataFlow", "CloudSync", "NextGen"].map((company, i) => (
                <span key={i} className="text-lg font-bold text-gray-600">{company}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-[#050508]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand column */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                {companyLogoUrl ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <img 
                      src={companyLogoUrl} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-200 rounded-xl flex items-center justify-center">
                    <span className="text-black font-bold text-lg">A</span>
                  </div>
                )}
                <span className="text-xl font-bold">{companyName}</span>
              </div>
              <p className="text-gray-500 max-w-sm mb-6">
                Transformando empresas a través de soluciones tecnológicas innovadoras desde 2014.
              </p>
              <div className="flex gap-4">
                {["LinkedIn", "Twitter", "GitHub"].map((social, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all"
                  >
                    <span className="text-xs font-medium">{social.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Links columns */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Servicios</h4>
              <ul className="space-y-3 text-gray-500">
                {services.map((service, i) => (
                  <li key={i}>
                    <a href="#servicios" className="hover:text-white transition-colors">{service.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Empresa</h4>
              <ul className="space-y-3 text-gray-500">
                <li><a href="#nosotros" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#proyectos" className="hover:text-white transition-colors">Proyectos</a></li>
                <li><a href="#contacto" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <span>© 2025 {companyName}</span>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAccessSystem} 
              className="text-gray-500 hover:text-white group"
            >
              <Lock className="mr-2 h-4 w-4" />
              {user ? "Dashboard" : "Acceso Interno"}
              <ArrowRight className="ml-2 h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
