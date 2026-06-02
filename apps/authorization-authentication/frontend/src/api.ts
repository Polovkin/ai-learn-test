import { httpService, type ApiFetchOptions } from "./http.service";

export function apiFetch<T>(path: string, options?: ApiFetchOptions) {
  return httpService.apiFetch<T>(path, options);
}

export function setAccessToken(token: string) {
  httpService.setAccessToken(token);
}

export function getAccessToken() {
  return httpService.getAccessToken();
}

export function clearAccessToken() {
  httpService.clearAccessToken();
}

export function refreshToken() {
  return httpService.refreshToken();
}

export async function login(email: string, password: string) {
  const data = await httpService.post<{ accessToken: string }>("/auth/login", {
    email,
    password,
  });

  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  try {
    await httpService.post("/auth/logout");
  } finally {
    clearAccessToken();
  }
}

export function getMe() {
  return apiFetch("/auth/me");
}

export function getProfile() {
  return apiFetch("/profile");
}

export function getOrders() {
  return apiFetch("/orders");
}

export function getNotifications() {
  return apiFetch("/notifications");
}

export function getSettings() {
  return apiFetch("/settings");
}
