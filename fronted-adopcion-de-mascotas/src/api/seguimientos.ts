import { api } from './client';

export interface SeguimientoBackend {
  id_seguimiento: number;
  id_solicitud: number;
  id_usuario: number;
  tipo: string;
  tipo_visita: string | null;
  descripcion: string;
  fecha_seguimiento: string;
  estado_seguimiento: string;
  proximo_contacto: string | null;
  observaciones: string | null;
  estado: number;
  User?: { id_usuario: number; nombre: string; email: string };
  Solicitud?: { id_solicitud: number; estado_solicitud: string; fecha_solicitud: string };
}

export async function getSeguimientos(filters: { id_solicitud?: string; estado_seguimiento?: string } = {}) {
  const params = new URLSearchParams();
  if (filters.id_solicitud) params.append('id_solicitud', filters.id_solicitud);
  if (filters.estado_seguimiento) params.append('estado_seguimiento', filters.estado_seguimiento);
  const qs = params.toString();
  return await api.get<{ ok: boolean; seguimientos: SeguimientoBackend[] }>(
    `/seguimientos${qs ? `?${qs}` : ''}`
  );
}

export async function getSeguimientoById(id: number) {
  return await api.get<{ ok: boolean; seguimiento: SeguimientoBackend }>(`/seguimientos/${id}`);
}

export async function createSeguimiento(data: {
  id_solicitud: number;
  tipo: string;
  descripcion: string;
  proximo_contacto?: string;
  tipo_visita?: string;
}) {
  return await api.post<{ ok: boolean; seguimiento: SeguimientoBackend }>('/seguimientos', data);
}

export async function updateSeguimiento(id: number, data: Partial<{
  tipo: string;
  descripcion: string;
  proximo_contacto: string;
  tipo_visita: string;
  estado_seguimiento: string;
}>) {
  return await api.put<{ ok: boolean; seguimiento: SeguimientoBackend }>(`/seguimientos/${id}`, data);
}

export async function completeSeguimiento(id: number, observaciones?: string) {
  return await api.put<{ ok: boolean; seguimiento: SeguimientoBackend }>(`/seguimientos/${id}/completar`, { observaciones });
}
