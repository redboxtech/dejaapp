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

export const API_BASE = envApiUrl.replace(/\/$/, "");

if (typeof window !== "undefined") {
  (window as any).__DEJA_API_BASE__ = API_BASE;
}

console.log("API Base URL sendo usada:", API_BASE);

function getToken(): string | null {
  return localStorage.getItem("deja_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("deja_token", token);
  else localStorage.removeItem("deja_token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  return (await response.json()) as T;
}

export function decodeJwt<T = unknown>(token: string): T | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return decoded as T;
  } catch {
    return null;
  }
}
