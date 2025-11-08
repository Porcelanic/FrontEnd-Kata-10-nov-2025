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

const registerSchema = Yup.object({
  correo: Yup.string().email("Formato de email inválido").required("El correo es requerido"),
  nombre: Yup.string().required("El nombre es requerido"),
  cargo: Yup.string().required("El cargo es requerido"),
  contraseña: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .matches(/[A-Z]/, "Debe contener al menos una mayúscula")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "Debe contener al menos un símbolo")
    .required("La contraseña es requerida"),
  centro_costos: Yup.string()
    .matches(/^\d{4}$/, "Debe ser un número de exactamente 4 dígitos")
    .required("El centro de costos es requerido"),
})

export default function RegistroPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      correo: "",
      nombre: "",
      cargo: "",
      contraseña: "",
      centro_costos: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setError("")

      const success = await register({
        correo: values.correo,
        nombre: values.nombre,
        cargo: values.cargo,
        contraseña: values.contraseña,
        centro_costos: Number.parseInt(values.centro_costos),
      })

      if (success) {
        setSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError("El correo ya está registrado")
      }
    },
  })

  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div 
        className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 h-[30vh] lg:h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bdb.jpg')" }}
      >
      </div>

      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-12 overflow-y-auto bg-[#FFFFFF] dark:bg-slate-800 transition-colors">
        <div className="w-full max-w-md py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-center mb-8 text-slate-800 dark:text-slate-100">
            Registro
          </h1>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="correo" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Ingresa tu correo electrónico
              </Label>
              <Input
                id="correo"
                name="correo"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={formik.values.correo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 border-2 h-12 transition-all focus:border-[#0052CC] dark:focus:border-[#60A5FA] dark:border-slate-600 ${
                  formik.touched.correo && formik.errors.correo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formik.touched.correo && formik.errors.correo && (
                <p className="text-sm text-red-500 dark:text-red-400">{formik.errors.correo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Ingresa tu nombre completo
              </Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                placeholder="Juan Pérez"
                value={formik.values.nombre}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 border-2 h-12 transition-all focus:border-[#0052CC] dark:focus:border-[#60A5FA] dark:border-slate-600 ${
                  formik.touched.nombre && formik.errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <p className="text-sm text-red-500 dark:text-red-400">{formik.errors.nombre}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Ingresa tu cargo
              </Label>
              <Input
                id="cargo"
                name="cargo"
                type="text"
                placeholder="Desarrollador"
                value={formik.values.cargo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 border-2 h-12 transition-all focus:border-[#0052CC] dark:focus:border-[#60A5FA] dark:border-slate-600 ${
                  formik.touched.cargo && formik.errors.cargo ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formik.touched.cargo && formik.errors.cargo && (
                <p className="text-sm text-red-500 dark:text-red-400">{formik.errors.cargo}</p>
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

            <div className="space-y-2">
              <Label htmlFor="centro_costos" className="text-sm font-medium text-slate-800 dark:text-slate-100">
                Ingresa tu centro de costos
              </Label>
              <Input
                id="centro_costos"
                name="centro_costos"
                type="text"
                placeholder="1234"
                value={formik.values.centro_costos}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`rounded-lg bg-white dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 border-2 h-12 transition-all focus:border-[#0052CC] dark:focus:border-[#60A5FA] dark:border-slate-600 ${
                  formik.touched.centro_costos && formik.errors.centro_costos ? "border-red-500" : "border-gray-300"
                }`}
              />
              {formik.touched.centro_costos && formik.errors.centro_costos && (
                <p className="text-sm text-red-500 dark:text-red-400">{formik.errors.centro_costos}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">¡Registro exitoso! Redirigiendo...</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-lg text-white font-medium text-base transition-all hover:opacity-90"
              style={{ backgroundColor: "#0052CC" }}
              disabled={formik.isSubmitting}
            >
              <Lock className="w-5 h-5 mr-2" />
              {formik.isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>

            <div className="text-center text-sm pt-2">
              <span className="text-slate-800 dark:text-slate-300">{"¿Ya tienes cuenta? "}</span>
              <Link href="/login" className="font-medium hover:underline text-[#0052CC] dark:text-[#60A5FA]">
                Inicia sesión aquí
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
