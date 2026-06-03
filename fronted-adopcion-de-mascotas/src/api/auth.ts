import { api, setToken } from './client';
import type { PerfilAdoptanteBackend } from './perfil_adoptante';

export interface LoginResponseData {
  token: string;
  refresh_token: string;
  user: {
    id_usuario: number;
    nombre: string;
    email: string;
    id_rol: number;
    foto_url: string | null;
    telefono: string | null;
    email_verified_at: string | null;
    PerfilAdoptante: PerfilAdoptanteBackend | null;
    Fundacion?: { logo_url: string | null } | null;
  };
}

interface RegisterResponse {
  ok: boolean;
  message: string;
  data: {
    id_usuario: number;
    nombre: string;
    email: string;
    foto_url: string | null;
    id_fundacion?: number;
  };
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

function setRefreshToken(token: string) {
  localStorage.setItem('refresh_token', token);
}

export function clearRefreshToken() {
  localStorage.removeItem('refresh_token');
}

export async function login(email: string, password: string) {
  const res = await api.post<{ ok: boolean; message: string; data: LoginResponseData }>('/auth/login', { email, password });
  setToken(res.data.token);
  setRefreshToken(res.data.refresh_token);
  return { ok: res.ok, user: res.data.user };
}

export async function register(nombre: string, email: string, password: string, id_rol: number) {
  const res = await api.post<RegisterResponse>('/auth/register', { nombre, email, password, id_rol });
  return { ok: res.ok, user: res.data };
}

export async function verifyEmail(token: string) {
  return await api.get<{ ok: boolean; message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export async function refreshTokenApi(refreshTokenValue: string) {
  return await api.post<{ ok: boolean; data: { token: string; refresh_token: string } }>('/auth/refresh', { refresh_token: refreshTokenValue });
}

export async function resendVerification(email: string) {
  return await api.post<{ ok: boolean; message: string }>('/auth/resend-verification', { email });
}

export async function logoutApi(refreshTokenValue: string) {
  return await api.post<{ ok: boolean; message: string }>('/auth/logout', { refresh_token: refreshTokenValue });
}

export async function getRoles() {
  return await api.get<{ ok: boolean; roles: { id_rol: number; nombre_rol: string }[] }>('/roles');
}

export async function forgotPassword(email: string) {
  return await api.post<{ ok: boolean; message: string }>('/auth/forgot-password', { email });
}

export async function resetPassword(token: string, newPassword: string) {
  return await api.post<{ ok: boolean; message: string }>('/auth/reset-password', { token, newPassword });
}
