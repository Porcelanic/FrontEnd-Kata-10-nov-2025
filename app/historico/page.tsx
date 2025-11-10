"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { SolicitudService } from "@/lib/api";
import type { Solicitud } from "@/lib/types";
import { Sidebar } from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiExternalLink, FiRefreshCw } from "react-icons/fi";

const normalizeTipoSolicitud = (tipo: string): "Acceso" | "Despliegue" => {
  const normalized = tipo.toLowerCase().trim();
  return normalized === "acceso" || normalized === "Acceso"
    ? "Acceso"
    : "Despliegue";
};

export default function HistoricoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todas");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const data = await SolicitudService.getAllResolvedSolicitudes();

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
        comentario_aprobador: s.comentario_adicional || null,
        fecha_creacion: new Date(s.fecha_solicitud || Date.now()),
        fecha_resolucion: s.fecha_solicitud
          ? new Date(s.fecha_solicitud)
          : null,
        centro_costos: s.centro_costo || 0,
        link_pull_request: s.solicitudDespliegue?.link_pull_request,
        documentacion_despliegue:
          s.solicitudDespliegue?.documentacion_despliegue,
        link_tablero_jira: s.solicitudDespliegue?.historia_jira,
        aplicacion: s.solicitudAcceso?.aplicacion,
        rol_en_aplicacion: s.solicitudAcceso?.rol_en_aplicacion,
      }));

      setSolicitudes(transformedSolicitudes);
    } catch (err) {
      console.error("Error loading historic:", err);
      setError("Error al cargar el histórico. Por favor, intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter((s) => {
    const cumpleEstado = filtroEstado === "todos" || s.estado === filtroEstado;
    const cumpleTipo =
      filtroTipo === "todas" || s.tipo_solicitud === filtroTipo;
    return cumpleEstado && cumpleTipo;
  });

  const getEstadoBadge = (estado: string) => {
    const colores = {
      aprobado: { bg: "#34D399", text: "white" },
      rechazado: { bg: "#F87171", text: "white" },
    };

    const color = colores[estado as keyof typeof colores] || {
      bg: "#FBBF24",
      text: "white",
    };

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
          <div className="flex items-center justify-between mb-8 gap-4">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Histórico de Solicitudes
            </h1>

            <div className="flex gap-3">
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

              <div className="w-48">
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-700 dark:border-slate-600">
                    <SelectItem
                      value="todos"
                      className="dark:text-slate-100 dark:focus:bg-slate-600"
                    >
                      Todos
                    </SelectItem>
                    <SelectItem
                      value="aprobado"
                      className="dark:text-slate-100 dark:focus:bg-slate-600"
                    >
                      Aprobados
                    </SelectItem>
                    <SelectItem
                      value="rechazado"
                      className="dark:text-slate-100 dark:focus:bg-slate-600"
                    >
                      Rechazados
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
                  Cargando histórico...
                </p>
              </CardContent>
            </Card>
          ) : solicitudesFiltradas.length === 0 ? (
            <Card className="dark:bg-slate-800 dark:border-slate-700">
              <CardContent className="pt-6">
                <p className="text-center text-gray-500 dark:text-slate-400">
                  No hay solicitudes en el histórico
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">Solicitante:</span>{" "}
                          {solicitud.solicitante_nombre}
                        </div>
                        {solicitud.aprobador_nombre && (
                          <div className="dark:text-slate-300">
                            <span className="font-semibold">Aprobador:</span>{" "}
                            {solicitud.aprobador_nombre}
                          </div>
                        )}
                        <div className="dark:text-slate-300">
                          <span className="font-semibold">
                            Centro de costo:
                          </span>{" "}
                          {solicitud.centro_costos}
                        </div>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
