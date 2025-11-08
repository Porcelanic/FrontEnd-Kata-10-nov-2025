"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getMockSolicitudes, updateSolicitud } from "@/lib/mock-data";
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
import { FiCheck, FiX, FiExternalLink } from "react-icons/fi";

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

  useEffect(() => {
    if (!user || user.cargo.toLowerCase() !== "aprobador") {
      router.push("/");
      return;
    }
    loadSolicitudes();
  }, [user, router]);

  const loadSolicitudes = () => {
    const todasSolicitudes = getMockSolicitudes();
    const pendientes = todasSolicitudes.filter(
      (s) => s.estado === "pendiente" && s.centro_costos === user?.centro_costos
    );
    setSolicitudes(pendientes);
  };

  const handleAccion = (solicitud: Solicitud, tipo: "aprobar" | "rechazar") => {
    setSelectedSolicitud(solicitud);
    setAccion(tipo);
    setShowDialog(true);
  };

  const confirmarAccion = () => {
    if (!selectedSolicitud || !accion || !user) return;

    updateSolicitud(selectedSolicitud.id, {
      estado: accion === "aprobar" ? "aprobado" : "rechazado",
      aprobador_id: user.id,
      aprobador_nombre: user.nombre,
      comentario_aprobador: comentario || null,
      fecha_resolucion: new Date(),
    });

    setShowDialog(false);
    setComentario("");
    setSelectedSolicitud(null);
    setAccion(null);
    loadSolicitudes();
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] dark:bg-slate-900 transition-colors">
      <Sidebar />

      <main className="flex-1 lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-slate-800 dark:text-slate-100">
            Solicitudes Pendientes
          </h1>

          {solicitudes.length === 0 ? (
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

                      {solicitud.tipo_solicitud === "Accesos" && (
                        <div className="border-t dark:border-slate-600 pt-3 space-y-2">
                          <h4 className="font-semibold text-sm text-[#0052CC] dark:text-[#60A5FA]">
                            Información de Accesos
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
              className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-600"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarAccion}
              className="text-white"
              style={{
                backgroundColor: accion === "aprobar" ? "#34D399" : "#F87171",
              }}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
