import { api } from './client';

export interface PerfilAdoptanteBackend {
  id_perfil: number;
  id_usuario: number;
  housing_type: string | null;
  has_patio: boolean | null;
  hours_alone: string | null;
  experience: string | null;
  family_composition: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getPerfilAdoptante() {
  return await api.get<{ ok: boolean; perfil: PerfilAdoptanteBackend | null }>('/perfil-adoptante');
}

export async function updatePerfilAdoptante(data: Record<string, unknown>) {
  return await api.put<{ ok: boolean; perfil: PerfilAdoptanteBackend }>('/perfil-adoptante', data);
}
