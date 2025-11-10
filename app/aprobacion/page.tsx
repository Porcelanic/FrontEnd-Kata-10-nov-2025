"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SolicitudService } from "@/lib/api";
import type { Solicitud } from "@/lib/types";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FiCheck, FiX, FiExternalLink, FiRefreshCw } from "react-icons/fi";

const normalizeTipoSolicitud = (tipo: string): "Acceso" | "Despliegue" => {
  const normalized = tipo.toLowerCase().trim();
  return normalized === "acceso" || normalized === "Acceso"
    ? "Acceso"
    : "Despliegue";
};

export default function AprobacionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(
    null
  );
  const [comentario, setComentario] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [accion, setAccion] = useState<"aprobar" | "rechazar" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || user.cargo.toLowerCase() !== "aprobador") {
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
      const data = await SolicitudService.getPendingSolicitudesByCentroCosto(
        user.centro_costos
      );

      const transformedSolicitudes: Solicitud[] = data.map((s: any) => ({
        id: s.id_solicitud || "",
        titulo: s.titulo || "",
        tipo_solicitud: normalizeTipoSolicitud(s.tipo_solicitud || ""),
        descripcion: s.descripcion || "",
        comentario_adicional: s.comentario_adicional || null,
        solicitante_id: s.correo_solicitante || "",
        solicitante_nombre: s.correo_solicitante || "Desconocido",
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

  const handleAccion = (solicitud: Solicitud, tipo: "aprobar" | "rechazar") => {
    setSelectedSolicitud(solicitud);
    setAccion(tipo);
    setShowDialog(true);
  };

  const confirmarAccion = async () => {
    if (!selectedSolicitud || !accion || !user) return;

    setIsSubmitting(true);

    try {
      const result =
        accion === "aprobar"
          ? await SolicitudService.approveSolicitud(
              selectedSolicitud.id,
              comentario || undefined
            )
          : await SolicitudService.rejectSolicitud(
              selectedSolicitud.id,
              comentario || undefined
            );

      if (result.success) {
        setShowDialog(false);
        setComentario("");
        setSelectedSolicitud(null);
        setAccion(null);
        await loadSolicitudes();
      } else {
        setError(
          result.error || "Error al procesar la solicitud. Intente nuevamente."
        );
      }
    } catch (err) {
      console.error("Error confirming action:", err);
      setError("Error al procesar la solicitud. Intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Solicitudes Pendientes
            </h1>

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
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {isLoading ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 dark:text-slate-400">
                  Cargando solicitudes...
                </p>
              </CardContent>
            </Card>
          ) : solicitudes.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 dark:text-slate-400">
                  No hay solicitudes pendientes
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {solicitudes.map((solicitud) => (
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
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">Solicitante:</span>{" "}
                          {solicitud.solicitante_nombre}
                        </div>
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">
                            Centro de costo:
                          </span>{" "}
                          {solicitud.centro_costos}
                        </div>
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">Fecha:</span>{" "}
                          {new Date(
                            solicitud.fecha_creacion
                          ).toLocaleDateString()}
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

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleAccion(solicitud, "aprobar")}
                          className="text-white bg-[#34D399] hover:bg-[#34D399]/90"
                        >
                          <FiCheck className="mr-2" />
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleAccion(solicitud, "rechazar")}
                          className="bg-[#F87171] hover:bg-[#F87171]/90 text-white"
                        >
                          <FiX className="mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">
              {accion === "aprobar" ? "Aprobar" : "Rechazar"} Solicitud
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {selectedSolicitud?.titulo}
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium dark:text-slate-200">
                Comentario (opcional)
              </label>
              <Textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Agregue un comentario..."
                rows={4}
                className="dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:border-slate-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              disabled={isSubmitting}
              className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarAccion}
              disabled={isSubmitting}
              className="text-white"
              style={{
                backgroundColor: accion === "aprobar" ? "#34D399" : "#F87171",
              }}
            >
              {isSubmitting ? "Procesando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
