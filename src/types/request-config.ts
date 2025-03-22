export interface RequestConfig {
    method: string;
    headers: Record<string, string>;
    body?: string | FormData;
    token?: string;
  }
