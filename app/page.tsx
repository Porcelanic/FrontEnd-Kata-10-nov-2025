"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  FiCheckCircle,
  FiClock,
  FiShield,
  FiUsers,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (user.cargo.toLowerCase() === "aprobador") {
        router.push("/aprobacion");
      } else {
        router.push("/solicitud");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#003DA5" }}
        ></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#003DA5" }}
              >
                <FiCheckCircle className="text-white" size={24} />
              </div>
              <span className="text-xl font-bold text-foreground">
                Sistema de Aprobaciones
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#inicio"
                className="text-foreground hover:text-[#003DA5] transition-colors"
              >
                Inicio
              </a>
              <a
                href="#caracteristicas"
                className="text-foreground hover:text-[#003DA5] transition-colors"
              >
                Características
              </a>
              <a
                href="#como-funciona"
                className="text-foreground hover:text-[#003DA5] transition-colors"
              >
                Cómo Funciona
              </a>
              <a
                href="#contacto"
                className="text-foreground hover:text-[#003DA5] transition-colors"
              >
                Contacto
              </a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/login"
                className="px-4 py-2 border-2 rounded-lg transition-colors hover:bg-muted"
                style={{ borderColor: "#003DA5", color: "#003DA5" }}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                className="px-4 py-2 rounded-lg text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: "#003DA5" }}
              >
                Registrarse
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-foreground hover:bg-muted"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <a
                href="#inicio"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
              >
                Inicio
              </a>
              <a
                href="#caracteristicas"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
              >
                Características
              </a>
              <a
                href="#como-funciona"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
              >
                Cómo Funciona
              </a>
              <a
                href="#contacto"
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg"
              >
                Contacto
              </a>
              <div className="pt-4 space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-center border-2 rounded-lg"
                  style={{ borderColor: "#003DA5", color: "#003DA5" }}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="block px-4 py-2 text-center rounded-lg text-white"
                  style={{ backgroundColor: "#003DA5" }}
                >
                  Registrarse
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight text-balance">
                Gestiona tus{" "}
                <span style={{ color: "#003DA5" }}>Aprobaciones</span> de Forma
                Eficiente
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                Sistema corporativo diseñado para optimizar el flujo de
                aprobaciones de despliegues y accesos. Rápido, seguro y fácil de
                usar.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/registro"
                  className="px-8 py-4 rounded-lg text-white text-lg font-semibold transition-all hover:scale-105 shadow-lg"
                  style={{ backgroundColor: "#003DA5" }}
                >
                  Comenzar Ahora
                </Link>
                <a
                  href="#como-funciona"
                  className="px-8 py-4 rounded-lg text-lg font-semibold border-2 transition-all hover:bg-muted"
                  style={{ borderColor: "#003DA5", color: "#003DA5" }}
                >
                  Ver Cómo Funciona
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src="/corporate-approval-workflow-dashboard.jpg"
                alt="Dashboard Preview"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="caracteristicas"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Características Principales
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar aprobaciones de forma
              profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-xl bg-card hover:shadow-lg transition-shadow">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "#003DA5" }}
              >
                <FiCheckCircle className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Aprobación Rápida</h3>
              <p className="text-muted-foreground">
                Revisa y aprueba solicitudes en segundos con una interfaz
                intuitiva.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card hover:shadow-lg transition-shadow">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "#0052CC" }}
              >
                <FiClock className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Historial Completo</h3>
              <p className="text-muted-foreground">
                Accede al historial completo de todas las solicitudes y
                decisiones.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card hover:shadow-lg transition-shadow">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "#003DA5" }}
              >
                <FiShield className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Seguro y Confiable</h3>
              <p className="text-muted-foreground">
                Sistema diseñado con los más altos estándares de seguridad.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card hover:shadow-lg transition-shadow">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: "#0052CC" }}
              >
                <FiUsers className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gestión de Roles</h3>
              <p className="text-muted-foreground">
                Control de acceso basado en roles: solicitantes y aprobadores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Cómo Funciona</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Proceso simple y eficiente en tres pasos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
                style={{ backgroundColor: "#003DA5" }}
              >
                1
              </div>
              <h3 className="text-2xl font-semibold mb-4">Crea tu Solicitud</h3>
              <p className="text-muted-foreground leading-relaxed">
                Completa el formulario con los detalles de tu solicitud de
                despliegue o acceso. Incluye links y documentación necesaria.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
                style={{ backgroundColor: "#0052CC" }}
              >
                2
              </div>
              <h3 className="text-2xl font-semibold mb-4">
                Revisión y Aprobación
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Los aprobadores reciben notificación y pueden revisar tu
                solicitud. Pueden aprobar o rechazar con comentarios.
              </p>
            </div>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
                style={{ backgroundColor: "#003DA5" }}
              >
                3
              </div>
              <h3 className="text-2xl font-semibold mb-4">Seguimiento</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitorea el estado de tus solicitudes en tiempo real. Accede al
                historial completo cuando lo necesites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Únete hoy y comienza a gestionar tus aprobaciones de forma eficiente
          </p>
          <Link
            href="/registro"
            className="inline-block px-8 py-4 rounded-lg text-white text-lg font-semibold transition-all hover:scale-105 shadow-lg"
            style={{ backgroundColor: "#003DA5" }}
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Description */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#003DA5" }}
                >
                  <FiCheckCircle className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold">
                  Sistema de Aprobaciones
                </span>
              </div>
              <p className="text-muted-foreground mb-4">
                Plataforma corporativa para la gestión eficiente de flujos de
                aprobación de despliegues y accesos.
              </p>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#003DA5] transition-colors"
                >
                  <FiGithub size={20} />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#003DA5] transition-colors"
                >
                  <FiLinkedin size={20} />
                </a>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-[#003DA5] transition-colors"
                >
                  <FiTwitter size={20} />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Enlaces Útiles</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-[#003DA5] transition-colors"
                  >
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-[#003DA5] transition-colors"
                  >
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-[#003DA5] transition-colors"
                  >
                    Soporte
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <div className="space-y-2">
                <a
                  href="mailto:soporte@aprobaciones.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-[#003DA5] transition-colors"
                >
                  <FiMail size={16} />
                  soporte@aprobaciones.com
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border text-center text-muted-foreground">
            <p>
              © 2025 Sistema de Aprobaciones. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
