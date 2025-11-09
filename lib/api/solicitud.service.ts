import type { SolicitudTipo } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

interface CreateSolicitudRequest {
  titulo: string;
  tipo_solicitud: SolicitudTipo;
  descripcion: string;
  comentario_adicional?: string;
  correo_solicitante: string;
  centro_costo: number;
  // Campos específicos para Despliegue
  link_pull_request?: string;
  documentacion_despliegue?: string;
  link_tablero_jira?: string;
  // Campos específicos para Acceso
  aplicacion?: string;
  rol_en_aplicacion?: string;
}

interface UpdateSolicitudRequest {
  titulo?: string;
  tipo_solicitud?: string;
  estado?: string;
  descripcion?: string;
  centro_costo?: number;
  comentario_adicional?: string;
  correo_solicitante?: string;
}

interface SolicitudResponse {
  id_solicitud: string;
  titulo: string;
  tipo_solicitud: string;
  estado: string;
  descripcion: string;
  centro_costo: number;
  fecha_solicitud: string;
  comentario_adicional?: string;
  correo_solicitante: string;
}

export class SolicitudService {
  static async createSolicitud(
    data: CreateSolicitudRequest
  ): Promise<{ success: boolean; error?: string; solicitudId?: string }> {
    try {
      const baseSolicitud = {
        titulo: data.titulo,
        tipo_solicitud: data.tipo_solicitud.toLowerCase(),
        estado: "pendiente",
        descripcion: data.descripcion,
        centro_costo: data.centro_costo,
        fecha_solicitud: new Date().toISOString(),
        comentario_adicional: data.comentario_adicional || null,
        correo_solicitante: data.correo_solicitante,
      };
      const solicitudResponse = await fetch(`${API_BASE_URL}/solicitud`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(baseSolicitud),
      });

      if (!solicitudResponse.ok) {
        const error = await solicitudResponse.json();
        return {
          success: false,
          error: error.errors?.[0] || "Error creating solicitud",
        };
      }

      const solicitudData = await solicitudResponse.json();
      const solicitudId = solicitudData.solicitud?.id_solicitud;

      if (!solicitudId) {
        return {
          success: false,
          error: "No solicitud ID returned from server",
        };
      }

      if (data.tipo_solicitud === "Acceso") {
        const accesoResponse = await this.createSolicitudAcceso(
          solicitudId,
          data.aplicacion!,
          data.rol_en_aplicacion!
        );
        if (!accesoResponse.success) {
          return accesoResponse;
        }
      } else if (data.tipo_solicitud === "Despliegue") {
        const despliegueResponse = await this.createSolicitudDespliegue(
          solicitudId,
          data.link_pull_request!,
          data.documentacion_despliegue!,
          data.link_tablero_jira!
        );
        if (!despliegueResponse.success) {
          return despliegueResponse;
        }
      }

      return { success: true, solicitudId };
    } catch (error) {
      console.error("Error in createSolicitud:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private static async createSolicitudAcceso(
    idSolicitud: string,
    aplicacion: string,
    rolEnAplicacion: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitud-acceso`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_solicitud: idSolicitud,
          aplicacion: aplicacion,
          rol_en_aplicacion: rolEnAplicacion,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error creating solicitud acceso:", error);
        return {
          success: false,
          error: error.errors?.[0] || "Error creating access request",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createSolicitudAcceso:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private static async createSolicitudDespliegue(
    idSolicitud: string,
    linkPullRequest: string,
    documentacionDespliegue: string,
    linkTableroJira: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitud-despliegue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_solicitud: idSolicitud,
          link_pull_request: linkPullRequest,
          documentacion_despliegue: documentacionDespliegue,
          historia_jira: linkTableroJira,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error creating solicitud despliegue:", error);
        return {
          success: false,
          error: error.errors?.[0] || "Error creating deployment request",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in createSolicitudDespliegue:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async getAllSolicitudes(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitud`);
      if (!response.ok) {
        console.error("Error fetching solicitudes");
        return [];
      }
      const data = await response.json();
      return data.solicitudes || [];
    } catch (error) {
      console.error("Error in getAllSolicitudes:", error);
      return [];
    }
  }

  static async getSolicitudesByEmail(email: string): Promise<any[]> {
    try {
      const allSolicitudes = await this.getAllSolicitudes();
      return allSolicitudes.filter(
        (s) => s.correo_solicitante?.toLowerCase() === email.toLowerCase()
      );
    } catch (error) {
      console.error("Error in getSolicitudesByEmail:", error);
      return [];
    }
  }

  static async getSolicitudesByCentroCosto(
    centroCosto: number
  ): Promise<any[]> {
    try {
      const allSolicitudes = await this.getAllSolicitudes();
      return allSolicitudes.filter((s) => s.centro_costo === centroCosto);
    } catch (error) {
      console.error("Error in getSolicitudesByCentroCosto:", error);
      return [];
    }
  }

  static async updateSolicitud(
    id: string,
    updates: UpdateSolicitudRequest
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitud/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.errors?.[0] || "Error updating solicitud",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in updateSolicitud:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  static async deleteSolicitud(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/solicitud/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.errors?.[0] || "Error deleting solicitud",
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error in deleteSolicitud:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Approves a solicitud (updates status to "aprobado")
   */
  static async approveSolicitud(
    id: string,
    comentarioAprobador?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateSolicitud(id, {
      estado: "aprobado",
      comentario_adicional: comentarioAprobador,
    });
  }

  /**
   * Rejects a solicitud (updates status to "rechazado")
   */
  static async rejectSolicitud(
    id: string,
    comentarioAprobador?: string
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateSolicitud(id, {
      estado: "rechazado",
      comentario_adicional: comentarioAprobador,
    });
  }

  /**
   * Gets pending solicitudes by centro de costo
   */
  static async getPendingSolicitudesByCentroCosto(
    centroCosto: number
  ): Promise<any[]> {
    try {
      const allSolicitudes = await this.getSolicitudesByCentroCosto(
        centroCosto
      );
      return allSolicitudes.filter((s) => s.estado === "pendiente");
    } catch (error) {
      console.error("Error in getPendingSolicitudesByCentroCosto:", error);
      return [];
    }
  }

  /**
   * Gets resolved solicitudes (approved or rejected) by centro de costo
   */
  static async getResolvedSolicitudesByCentroCosto(
    centroCosto: number
  ): Promise<any[]> {
    try {
      const allSolicitudes = await this.getSolicitudesByCentroCosto(
        centroCosto
      );
      return allSolicitudes.filter(
        (s) => s.estado === "aprobado" || s.estado === "rechazado"
      );
    } catch (error) {
      console.error("Error in getResolvedSolicitudesByCentroCosto:", error);
      return [];
    }
  }

  /**
   * Gets all resolved solicitudes (approved or rejected) from all centro de costos
   * Used for historic view
   */
  static async getAllResolvedSolicitudes(): Promise<any[]> {
    try {
      const allSolicitudes = await this.getAllSolicitudes();
      return allSolicitudes.filter(
        (s) => s.estado === "aprobado" || s.estado === "rechazado"
      );
    } catch (error) {
      console.error("Error in getAllResolvedSolicitudes:", error);
      return [];
    }
  }
}
