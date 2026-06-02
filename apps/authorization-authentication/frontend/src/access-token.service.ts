const ACCESS_TOKEN_KEY = "jwt_learning_access_token";

class AccessTokenService {
  private accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || "";

  set(token: string) {
    this.accessToken = token;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  get() {
    return this.accessToken;
  }

  clear() {
    this.accessToken = "";
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  authHeaders() {
    if (!this.accessToken) {
      return {} as Record<string, string>;
    }

    return { Authorization: `Bearer ${this.accessToken}` };
  }
}

export const accessTokenService = new AccessTokenService();
