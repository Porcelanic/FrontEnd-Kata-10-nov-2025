"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const loginSchema = Yup.object({
  usuario: Yup.string().min(3, "El usuario debe tener al menos 3 caracteres").required("El usuario es requerido"),
  contraseña: Yup.string().required("La contraseña es requerida"),
})

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      usuario: "",
      contraseña: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setError("")
      const success = await login(values.usuario, values.contraseña)

      if (success) {
        router.push("/")
      } else {
        setError("Credenciales incorrectas")
      }
    },
  })

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      {/* Left Column - Branding */}
      <div 
        className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 h-[30vh] lg:h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bdb.jpg')" }}
      >
      </div>

      {/* Right Column - Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 bg-[#FFFFFF] dark:bg-slate-800 transition-colors">
        <div className="w-full max-w-md">
          <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">
            Iniciar Sesión
          </h1>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Ingresa tu nombre de usuario
              </Label>
              <Input
                id="usuario"
                name="usuario"
                type="text"
                placeholder="usuario"
                value={formik.values.usuario}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 border-2 h-12 transition-all focus:border-[#0052CC] dark:focus:border-[#60A5FA] dark:border-slate-600 ${
                  formik.touched.usuario && formik.errors.usuario ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formik.touched.usuario && formik.errors.usuario && (
                <p className="text-sm text-red-500 dark:text-red-400">{formik.errors.usuario}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraseña" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Ingresa tu contraseña
              </Label>
              <div className="relative">
                <Input
                  id="contraseña"
                  name="contraseña"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formik.values.contraseña}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 border-2 h-12 pr-12 transition-all focus:border-[#0052CC] dark:focus:border-[#60A5FA] dark:border-slate-600 ${
                    formik.touched.contraseña && formik.errors.contraseña ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#0052CC] dark:text-slate-400 dark:hover:text-[#60A5FA] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formik.touched.contraseña && formik.errors.contraseña && (
                <p className="text-sm text-red-500 dark:text-red-400">{formik.errors.contraseña}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-lg text-white font-medium text-base transition-all hover:opacity-90"
              style={{ backgroundColor: "#0052CC" }}
              disabled={formik.isSubmitting}
            >
              <Lock className="w-5 h-5 mr-2" />
              {formik.isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-slate-800 dark:text-slate-300">{"¿No tienes cuenta? "}</span>
              <Link href="/registro" className="font-medium hover:underline text-[#0052CC] dark:text-[#60A5FA]">
                Regístrate aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
