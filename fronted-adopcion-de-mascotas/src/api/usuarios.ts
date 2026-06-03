import { api } from './client';
import type { PerfilAdoptanteBackend } from './perfil_adoptante';

export interface UsuarioBackend {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono: string | null;
  foto_url: string | null;
  fecha_registro: string;
  estado: number;
  id_rol: number;
  PerfilAdoptante?: PerfilAdoptanteBackend | null;
  Fundacion?: { logo_url: string | null } | null;
}

export async function getPerfil() {
  return await api.get<{ ok: boolean; user: UsuarioBackend }>('/usuarios/perfil');
}

export async function getUsuarios() {
  return await api.get<{ ok: boolean; users: UsuarioBackend[] }>('/usuarios');
}

export async function getUsuarioById(id: number) {
  return await api.get<{ ok: boolean; user: UsuarioBackend }>(`/usuarios/${id}`);
}

export async function uploadFotoUsuario(formData: FormData) {
  return await api.upload<{ ok: boolean; message: string; user: UsuarioBackend }>('/usuarios/foto', formData);
}

export async function updateUsuario(id: number, data: Record<string, unknown>) {
  return await api.put<{ ok: boolean; user: UsuarioBackend }>(`/usuarios/${id}`, data);
}

export async function changePassword(id: number, currentPassword: string, newPassword: string) {
  return await api.put<{ ok: boolean; message: string }>(`/usuarios/${id}/password`, {
    currentPassword,
    newPassword,
  });
}
