import { accessTokenService } from "./access-token.service";
import { API_URL } from "./http.config";
import { httpResponseService } from "./http-response.service";

class AuthRefreshService {
  private refreshPromise: Promise<string> | null = null;

  async refreshToken() {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    const data = await httpResponseService.parse(response);
    if (!response.ok) {
      throw new Error(
        `Refresh failed: ${response.status} ${JSON.stringify(data)}`,
      );
    }

    return (data as { accessToken: string }).accessToken;
  }

  async getFreshAccessToken() {
    if (!this.refreshPromise) {
      this.refreshPromise = this.refreshToken()
        .then((newToken) => {
          accessTokenService.set(newToken);
          return newToken;
        })
        .catch((error) => {
          accessTokenService.clear();
          throw error;
        })
        .finally(() => {
          this.refreshPromise = null;
        });
    } else {
      console.warn(
        "Refresh already in progress, waiting for existing refresh to complete.",
      );
    }

    return this.refreshPromise;
  }
}

export const authRefreshService = new AuthRefreshService();
