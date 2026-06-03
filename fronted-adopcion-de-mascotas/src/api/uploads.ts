const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const BASE = API_BASE_URL.replace('/api', '');

export function getUploadUrl(filename: string): string {
  const token = localStorage.getItem('token');
  return `${BASE}/uploads/${filename}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
}
