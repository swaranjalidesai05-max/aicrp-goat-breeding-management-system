const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export const AUTH_STORAGE_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
} as const;

function buildUrl(input: string) {
  if (input.startsWith('http://') || input.startsWith('https://')) {
    return input;
  }

  if (input.startsWith('/')) {
    return `${API_BASE_URL}${input}`;
  }

  return `${API_BASE_URL}/${input}`;
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (init?.body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const accessToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
}

export async function requestJson<T = any>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(input), {
    ...init,
    headers: buildHeaders(init),
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? `Request failed with status ${response.status}`);
  }

  return payload as T;
}
