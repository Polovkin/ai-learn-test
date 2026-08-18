class HttpResponseService {
  async handleSuccess<T>(response: Response, errorMessage: string) {
    const data = await this.parse(response);

    if (!response.ok) {
      throw new Error(
        `${errorMessage}: ${response.status} ${JSON.stringify(data)}`,
      );
    }

    return data as T;
  }

  async parse(response: Response) {
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
}

export const httpResponseService = new HttpResponseService();
