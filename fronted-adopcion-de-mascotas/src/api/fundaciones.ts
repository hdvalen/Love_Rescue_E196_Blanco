import { api } from './client';

export interface FundacionBackend {
  id_fundacion: number;
  id_usuario: number;
  nombre_fundacion: string;
  nit: string;
  telefono: string;
  ciudad: string;
  direccion: string;
  descripcion: string;
  redes_sociales?: string;
  mision?: string;
  logo_url?: string;
  departamento?: string;
  motivo_rechazo?: string;
  email?: string;
  estado_aprobacion: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  estado: number;
  fecha_registro: string;
}

export async function getFundaciones() {
  return await api.get<{ ok: boolean; fundaciones: FundacionBackend[] }>('/fundaciones');
}

export async function getFundacionById(id: number, soloPublico?: boolean) {
  const qs = soloPublico ? '?publico=true' : '';
  return await api.get<{ ok: boolean; fundacion: FundacionBackend }>(`/fundaciones/${id}${qs}`);
}

export async function createFundacion(data: Record<string, unknown>) {
  return await api.post<{ ok: boolean; fundacion: FundacionBackend }>('/fundaciones', data);
}

export async function updateFundacion(id: number, data: Record<string, unknown>) {
  return await api.put<{ ok: boolean; fundacion: FundacionBackend }>(`/fundaciones/${id}`, data);
}

export async function aprobarFundacion(id: number, motivo_rechazo?: string) {
  return await api.put<{ ok: boolean; fundacion: FundacionBackend }>(
    `/fundaciones/${id}/aprobar`,
    motivo_rechazo ? { motivo_rechazo } : undefined
  );
}

export async function uploadLogoFundacion(id: number, formData: FormData) {
  return await api.upload<{ ok: boolean; fundacion: FundacionBackend }>(
    `/fundaciones/${id}/logo`,
    formData
  );
}
