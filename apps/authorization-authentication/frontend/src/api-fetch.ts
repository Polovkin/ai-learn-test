export type UILogger = (message: string) => void;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const ACCESS_TOKEN_KEY = "jwt_learning_access_token";
const AUTH_PATHS_WITHOUT_REFRESH = ["/auth/login", "/auth/refresh"];

let accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || "";

function shouldSkipRefresh(path: string) {
  return AUTH_PATHS_WITHOUT_REFRESH.includes(path);
}

function authHeaders() {
  if (!accessToken) {
    return {} as Record<string, string>;
  }
  return { Authorization: `Bearer ${accessToken}` };
}

function handleAuthFailure(logger?: UILogger) {
  clearAccessToken();
  logger?.("auth state cleared");
}

export function setAccessToken(token: string) {
  accessToken = token;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = "";
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export async function parseResponse(response: Response) {
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

let refreshPromise: Promise<string> | null = null;

async function getFreshAccessToken(logger?: UILogger) {
  if (!refreshPromise) {
    logger?.("refresh started");

    refreshPromise = refreshToken()
      .then((newToken) => {
        setAccessToken(newToken);
        logger?.("refresh success");
        return newToken;
      })
      .catch((error) => {
        logger?.("refresh failed");
        handleAuthFailure(logger);
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  } else {
    logger?.("waiting for existing refresh");
  }

  return refreshPromise;
}

export async function refreshToken() {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(
      `Refresh failed: ${response.status} ${JSON.stringify(data)}`,
    );
  }

  return data.accessToken as string;
}

export async function apiFetch<T>(path: string, logger?: UILogger): Promise<T> {
  logger?.(`request started: ${path}`);

  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
  });

  if (response.status !== 401) {
    const data = await parseResponse(response);
    logger?.(`response received: ${path}`);

    if (!response.ok) {
      throw new Error(
        `Request failed: ${response.status} ${JSON.stringify(data)}`,
      );
    }

    return data as T;
  }

  logger?.("got 401");

  if (shouldSkipRefresh(path)) {
    logger?.(`auth request failed without refresh: ${path}`);
    const data = await parseResponse(response);
    throw new Error(
      `Auth request failed: ${response.status} ${JSON.stringify(data)}`,
    );
  }

  // Intentional learning bug:
  // Concurrent 401 responses can trigger multiple refresh calls.
  // Do not fix this yet.
  // test flag
  const test = true;
  logger?.("refresh started");

  if (!test) {
    try {
      const newToken = await refreshToken();
      setAccessToken(newToken);
      logger?.("refresh success");
    } catch (error) {
      logger?.("refresh failed");
      handleAuthFailure(logger);
      throw error;
    }
  } else {
    await getFreshAccessToken(logger);
  }

  logger?.(`retry started: ${path}`);
  const retryResponse = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    credentials: "include",
  });

  const retryData = await parseResponse(retryResponse);
  if (!retryResponse.ok) {
    logger?.("retry failed");
    throw new Error(
      `Retry failed: ${retryResponse.status} ${JSON.stringify(retryData)}`,
    );
  }

  logger?.("retry success");
  return retryData as T;
}
