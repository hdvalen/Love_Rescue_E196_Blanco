const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  formData?: FormData;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

function setTokens(token: string, refreshToken: string) {
  localStorage.setItem('token', token);
  localStorage.setItem('refresh_token', refreshToken);
}

function clearTokens() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
}

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

async function attemptRefresh(): Promise<string> {
  const rt = getRefreshToken();
  if (!rt) throw new Error('No refresh token');

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  });

  const data = await res.json();
  if (!res.ok || !data.ok) throw new Error(data.message || 'Refresh failed');

  setTokens(data.data.token, data.data.refresh_token);
  return data.data.token;
}

async function request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (!options.formData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body && !options.formData) {
    config.body = JSON.stringify(options.body);
  }

  if (options.formData) {
    config.body = options.formData;
  }

  let res = await fetch(`${API_URL}${endpoint}`, config);
  let data = await res.json();

  if (res.status === 401 && getRefreshToken()) {
    if (endpoint === '/auth/refresh') {
      clearTokens();
      throw new Error('Sesión expirada');
    }

    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await attemptRefresh();
        isRefreshing = false;
        refreshQueue.forEach(q => q.resolve(newToken));
        refreshQueue = [];

        headers['Authorization'] = `Bearer ${newToken}`;
        config.headers = headers;
        res = await fetch(`${API_URL}${endpoint}`, config);
        data = await res.json();
      } catch (e) {
        isRefreshing = false;
        refreshQueue.forEach(q => q.reject(e));
        refreshQueue = [];
        clearTokens();
        throw e;
      }
    } else {
      const newToken = await new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      headers['Authorization'] = `Bearer ${newToken}`;
      config.headers = headers;
      res = await fetch(`${API_URL}${endpoint}`, config);
      data = await res.json();
    }
  }

  if (!res.ok) {
    throw new Error(data.message || 'Error en la petición');
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'POST', body }),
  put: <T>(endpoint: string, body?: unknown) => request<T>(endpoint, { method: 'PUT', body }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, { method: 'POST', formData }),
};

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
}
