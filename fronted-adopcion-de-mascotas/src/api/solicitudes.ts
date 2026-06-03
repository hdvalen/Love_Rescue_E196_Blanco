import { api } from './client';
import type { PaginationInfo } from './mascotas';

export interface SolicitudBackend {
  id_solicitud: number;
  id_usuario: number;
  id_mascota: number;
  id_fundacion: number;
  fecha_solicitud: string;
  estado_solicitud: 'PENDIENTE' | 'EN_EVALUACION' | 'APROBADA' | 'RECHAZADA' | 'EN_SEGUIMIENTO' | 'ADOPTADA' | 'CANCELADA';
  motivo: string;
  respuesta: string | null;
  datos_adoptante: string | null;
  estado: number;
  User?: {
    id_usuario: number;
    nombre: string;
    email: string;
    telefono: string;
    foto_url: string | null;
    PerfilAdoptante?: {
      housing_type: string | null;
      has_patio: boolean | null;
      hours_alone: string | null;
      experience: string | null;
      family_composition: string | null;
    };
  };
  Mascota?: { id_mascota: number; nombre: string; especie: string; raza: string };
  Fundacion?: { id_fundacion: number; nombre_fundacion: string; ciudad: string };
}

export async function getSolicitudes(filters: { estado_solicitud?: string; id_fundacion?: string; search?: string; fecha?: string; fecha_desde?: string; fecha_hasta?: string; page?: number; limit?: number } = {}) {
  const params = new URLSearchParams();
  if (filters.estado_solicitud) params.append('estado_solicitud', filters.estado_solicitud);
  if (filters.id_fundacion) params.append('id_fundacion', filters.id_fundacion);
  if (filters.search) params.append('search', filters.search);
  if (filters.fecha) params.append('fecha', filters.fecha);
  if (filters.fecha_desde) params.append('fecha_desde', filters.fecha_desde);
  if (filters.fecha_hasta) params.append('fecha_hasta', filters.fecha_hasta);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));
  const qs = params.toString();
  return await api.get<{ ok: boolean; solicitudes: SolicitudBackend[]; pagination?: PaginationInfo }>(
    `/solicitudes${qs ? `?${qs}` : ''}`
  );
}

export async function getSolicitudById(id: number) {
  return await api.get<{ ok: boolean; solicitud: SolicitudBackend }>(`/solicitudes/${id}`);
}

export async function createSolicitud(id_mascota: number, motivo: string, datosAdoptante?: Record<string, string>) {
  return await api.post<{ ok: boolean; solicitud: SolicitudBackend }>('/solicitudes', {
    id_mascota,
    motivo,
    datos_adoptante: datosAdoptante,
  });
}

export async function ponerEnEvaluacion(id: number) {
  return await api.put<{ ok: boolean; solicitud: SolicitudBackend }>(`/solicitudes/${id}/en-evaluacion`);
}

export async function aprobarSolicitud(id: number, respuesta?: string, cambiarEstadoMascota?: boolean) {
  return await api.put<{ ok: boolean; solicitud: SolicitudBackend }>(`/solicitudes/${id}/aprobar`, {
    respuesta,
    cambiar_estado_mascota: cambiarEstadoMascota,
  });
}

export async function rechazarSolicitud(id: number, respuesta?: string) {
  return await api.put<{ ok: boolean; solicitud: SolicitudBackend }>(`/solicitudes/${id}/rechazar`, {
    respuesta,
  });
}

export async function ponerEnSeguimiento(id: number) {
  return await api.put<{ ok: boolean; solicitud: SolicitudBackend }>(`/solicitudes/${id}/en-seguimiento`);
}

export async function finalizarSolicitud(id: number) {
  return await api.put<{ ok: boolean; solicitud: { id_solicitud: number; estado_solicitud: string }; mascota: { id_mascota: number; estado_mascota: string } }>(`/solicitudes/${id}/finalizar`);
}

export async function cancelarSolicitud(id: number, motivo?: string) {
  return await api.put<{ ok: boolean; solicitud: SolicitudBackend }>(`/solicitudes/${id}/cancelar`, { motivo });
}

