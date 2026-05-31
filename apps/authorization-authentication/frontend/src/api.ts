const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

let accessToken = '';

export type UILogger = (message: string) => void;

function authHeaders() {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = '';
}

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${JSON.stringify(data)}`);
  }

  setAccessToken(data.accessToken);
  return data;
}

export async function refreshToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include'
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(`Refresh failed: ${response.status} ${JSON.stringify(data)}`);
  }

  return data.accessToken as string;
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include'
  });

  clearAccessToken();

  if (!response.ok) {
    const data = await parseResponse(response);
    throw new Error(`Logout failed: ${response.status} ${JSON.stringify(data)}`);
  }
}

export async function apiFetch<T>(path: string, logger?: UILogger): Promise<T> {
  logger?.(`request started: ${path}`);

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    credentials: 'include'
  });

  if (response.status !== 401) {
    const data = await parseResponse(response);
    logger?.(`response received: ${path}`);

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${JSON.stringify(data)}`);
    }

    return data as T;
  }

  logger?.('got 401');

  // Intentional learning bug:
  // Concurrent 401 responses can trigger multiple refresh calls.
  // Do not fix this yet.
  logger?.('refresh started');
  const newToken = await refreshToken();
  setAccessToken(newToken);
  logger?.('refresh success');

  logger?.(`retry started: ${path}`);
  const retryResponse = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    credentials: 'include'
  });

  const retryData = await parseResponse(retryResponse);

  if (!retryResponse.ok) {
    logger?.('retry failed');
    throw new Error(`Retry failed: ${retryResponse.status} ${JSON.stringify(retryData)}`);
  }

  logger?.('retry success');
  return retryData as T;
}

export function getMe(logger?: UILogger) {
  return apiFetch('/auth/me', logger);
}

export function getProfile(logger?: UILogger) {
  return apiFetch('/profile', logger);
}

export function getOrders(logger?: UILogger) {
  return apiFetch('/orders', logger);
}

export function getNotifications(logger?: UILogger) {
  return apiFetch('/notifications', logger);
}

export function getSettings(logger?: UILogger) {
  return apiFetch('/settings', logger);
}
