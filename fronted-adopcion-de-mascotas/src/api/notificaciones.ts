import { api } from './client';
import type { PaginationInfo } from './mascotas';

export interface NotificacionBackend {
  id_notificacion: number;
  id_usuario: number;
  id_solicitud: number | null;
  titulo: string;
  mensaje: string;
  tipo: string;
  leido: boolean;
  fecha_creacion: string;
  fecha_leido: string | null;
  accion_url: string | null;
  remitente_id: number | null;
}

export async function getNotificaciones(filters: { leido?: string; tipo?: string; page?: number; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.leido) params.append('leido', filters.leido);
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const qs = params.toString();
  return await api.get<{ ok: boolean; notificaciones: NotificacionBackend[]; pagination?: PaginationInfo }>(
    `/notificaciones${qs ? `?${qs}` : ''}`
  );
}

export async function marcarLeida(id: number) {
  return await api.put<{ ok: boolean; notificacion: NotificacionBackend }>(`/notificaciones/${id}/leer`);
}

export async function marcarTodasLeidas() {
  return await api.put<{ ok: boolean; message: string }>('/notificaciones/leer-todas');
}
