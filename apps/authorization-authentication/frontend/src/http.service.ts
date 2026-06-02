import { accessTokenService } from "./access-token.service";
import { authRefreshService } from "./auth-refresh.service";
import { API_URL, AUTH_PATHS_WITHOUT_REFRESH } from "./http.config";
import { httpResponseService } from "./http-response.service";

export type ApiFetchOptions = Omit<RequestInit, "body" | "method"> & {
  method?: string;
  body?: unknown;
};

class HttpService {
  private inFlightRequests = new Map<string, Promise<unknown>>();

  setAccessToken(token: string) {
    accessTokenService.set(token);
  }

  getAccessToken() {
    return accessTokenService.get();
  }

  clearAccessToken() {
    accessTokenService.clear();
  }

  async refreshToken() {
    return authRefreshService.refreshToken();
  }

  async apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const method = (options.method ?? "GET").toUpperCase();
    const normalizedOptions = {
      ...options,
      method,
    };

    if (method === "GET") {
      const requestKey = `${method}:${path}`;

      return this.dedupeRequest(requestKey, () => {
        return this.executeRequest<T>(path, normalizedOptions);
      });
    }

    return this.executeRequest<T>(path, normalizedOptions);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.executeRequest<T>(
      path,
      {
        method: "POST",
        body,
      },
      this.errorPrefix(path),
    );
  }

  private async executeRequest<T>(
    path: string,
    options: ApiFetchOptions,
    errorMessage = "Request failed",
  ): Promise<T> {
    const response = await this.request(path, options);

    if (response.status !== 401) {
      return httpResponseService.handleSuccess<T>(response, errorMessage);
    }

    if (this.shouldSkipRefresh(path)) {
      const data = await httpResponseService.parse(response);
      throw new Error(
        `Auth request failed: ${response.status} ${JSON.stringify(data)}`,
      );
    }

    await authRefreshService.getFreshAccessToken();

    const retryResponse = await this.request(path, options);
    return httpResponseService.handleSuccess<T>(retryResponse, "Retry failed");
  }

  private request(path: string, options: ApiFetchOptions) {
    return fetch(`${API_URL}${path}`, {
      ...options,
      method: options.method,
      headers: this.headers(options.headers),
      credentials: "include",
      body: this.serializeBody(options.body),
    });
  }

  private async dedupeRequest<T>(
    key: string,
    requestFn: () => Promise<T>,
  ): Promise<T> {
    const existingRequest = this.inFlightRequests.get(key);

    if (existingRequest) {
      return existingRequest as Promise<T>;
    }

    const request = requestFn().finally(() => {
      this.inFlightRequests.delete(key);
    });

    this.inFlightRequests.set(key, request);
    return request;
  }

  private serializeBody(body: unknown) {
    if (body === undefined) {
      return undefined;
    }

    return JSON.stringify(body);
  }

  private headers(headers?: HeadersInit) {
    const requestHeaders = new Headers();

    requestHeaders.set("Content-Type", "application/json");

    Object.entries(accessTokenService.authHeaders()).forEach(([key, value]) => {
      requestHeaders.set(key, value);
    });

    new Headers(headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });

    return requestHeaders;
  }

  private shouldSkipRefresh(path: string) {
    return AUTH_PATHS_WITHOUT_REFRESH.includes(path);
  }

  private errorPrefix(path: string) {
    if (path === "/auth/login") {
      return "Login failed";
    }

    if (path === "/auth/logout") {
      return "Logout failed";
    }

    return "Request failed";
  }
}

export const httpService = new HttpService();
