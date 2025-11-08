import type { Solicitud } from "./types"

export function getMockSolicitudes(): Solicitud[] {
  const storedSolicitudes = localStorage.getItem("solicitudes")
  if (storedSolicitudes) {
    return JSON.parse(storedSolicitudes).map((s: any) => ({
      ...s,
      fecha_creacion: new Date(s.fecha_creacion),
      fecha_resolucion: s.fecha_resolucion ? new Date(s.fecha_resolucion) : null,
    }))
  }
  return []
}

export function saveSolicitud(solicitud: Solicitud) {
  const solicitudes = getMockSolicitudes()
  solicitudes.push(solicitud)
  localStorage.setItem("solicitudes", JSON.stringify(solicitudes))
}

export function updateSolicitud(id: string, updates: Partial<Solicitud>) {
  const solicitudes = getMockSolicitudes()
  const index = solicitudes.findIndex((s) => s.id === id)
  if (index !== -1) {
    solicitudes[index] = { ...solicitudes[index], ...updates }
    localStorage.setItem("solicitudes", JSON.stringify(solicitudes))
  }
}
