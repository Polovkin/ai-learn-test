import {
  apiFetch,
  clearAccessToken,
  getAccessToken,
  parseResponse,
  refreshToken,
  setAccessToken,
  type UILogger,
} from "./api-fetch";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export {
  apiFetch,
  clearAccessToken,
  getAccessToken,
  refreshToken,
  setAccessToken,
  type UILogger,
};

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(`Login failed: ${response.status} ${JSON.stringify(data)}`);
  }

  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  clearAccessToken();

  if (!response.ok) {
    const data = await parseResponse(response);
    throw new Error(
      `Logout failed: ${response.status} ${JSON.stringify(data)}`,
    );
  }
}

export function getMe(logger?: UILogger) {
  return apiFetch("/auth/me", logger);
}

export function getProfile(logger?: UILogger) {
  return apiFetch("/profile", logger);
}

export function getOrders(logger?: UILogger) {
  return apiFetch("/orders", logger);
}

export function getNotifications(logger?: UILogger) {
  return apiFetch("/notifications", logger);
}

export function getSettings(logger?: UILogger) {
  return apiFetch("/settings", logger);
}
