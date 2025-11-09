const envApiUrl =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).trim()
    : "";

if (!envApiUrl) {
  console.error(
    "VITE_API_URL não está definido. Configure a URL do backend em um arquivo .env ou nos secrets do build."
  );
  throw new Error("VITE_API_URL não configurado");
}

const API_BASE = envApiUrl.replace(/\/$/, "");

function getToken(): string | null {
  return localStorage.getItem('deja_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('deja_token', token);
  else localStorage.removeItem('deja_token');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {}
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  return res.json() as Promise<T>;
}

export function decodeJwt<T = any>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded as T;
  } catch {
    return null;
  }
}


