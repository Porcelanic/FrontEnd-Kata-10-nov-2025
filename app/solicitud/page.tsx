"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SolicitudService } from "@/lib/api";
import type { SolicitudTipo } from "@/lib/types";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";

const validationSchema = Yup.object().shape({
  titulo: Yup.string().required("El título es requerido"),
  tipo_solicitud: Yup.string()
    .oneOf(["Despliegue", "Acceso"], "Tipo de solicitud inválido")
    .required("El tipo de solicitud es requerido"),
  descripcion: Yup.string().required("La descripción es requerida"),
  comentario_adicional: Yup.string(),
  link_pull_request: Yup.string().when("tipo_solicitud", {
    is: "Despliegue",
    then: (schema) =>
      schema
        .url("Debe ser una URL válida")
        .required("El link del Pull Request es requerido"),
    otherwise: (schema) => schema.notRequired(),
  }),
  documentacion_despliegue: Yup.string().when("tipo_solicitud", {
    is: "Despliegue",
    then: (schema) =>
      schema
        .url("Debe ser una URL válida")
        .required("La documentación de despliegue es requerida"),
    otherwise: (schema) => schema.notRequired(),
  }),
  link_tablero_jira: Yup.string().when("tipo_solicitud", {
    is: "Despliegue",
    then: (schema) =>
      schema
        .url("Debe ser una URL válida")
        .required("El link del tablero Jira es requerido"),
    otherwise: (schema) => schema.notRequired(),
  }),
  aplicacion: Yup.string().when("tipo_solicitud", {
    is: "Acceso",
    then: (schema) =>
      schema.required("El nombre de la aplicación es requerido"),
    otherwise: (schema) => schema.notRequired(),
  }),
  rol_en_aplicacion: Yup.string().when("tipo_solicitud", {
    is: "Acceso",
    then: (schema) => schema.required("El rol en la aplicación es requerido"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export default function SolicitudPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.cargo.toLowerCase() === "aprobador") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.cargo.toLowerCase() === "aprobador") {
    return null;
  }

  /**
   * Handles the creation of a new solicitud
   * Manages the API call, success/error states, and navigation
   */
  const handleCreateSolicitud = async (
    values: any,
    { setSubmitting, resetForm, setStatus }: any
  ) => {
    try {
      // Build the request payload based on solicitud type
      const payload = {
        titulo: values.titulo,
        tipo_solicitud: values.tipo_solicitud as SolicitudTipo,
        descripcion: values.descripcion,
        comentario_adicional: values.comentario_adicional || undefined,
        correo_solicitante: user.correo,
        centro_costo: user.centro_costos,
        // Add type-specific fields
        ...(values.tipo_solicitud === "Despliegue" && {
          link_pull_request: values.link_pull_request,
          documentacion_despliegue: values.documentacion_despliegue,
          link_tablero_jira: values.link_tablero_jira,
        }),
        ...(values.tipo_solicitud === "Acceso" && {
          aplicacion: values.aplicacion,
          rol_en_aplicacion: values.rol_en_aplicacion,
        }),
      };

      const result = await SolicitudService.createSolicitud(payload);

      if (result.success) {
        setStatus({ success: true });

        // Redirect to "Mis Solicitudes" after 2 seconds
        setTimeout(() => {
          resetForm();
          setStatus({ success: false });
          router.push("/mis-solicitudes");
        }, 2000);
      } else {
        setStatus({ error: result.error || "Error desconocido" });
      }
    } catch (error) {
      console.error("Error creating solicitud:", error);
      setStatus({
        error: "Error al crear la solicitud. Intente nuevamente.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">
            Nueva Solicitud
          </h1>

          <Card className="dark:bg-slate-800 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="dark:text-slate-100">
                Crear Solicitud
              </CardTitle>
              <CardDescription className="dark:text-slate-400">
                Complete el formulario para enviar una nueva solicitud
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Formik
                initialValues={{
                  titulo: "",
                  tipo_solicitud: "" as SolicitudTipo | "",
                  descripcion: "",
                  comentario_adicional: "",
                  link_pull_request: "",
                  documentacion_despliegue: "",
                  link_tablero_jira: "",
                  aplicacion: "",
                  rol_en_aplicacion: "",
                }}
                validationSchema={validationSchema}
                onSubmit={handleCreateSolicitud}
              >
                {({
                  values,
                  setFieldValue,
                  isSubmitting,
                  status,
                  errors,
                  touched,
                }) => (
                  <Form className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="titulo" className="dark:text-slate-200">
                        Título *
                      </Label>
                      <Field
                        as={Input}
                        id="titulo"
                        name="titulo"
                        placeholder="Ingrese el título de la solicitud"
                        className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                      />
                      <ErrorMessage
                        name="titulo"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="tipo_solicitud"
                        className="dark:text-slate-200"
                      >
                        Tipo de Solicitud *
                      </Label>
                      <Select
                        value={values.tipo_solicitud}
                        onValueChange={(value) => {
                          setFieldValue("tipo_solicitud", value);
                          setFieldValue("link_pull_request", "");
                          setFieldValue("documentacion_despliegue", "");
                          setFieldValue("link_tablero_jira", "");
                          setFieldValue("aplicacion", "");
                          setFieldValue("rol_en_aplicacion", "");
                        }}
                      >
                        <SelectTrigger className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600">
                          <SelectValue placeholder="Seleccione un tipo" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                          <SelectItem
                            value="Despliegue"
                            className="dark:text-slate-100 dark:focus:bg-slate-600"
                          >
                            Despliegue
                          </SelectItem>
                          <SelectItem
                            value="Acceso"
                            className="dark:text-slate-100 dark:focus:bg-slate-600"
                          >
                            Acceso
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <ErrorMessage
                        name="tipo_solicitud"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="descripcion"
                        className="dark:text-slate-200"
                      >
                        Descripción *
                      </Label>
                      <Field
                        as={Textarea}
                        id="descripcion"
                        name="descripcion"
                        placeholder="Describa su solicitud en detalle"
                        rows={6}
                        className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                      />
                      <ErrorMessage
                        name="descripcion"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="comentario_adicional"
                        className="dark:text-slate-200"
                      >
                        Comentario Adicional (opcional)
                      </Label>
                      <Field
                        as={Textarea}
                        id="comentario_adicional"
                        name="comentario_adicional"
                        placeholder="Agregue comentarios adicionales si lo desea"
                        rows={3}
                        className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                      />
                    </div>

                    {values.tipo_solicitud === "Despliegue" && (
                      <div className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="border-t dark:border-slate-600 pt-4">
                          <h3 className="text-lg font-semibold mb-4 text-[#0052CC] dark:text-[#60A5FA]">
                            Información de Despliegue
                          </h3>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="link_pull_request"
                                className="dark:text-slate-200"
                              >
                                Link Pull Request *
                              </Label>
                              <Field
                                as={Input}
                                id="link_pull_request"
                                name="link_pull_request"
                                type="url"
                                placeholder="https://github.com/..."
                                className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                              />
                              <ErrorMessage
                                name="link_pull_request"
                                component="div"
                                className="text-sm text-red-600 dark:text-red-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="documentacion_despliegue"
                                className="dark:text-slate-200"
                              >
                                Link Documentación Despliegue *
                              </Label>
                              <Field
                                as={Input}
                                id="documentacion_despliegue"
                                name="documentacion_despliegue"
                                type="url"
                                placeholder="https://confluence..."
                                className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                              />
                              <ErrorMessage
                                name="documentacion_despliegue"
                                component="div"
                                className="text-sm text-red-600 dark:text-red-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="link_tablero_jira"
                                className="dark:text-slate-200"
                              >
                                Link Tablero Jira *
                              </Label>
                              <Field
                                as={Input}
                                id="link_tablero_jira"
                                name="link_tablero_jira"
                                type="url"
                                placeholder="https://jira..."
                                className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                              />
                              <ErrorMessage
                                name="link_tablero_jira"
                                component="div"
                                className="text-sm text-red-600 dark:text-red-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {values.tipo_solicitud === "Acceso" && (
                      <div className="space-y-6 animate-in fade-in-50 duration-300">
                        <div className="border-t dark:border-slate-600 pt-4">
                          <h3 className="text-lg font-semibold mb-4 text-[#0052CC] dark:text-[#60A5FA]">
                            Información de Acceso
                          </h3>

                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="aplicacion"
                                className="dark:text-slate-200"
                              >
                                Aplicación *
                              </Label>
                              <Field
                                as={Input}
                                id="aplicacion"
                                name="aplicacion"
                                placeholder="Nombre de la aplicación"
                                className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                              />
                              <ErrorMessage
                                name="aplicacion"
                                component="div"
                                className="text-sm text-red-600 dark:text-red-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label
                                htmlFor="rol_en_aplicacion"
                                className="dark:text-slate-200"
                              >
                                Rol en Aplicación *
                              </Label>
                              <Field
                                as={Input}
                                id="rol_en_aplicacion"
                                name="rol_en_aplicacion"
                                placeholder="Rol o permiso solicitado"
                                className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
                              />
                              <ErrorMessage
                                name="rol_en_aplicacion"
                                component="div"
                                className="text-sm text-red-600 dark:text-red-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {status?.success && (
                      <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          ¡Solicitud creada exitosamente!
                        </p>
                      </div>
                    )}

                    {status?.error && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {status.error}
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full text-white"
                      style={{ backgroundColor: "#0052CC" }}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                    </Button>
                  </Form>
                )}
              </Formik>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