export interface HistorialEntry {
  id_historial: number;
  id_solicitud: number;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_responsable: number | null;
  fecha: string;
  motivo: string | null;
  Responsable?: { nombre: string };
}

export async function getHistorial(id: number) {
  return await api.get<{ ok: boolean; historial: HistorialEntry[] }>(`/solicitudes/${id}/historial`);
}

// ---- Detalle endpoints ----
export interface NotaBackend {
  id_nota: number; id_solicitud: number; texto: string;
  visibilidad: string; fecha: string; autor: string; estado: number;
}
export interface TareaBackend {
  id_tarea: number; id_solicitud: number; texto: string;
  completada: number; estado: number;
}
export interface CitaBackend {
  id_cita: number; id_solicitud: number; fecha: string;
  hora_inicio: string; hora_fin: string; modalidad: string;
  estado: string; motivo_rechazo: string | null;
  creado_por: number; estado_registro: number;
}
export interface DocumentoBackend {
  id_doc: number; id_solicitud: number; nombre: string;
  tipo: string; nombre_archivo: string | null; tamano: number | null;
  estado_revision: string; comentario_rechazo: string | null;
  fecha_subida: string; estado: number;
}
export interface EvaluacionBackend {
  id_evaluacion: number; id_solicitud: number;
  entrevista: number; visita: number; documentos_verificados: number;
  contrato_aceptado: number; contrato_fecha: string | null; contrato_ip: string | null;
  estado: number;
}

export async function getSolicitudDetalle(id: number) {
  return await api.get<{
    ok: boolean; notas: NotaBackend[]; tareas: TareaBackend[];
    citas: CitaBackend[]; documentos: DocumentoBackend[];
    evaluacion: EvaluacionBackend | null;
  }>(`/solicitudes/${id}/detalle`);
}

export async function addNotaSolicitud(id: number, data: { texto: string; visibilidad?: string; autor?: string }) {
  return await api.post<{ ok: boolean; nota: NotaBackend }>(`/solicitudes/${id}/notas`, data);
}

export async function addTareaSolicitud(id: number, texto: string) {
  return await api.post<{ ok: boolean; tarea: TareaBackend }>(`/solicitudes/${id}/tareas`, { texto });
}

export async function toggleTareaSolicitud(id: number, idTarea: number) {
  return await api.put<{ ok: boolean; tarea: TareaBackend }>(`/solicitudes/${id}/tareas/${idTarea}/toggle`);
}

export async function scheduleCitaSolicitud(id: number, data: { fecha: string; hora_inicio: string; hora_fin: string; modalidad: string }) {
  return await api.post<{ ok: boolean; cita: CitaBackend }>(`/solicitudes/${id}/citas`, data);
}

export async function responderCitaSolicitud(id: number, idCita: number, estado: string, motivo_rechazo?: string) {
  return await api.put<{ ok: boolean; cita: CitaBackend }>(`/solicitudes/${id}/citas/${idCita}/responder`, { estado, motivo_rechazo });
}

export async function updateCitaSolicitud(id: number, idCita: number, data: { fecha: string; hora_inicio: string; hora_fin: string }) {
  return await api.put<{ ok: boolean; cita: CitaBackend }>(`/solicitudes/${id}/citas/${idCita}`, data);
}

export async function addDocumentoSolicitud(id: number, formData: FormData) {
  return await api.upload<{ ok: boolean; documentos: DocumentoBackend[] }>(`/solicitudes/${id}/documentos`, formData);
}

export async function revisarDocumentoSolicitud(id: number, idDoc: number, estado: string, comentario_rechazo?: string) {
  return await api.put<{ ok: boolean; documento: DocumentoBackend }>(`/solicitudes/${id}/documentos/${idDoc}/revisar`, { estado, comentario_rechazo });
}

export async function updateChecklistSolicitud(id: number, data: { entrevista?: boolean; visita?: boolean; documentos_verificados?: boolean }) {
  return await api.put<{ ok: boolean; evaluacion: EvaluacionBackend }>(`/solicitudes/${id}/checklist`, data);
}

export async function acceptContractSolicitud(id: number) {
  return await api.put<{ ok: boolean; evaluacion: EvaluacionBackend }>(`/solicitudes/${id}/contrato`);
}
