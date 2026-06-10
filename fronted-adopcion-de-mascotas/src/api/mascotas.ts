import { api } from './client';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TemperamentoBackend {
  id_temperamento: number;
  nombre: string;
}

export interface MascotaBackend {
  id_mascota: number;
  id_fundacion: number;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  tamano: 'PEQUENO' | 'MEDIANO' | 'GRANDE';
  sexo: 'MACHO' | 'HEMBRA';
  esterilizado: boolean;
  vacunado: boolean;
  temperamento: string;
  descripcion: string;
  ubicacion: string;
  condiciones_adopcion: string | null;
  estado_mascota: 'DISPONIBLE' | 'EN_PROCESO' | 'ADOPTADO';
  estado: number;
  fecha_publicacion: string;
  Temperamentos?: TemperamentoBackend[];
  Fundacion?: {
    nombre_fundacion: string;
    logo_url: string | null;
    estado_aprobacion: string;
    ciudad: string | null;
    departamento: string | null;
  };
  FotosMascota?: {
    id_foto: number;
    nombre_archivo: string;
  }[];
}

export interface MascotaFilters {
  especie?: string;
  tamano?: string;
  estado_mascota?: string;
  ubicacion?: string;
  search?: string;
  id_fundacion?: string;
  page?: number;
  limit?: number;
}

export async function getMascotas(filters: MascotaFilters = {}) {
  const params = new URLSearchParams();
  if (filters.especie) params.append('especie', filters.especie);
  if (filters.tamano) params.append('tamano', filters.tamano);
  if (filters.estado_mascota) params.append('estado_mascota', filters.estado_mascota);
  if (filters.ubicacion) params.append('ubicacion', filters.ubicacion);
  if (filters.search) params.append('search', filters.search);
  if (filters.id_fundacion) params.append('id_fundacion', filters.id_fundacion);
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  const qs = params.toString();
  return await api.get<{ ok: boolean; mascotas: MascotaBackend[]; pagination?: PaginationInfo }>(
    `/mascotas${qs ? `?${qs}` : ''}`
  );
}

export async function getMascotaById(id: number) {
  return await api.get<{ ok: boolean; mascota: MascotaBackend }>(`/mascotas/${id}`);
}

export async function createMascota(data: Record<string, unknown>) {
  return await api.post<{ ok: boolean; mascota: MascotaBackend }>('/mascotas', data);
}

export async function updateMascota(id: number, data: Record<string, unknown>) {
  return await api.put<{ ok: boolean; mascota: MascotaBackend }>(`/mascotas/${id}`, data);
}

export async function deleteMascota(id: number) {
  return await api.delete<{ ok: boolean; message: string }>(`/mascotas/${id}`);
}

export async function uploadFotosMascota(id: number, formData: FormData) {
  return await api.upload<{ ok: boolean; fotos: { id_foto: number; nombre_archivo: string }[] }>(
    `/mascotas/${id}/fotos`, formData
  );
}

export async function deleteFotoMascota(fotoId: number) {
  return await api.delete<{ ok: boolean; message: string }>(`/mascotas/fotos/${fotoId}`);
}

export function getFotoMascotaUrl(nombreArchivo: string) {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://cozy-happiness-production-77bb.up.railway.app/api';
  const base = baseUrl.replace('/api', '');
  const token = localStorage.getItem('token');
  return `${base}/uploads/${nombreArchivo}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}

export async function getTemperamentos() {
  return await api.get<{ ok: boolean; temperamentos: TemperamentoBackend[] }>('/temperamentos');
}
