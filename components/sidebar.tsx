"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  FiFileText,
  FiCheckSquare,
  FiClock,
  FiLogOut,
  FiMenu,
  FiX,
  FiPlusCircle,
} from "react-icons/fi";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAprobador = user?.cargo.toLowerCase() === "aprobador";

  const normalUserLinks = [
    { href: "/solicitud", label: "Nueva Solicitud", icon: FiPlusCircle },
    { href: "/mis-solicitudes", label: "Mis Solicitudes", icon: FiFileText },
    { href: "/historico", label: "Histórico", icon: FiClock },
  ];

  const aprobadorLinks = [
    {
      href: "/aprobacion",
      label: "Solicitudes Pendientes",
      icon: FiCheckSquare,
    },
    { href: "/mis-resoluciones", label: "Mis Resoluciones", icon: FiFileText },
    { href: "/historico", label: "Histórico", icon: FiClock },
  ];

  const links = isAprobador ? aprobadorLinks : normalUserLinks;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md text-white"
        style={{ backgroundColor: "#003DA5" }}
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{ backgroundColor: "#003DA5" }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-white">
                Sistema de Aprobaciones
              </h1>
              <ThemeToggle />
            </div>
            <p className="text-sm text-white/80 mt-2">{user?.nombre}</p>
            <p className="text-xs text-white/60">{user?.cargo.toLowerCase()}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={20} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors w-full"
            >
              <FiLogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
