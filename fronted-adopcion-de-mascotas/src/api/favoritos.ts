import { api } from './client';

export interface FavoritoBackend {
  id_favorito: number;
  id_usuario: number;
  id_mascota: number;
  fecha: string;
}

export async function toggleFavorito(idMascota: number) {
  return await api.post<{ ok: boolean; favorito: boolean; message?: string }>(
    `/favoritos/${idMascota}`
  );
}

export async function getFavoritos() {
  return await api.get<{ ok: boolean; favoritos: FavoritoBackend[] }>('/favoritos');
}

export async function checkFavorito(idMascota: number) {
  return await api.get<{ ok: boolean; favorito: boolean }>(
    `/favoritos/check/${idMascota}`
  );
}
