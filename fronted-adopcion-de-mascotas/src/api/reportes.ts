import { api } from './client';

export interface ReportePublico {
  mascotas_disponibles: number;
  adopciones_exitosas: number;
  fundaciones_verificadas: number;
}

export interface ReporteGeneral {
  mascotas: {
    total: number;
    porEstado: { estado_mascota: string; cantidad: number }[];
  };
  solicitudes: {
    total: number;
    porEstado: { estado_solicitud: string; cantidad: number }[];
  };
  fundaciones: {
    total: number;
    porEstado: { estado_aprobacion: string; cantidad: number }[];
  };
  usuarios: {
    total: number;
    adoptantes: number;
  };
}

export interface ReporteMascotas {
  total: number;
  porEstado: { estado_mascota: string; cantidad: number }[];
  porEspecie: { especie: string; cantidad: number }[];
  porTamano: { tamano: string; cantidad: number }[];
}

export interface ReporteSolicitudes {
  total: number;
  porEstado: { estado_solicitud: string; cantidad: number }[];
  porMes: { mes: string; cantidad: number }[];
}

export interface ReporteFundaciones {
  total: number;
  porEstadoAprobacion: { estado_aprobacion: string; cantidad: number }[];
  conMascotas: { id_fundacion: number; nombre_fundacion: string; ciudad: string | null; estado_aprobacion: string; total_mascotas: number }[];
}

export interface ReporteUsuarios {
  total: number;
  porRol: { id_rol: number; cantidad: number }[];
  recientes: { id_usuario: number; nombre: string; email: string; fecha_registro: string }[];
}

export interface MiFundacion {
  mascotas: { disponibles: number; enProceso: number; adoptadas: number; total: number };
  solicitudes: { pendientes: number; enEvaluacion: number; adoptadas: number; total: number };
  citasProximas: { id: number; fecha: string; hora_inicio: string; hora_fin: string; estado: string; adoptante: string; mascota: string; id_solicitud: number }[];
  documentosPendientes: number;
  notificaciones: { noLeidas: number; total: number };
}

export async function getReportePublico() {
  return await api.get<{ ok: boolean } & ReportePublico>('/reportes/publico');
}

export async function getReporteGeneral() {
  return await api.get<{ ok: boolean } & ReporteGeneral>('/reportes/general');
}

export async function getReporteMascotas() {
  return await api.get<{ ok: boolean } & ReporteMascotas>('/reportes/mascotas');
}

export async function getReporteSolicitudes() {
  return await api.get<{ ok: boolean } & ReporteSolicitudes>('/reportes/solicitudes');
}

export async function getReporteFundaciones() {
  return await api.get<{ ok: boolean } & ReporteFundaciones>('/reportes/fundaciones');
}

export async function getReporteUsuarios() {
  return await api.get<{ ok: boolean } & ReporteUsuarios>('/reportes/usuarios');
}

export async function getMiFundacion() {
  return await api.get<{ ok: boolean } & MiFundacion>('/reportes/mi-fundacion');
}

export async function downloadExcelReporte() {
  const token = localStorage.getItem('token');
  const base = import.meta.env.VITE_API_URL || 'https://cozy-happiness-production-77bb.up.railway.app/api';
  const res = await fetch(`${base}/reportes/excel`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error al descargar' }));
    throw new Error(err.message || 'Error al descargar');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_adoptame_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
