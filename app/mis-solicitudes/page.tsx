"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SolicitudService } from "@/lib/api";
import type { Solicitud, SolicitudTipo } from "@/lib/types";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiExternalLink, FiRefreshCw, FiEdit2, FiTrash2 } from "react-icons/fi";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const getEditValidationSchema = (tipoSolicitud: string) => {
  return Yup.object().shape({
    titulo: Yup.string().required("El título es requerido"),
    descripcion: Yup.string().required("La descripción es requerida"),
    link_pull_request: Yup.string().when([], {
      is: () => tipoSolicitud === "Despliegue",
      then: (schema) =>
        schema
          .url("Debe ser una URL válida")
          .required("El link del Pull Request es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    documentacion_despliegue: Yup.string().when([], {
      is: () => tipoSolicitud === "Despliegue",
      then: (schema) =>
        schema
          .url("Debe ser una URL válida")
          .required("La documentación de despliegue es requerida"),
      otherwise: (schema) => schema.notRequired(),
    }),
    link_tablero_jira: Yup.string().when([], {
      is: () => tipoSolicitud === "Despliegue",
      then: (schema) =>
        schema
          .url("Debe ser una URL válida")
          .required("El link del tablero Jira es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    aplicacion: Yup.string().when([], {
      is: () => tipoSolicitud === "Acceso",
      then: (schema) =>
        schema.required("El nombre de la aplicación es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
    rol_en_aplicacion: Yup.string().when([], {
      is: () => tipoSolicitud === "Acceso",
      then: (schema) => schema.required("El rol en la aplicación es requerido"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
};

const normalizeTipoSolicitud = (tipo: string): "Acceso" | "Despliegue" => {
  const normalized = tipo.toLowerCase().trim();
  return normalized === "acceso" || normalized === "Acceso"
    ? "Acceso"
    : "Despliegue";
};

export default function MisSolicitudesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(
    null
  );
  const [editError, setEditError] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    titulo: "",
    descripcion: "",
    link_pull_request: "",
    documentacion_despliegue: "",
    link_tablero_jira: "",
    aplicacion: "",
    rol_en_aplicacion: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    loadSolicitudes();
  }, [user, router]);

  const loadSolicitudes = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await SolicitudService.getSolicitudesByEmail(user.correo);

      const transformedSolicitudes: Solicitud[] = data.map((s: any) => ({
        id: s.id_solicitud || "",
        titulo: s.titulo || "",
        tipo_solicitud: normalizeTipoSolicitud(s.tipo_solicitud || ""),
        descripcion: s.descripcion || "",
        comentario_adicional: s.comentario_adicional || null,
        solicitante_id: s.correo_solicitante || "",
        solicitante_nombre: user.nombre,
        aprobador_id: null,
        aprobador_nombre: undefined,
        estado: s.estado || "pendiente",
        comentario_aprobador: null,
        fecha_creacion: new Date(s.fecha_solicitud || Date.now()),
        fecha_resolucion: null,
        centro_costos: s.centro_costo || user.centro_costos,
        link_pull_request: s.solicitudDespliegue?.link_pull_request,
        documentacion_despliegue:
          s.solicitudDespliegue?.documentacion_despliegue,
        link_tablero_jira: s.solicitudDespliegue?.historia_jira,
        aplicacion: s.solicitudAcceso?.aplicacion,
        rol_en_aplicacion: s.solicitudAcceso?.rol_en_aplicacion,
      }));

      setSolicitudes(transformedSolicitudes);
    } catch (err) {
      console.error("Error loading solicitudes:", err);
      setError(
        "Error al cargar las solicitudes. Por favor, intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const solicitudesFiltradas =
    filtroTipo === "todas"
      ? solicitudes
      : solicitudes.filter((s) => s.tipo_solicitud === filtroTipo);

  const handleEdit = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setEditForm({
      titulo: solicitud.titulo,
      descripcion: solicitud.descripcion,
      link_pull_request: solicitud.link_pull_request || "",
      documentacion_despliegue: solicitud.documentacion_despliegue || "",
      link_tablero_jira: solicitud.link_tablero_jira || "",
      aplicacion: solicitud.aplicacion || "",
      rol_en_aplicacion: solicitud.rol_en_aplicacion || "",
    });
    setEditError(null);
    setShowEditDialog(true);
  };

  const handleDelete = async (solicitudId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) {
      return;
    }

    try {
      const result = await SolicitudService.deleteSolicitud(solicitudId);

      if (result.success) {
        await loadSolicitudes();
      } else {
        setError(result.error || "Error al eliminar la solicitud");
      }
    } catch (err) {
      console.error("Error deleting solicitud:", err);
      setError("Error al eliminar la solicitud. Intente nuevamente.");
    }
  };

  const getEstadoBadge = (estado: string) => {
    const colores = {
      pendiente: { bg: "#FBBF24", text: "white" },
      aprobado: { bg: "#34D399", text: "white" },
      rechazado: { bg: "#F87171", text: "white" },
    };

    const color = colores[estado as keyof typeof colores] || colores.pendiente;

    return (
      <Badge style={{ backgroundColor: color.bg, color: color.text }}>
        {estado.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Mis Solicitudes
            </h1>

            <div className="flex items-center gap-4">
              <Button
                onClick={loadSolicitudes}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
              >
                <FiRefreshCw
                  className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualizar
              </Button>

              <div className="w-48">
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                    <SelectItem
                      value="todas"
                      className="dark:text-slate-100 dark:focus:bg-slate-600"
                    >
                      Todas
                    </SelectItem>
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
              </div>
            </div>
          </div>

          {isLoading ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2"
                    style={{ borderColor: "#003DA5" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : solicitudesFiltradas.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 dark:text-slate-400">
                  No tienes solicitudes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {solicitudesFiltradas.map((solicitud) => (
                <Card
                  key={solicitud.id}
                  className="dark:bg-slate-800 dark:border-slate-700"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg dark:text-slate-100">
                          {solicitud.titulo}
                        </CardTitle>
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <Badge
                            style={{
                              backgroundColor: "#0052CC",
                              color: "white",
                            }}
                          >
                            {solicitud.tipo_solicitud}
                          </Badge>
                          {getEstadoBadge(solicitud.estado)}
                          <Badge
                            variant="outline"
                            className="dark:border-slate-600 dark:text-slate-300"
                          >
                            ID: {solicitud.id}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {solicitud.aprobador_nombre && (
                          <div className="dark:text-slate-300">
                            <span className="font-semibold">Aprobador:</span>{" "}
                            {solicitud.aprobador_nombre}
                          </div>
                        )}
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">
                            Fecha de creación:
                          </span>{" "}
                          {new Date(
                            solicitud.fecha_creacion
                          ).toLocaleDateString()}
                        </div>
                        {solicitud.fecha_resolucion && (
                          <div className="dark:text-slate-300">
                            <span className="font-semibold">
                              Fecha de resolución:
                            </span>{" "}
                            {new Date(
                              solicitud.fecha_resolucion
                            ).toLocaleDateString()}
                          </div>
                        )}
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">
                            Centro de costo:
                          </span>{" "}
                          {solicitud.centro_costos}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold block mb-1 dark:text-slate-200">
                          Descripción:
                        </span>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          {solicitud.descripcion}
                        </p>
                      </div>

                      {solicitud.comentario_adicional && (
                        <div>
                          <span className="font-semibold block mb-1 dark:text-slate-200">
                            Comentario adicional:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            {solicitud.comentario_adicional}
                          </p>
                        </div>
                      )}

                      {solicitud.tipo_solicitud === "Despliegue" && (
                        <div className="border-t dark:border-slate-600 pt-3 space-y-2">
                          <h4 className="font-semibold text-sm text-[#0052CC] dark:text-[#60A5FA]">
                            Información de Despliegue
                          </h4>
                          {solicitud.link_pull_request && (
                            <div>
                              <span className="font-semibold block mb-1 text-sm dark:text-slate-200">
                                Link Pull Request:
                              </span>
                              <a
                                href={solicitud.link_pull_request}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm flex items-center gap-1 hover:underline text-[#0052CC] dark:text-[#60A5FA]"
                              >
                                {solicitud.link_pull_request}
                                <FiExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {solicitud.documentacion_despliegue && (
                            <div>
                              <span className="font-semibold block mb-1 text-sm dark:text-slate-200">
                                Link Documentación Despliegue:
                              </span>
                              <a
                                href={solicitud.documentacion_despliegue}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm flex items-center gap-1 hover:underline text-[#0052CC] dark:text-[#60A5FA]"
                              >
                                {solicitud.documentacion_despliegue}
                                <FiExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          {solicitud.link_tablero_jira && (
                            <div>
                              <span className="font-semibold block mb-1 text-sm dark:text-slate-200">
                                Link Tablero Jira:
                              </span>
                              <a
                                href={solicitud.link_tablero_jira}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm flex items-center gap-1 hover:underline text-[#0052CC] dark:text-[#60A5FA]"
                              >
                                {solicitud.link_tablero_jira}
                                <FiExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {solicitud.tipo_solicitud === "Acceso" && (
                        <div className="border-t dark:border-slate-600 pt-3 space-y-2">
                          <h4 className="font-semibold text-sm text-[#0052CC] dark:text-[#60A5FA]">
                            Información de Acceso
                          </h4>
                          {solicitud.aplicacion && (
                            <div>
                              <span className="font-semibold text-sm dark:text-slate-200">
                                Aplicación:
                              </span>{" "}
                              <span className="text-sm text-gray-600 dark:text-slate-400">
                                {solicitud.aplicacion}
                              </span>
                            </div>
                          )}
                          {solicitud.rol_en_aplicacion && (
                            <div>
                              <span className="font-semibold text-sm dark:text-slate-200">
                                Rol solicitado:
                              </span>{" "}
                              <span className="text-sm text-gray-600 dark:text-slate-400">
                                {solicitud.rol_en_aplicacion}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {solicitud.comentario_aprobador && (
                        <div className="p-3 rounded-md bg-gray-50 dark:bg-slate-700 border dark:border-slate-600">
                          <span className="font-semibold block mb-1 dark:text-slate-200">
                            Comentario del aprobador:
                          </span>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            {solicitud.comentario_aprobador}
                          </p>
                        </div>
                      )}

                      {solicitud.estado === "pendiente" && (
                        <div className="flex gap-2 pt-2 border-t dark:border-slate-600">
                          <Button
                            onClick={() => handleEdit(solicitud)}
                            variant="outline"
                            size="sm"
                            className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                          >
                            <FiEdit2 className="w-4 h-4 mr-2" />
                            Editar
                          </Button>
                          <Button
                            onClick={() => handleDelete(solicitud.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <FiTrash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Dialog de Edición */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="dark:bg-slate-800 dark:border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">
              Editar Solicitud
            </DialogTitle>
          </DialogHeader>

          {selectedSolicitud && (
            <Formik
              initialValues={editForm}
              validationSchema={getEditValidationSchema(
                selectedSolicitud.tipo_solicitud
              )}
              enableReinitialize
              onSubmit={async (values, { setSubmitting }) => {
                setEditError(null);

                try {
                  const updates: any = {
                    titulo: values.titulo,
                    descripcion: values.descripcion,
                  };

                  const baseResult = await SolicitudService.updateSolicitud(
                    selectedSolicitud.id,
                    updates
                  );

                  if (!baseResult.success) {
                    setEditError(
                      baseResult.error || "Error al actualizar la solicitud"
                    );
                    setSubmitting(false);
                    return;
                  }

                  if (selectedSolicitud.tipo_solicitud === "Acceso") {
                    const accesoResult =
                      await SolicitudService.updateSolicitudAcceso(
                        selectedSolicitud.id,
                        values.aplicacion,
                        values.rol_en_aplicacion
                      );

                    if (!accesoResult.success) {
                      setEditError(
                        accesoResult.error ||
                          "Error al actualizar información de acceso"
                      );
                      setSubmitting(false);
                      return;
                    }
                  } else if (
                    selectedSolicitud.tipo_solicitud === "Despliegue"
                  ) {
                    const despliegueResult =
                      await SolicitudService.updateSolicitudDespliegue(
                        selectedSolicitud.id,
                        values.link_pull_request,
                        values.documentacion_despliegue,
                        values.link_tablero_jira
                      );

                    if (!despliegueResult.success) {
                      setEditError(
                        despliegueResult.error ||
                          "Error al actualizar información de despliegue"
                      );
                      setSubmitting(false);
                      return;
                    }
                  }

                  setShowEditDialog(false);
                  setSelectedSolicitud(null);
                  await loadSolicitudes();
                } catch (err) {
                  console.error("Error updating solicitud:", err);
                  setEditError(
                    "Error al actualizar la solicitud. Intente nuevamente."
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({
                values,
                errors,
                touched,
                isSubmitting,
                handleChange,
                handleBlur,
              }) => (
                <Form>
                  <div className="space-y-4">
                    {/* Título */}
                    <div className="space-y-2">
                      <Label htmlFor="titulo" className="dark:text-slate-200">
                        Título *
                      </Label>
                      <Field
                        as={Input}
                        id="titulo"
                        name="titulo"
                        className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                      />
                      <ErrorMessage
                        name="titulo"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-400"
                      />
                    </div>

                    {/* Descripción */}
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
                        rows={4}
                        className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                      />
                      <ErrorMessage
                        name="descripcion"
                        component="div"
                        className="text-sm text-red-600 dark:text-red-400"
                      />
                    </div>

                    {/* Campos de Despliegue */}
                    {selectedSolicitud.tipo_solicitud === "Despliegue" && (
                      <div className="space-y-4 border-t dark:border-slate-600 pt-4">
                        <h3 className="font-semibold text-[#0052CC] dark:text-[#60A5FA]">
                          Información de Despliegue
                        </h3>

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
                            className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
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
                            Link Documentación *
                          </Label>
                          <Field
                            as={Input}
                            id="documentacion_despliegue"
                            name="documentacion_despliegue"
                            type="url"
                            className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
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
                            className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                          />
                          <ErrorMessage
                            name="link_tablero_jira"
                            component="div"
                            className="text-sm text-red-600 dark:text-red-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Campos de Acceso */}
                    {selectedSolicitud.tipo_solicitud === "Acceso" && (
                      <div className="space-y-4 border-t dark:border-slate-600 pt-4">
                        <h3 className="font-semibold text-[#0052CC] dark:text-[#60A5FA]">
                          Información de Acceso
                        </h3>

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
                            className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
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
                            className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                          />
                          <ErrorMessage
                            name="rol_en_aplicacion"
                            component="div"
                            className="text-sm text-red-600 dark:text-red-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Error general */}
                    {editError && (
                      <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {editError}
                        </p>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEditDialog(false)}
                      disabled={isSubmitting}
                      className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="text-white"
                      style={{ backgroundColor: "#0052CC" }}
                    >
                      {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </DialogFooter>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
