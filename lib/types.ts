export interface User {
  id: string
  correo: string
  nombre: string
  cargo: string
  centro_costos: number
}

export type SolicitudTipo = "Despliegue" | "Accesos"
export type SolicitudEstado = "pendiente" | "aprobado" | "rechazado"

export interface Solicitud {
  id: string
  titulo: string
  tipo_solicitud: SolicitudTipo
  descripcion: string
  comentario_adicional: string | null
  solicitante_id: string
  solicitante_nombre?: string
  aprobador_id: string | null
  aprobador_nombre?: string
  estado: SolicitudEstado
  comentario_aprobador: string | null
  fecha_creacion: Date
  fecha_resolucion: Date | null
  centro_costos: number
  // Campos específicos para Despliegue
  link_pull_request?: string
  documentacion_despliegue?: string
  link_tablero_jira?: string
  // Campos específicos para Accesos
  aplicacion?: string
  rol_en_aplicacion?: string
}
