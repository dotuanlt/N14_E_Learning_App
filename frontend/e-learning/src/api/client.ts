import { Platform } from 'react-native';
import { API_BASE_URL, ENDPOINTS } from './endpoints';
import { storage } from '@/storage';

export interface BackendFieldError {
  field: string;
  message: string;
}

export interface BackendResponse<T = any> {
  success: boolean;
  code?: string;
  message?: string;
  errors?: BackendFieldError[];
  data?: T;
  timestamp?: string;
}

const PUBLIC_AUTH_PATHS = new Set<string>([
  ENDPOINTS.AUTH.LOGIN,
  ENDPOINTS.AUTH.REGISTER,
  ENDPOINTS.AUTH.VERIFY_OTP,
  ENDPOINTS.AUTH.RESEND_OTP,
  ENDPOINTS.AUTH.FORGOT_PASSWORD,
  ENDPOINTS.AUTH.RESET_PASSWORD,
  ENDPOINTS.AUTH.REFRESH,
]);

function extractErrorMessage(json: any, status: number): string {
  if (json && typeof json === 'object') {
    if (Array.isArray(json.errors) && json.errors.length > 0) {
      const details = json.errors
        .map((item: any) => item?.message)
        .filter((msg: any) => typeof msg === 'string' && msg.trim().length > 0);
      if (details.length > 0) {
        return details.join('\n');
      }
    }
    if (typeof json.message === 'string' && json.message.trim().length > 0) {
      return json.message;
    }
  }
  return `Lỗi kết nối máy chủ (${status})`;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const token = await storage.getItem<string>('auth_token');
      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      }
    } catch {
      // ignore
    }
    return {};
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const refreshToken = await storage.getItem<string>('refresh_token');
        if (!refreshToken) {
          return null;
        }
        const res = await fetch(`${this.baseUrl}${ENDPOINTS.AUTH.REFRESH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
          await storage.removeItem('auth_token');
          await storage.removeItem('refresh_token');
          await storage.removeItem('current_user');
          return null;
        }
        const json = await res.json();
        const payload = json && typeof json === 'object' && 'data' in json ? json.data : json;
        if (payload?.accessToken) {
          await storage.setItem('auth_token', payload.accessToken);
          if (payload.refreshToken) {
            await storage.setItem('refresh_token', payload.refreshToken);
          }
          return payload.accessToken as string;
        }
        return null;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const authHeaders = await this.getAuthHeaders();
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...authHeaders,
      ...((options.headers as Record<string, string>) || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 && !isRetry && !PUBLIC_AUTH_PATHS.has(endpoint)) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        return this.request<T>(
          endpoint,
          {
            ...options,
            headers: {
              ...((options.headers as Record<string, string>) || {}),
              Authorization: `Bearer ${newToken}`,
            },
          },
          true,
        );
      }
    }

    let json: any = null;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
    }

    if (!res.ok) {
      const errorMsg = extractErrorMessage(json, res.status);
      const err = new Error(errorMsg);
      (err as any).status = res.status;
      (err as any).code = json?.code;
      (err as any).errors = json?.errors;
      (err as any).response = json;
      throw err;
    }

    if (json && typeof json === 'object' && 'success' in json) {
      if (json.success === false) {
        const err = new Error(extractErrorMessage(json, res.status));
        (err as any).code = json.code;
        (err as any).errors = json.errors;
        (err as any).response = json;
        throw err;
      }
      return json.data !== undefined ? json.data : json;
    }

    return json as T;
  }

  async get<T>(endpoint: string, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    });
  }

  async post<T>(endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    });
  }

  async uploadFile<T>(endpoint: string, formData: FormData, headers: Record<string, string> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  async uploadMultipart<T>(
    endpoint: string,
    asset: { uri: string; name: string; mimeType: string; file?: any },
    parameters: Record<string, string> = {},
  ): Promise<T> {
    if (Platform.OS === 'web') {
      const formData = new FormData();
      if (asset.file) {
        formData.append('file', asset.file, asset.name);
      } else {
        const blob = await (await fetch(asset.uri)).blob();
        formData.append('file', blob, asset.name);
      }
      Object.entries(parameters).forEach(([k, v]) => formData.append(k, v));
      return this.request<T>(endpoint, {
        method: 'POST',
        body: formData,
      });
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const executeNativeUpload = (token: string | null) =>
      new Promise<{ status: number; body: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.timeout = 30000;
        xhr.onload = () => {
          resolve({ status: xhr.status, body: xhr.responseText || '' });
        };
        xhr.onerror = () => {
          reject(new Error(`Không thể kết nối máy chủ tải ảnh (${url})`));
        };
        xhr.ontimeout = () => {
          reject(new Error('Quá thời gian tải ảnh lên, vui lòng thử lại'));
        };

        const formData = new FormData();
        formData.append('file', {
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType,
        } as any);
        Object.entries(parameters).forEach(([k, v]) => formData.append(k, v));
        xhr.send(formData);
      });

    let token = await storage.getItem<string>('auth_token');
    let res = await executeNativeUpload(token);

    if (res.status === 401) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        res = await executeNativeUpload(newToken);
      }
    }

    let json: any = null;
    if (res.body) {
      try {
        json = JSON.parse(res.body);
      } catch {
        json = res.body;
      }
    }

    if (res.status < 200 || res.status >= 300) {
      const err = new Error(extractErrorMessage(json, res.status));
      (err as any).status = res.status;
      (err as any).code = json?.code;
      (err as any).errors = json?.errors;
      (err as any).response = json;
      throw err;
    }

    if (json && typeof json === 'object' && 'success' in json) {
      if (json.success === false) {
        const err = new Error(extractErrorMessage(json, res.status));
        (err as any).code = json.code;
        (err as any).errors = json.errors;
        (err as any).response = json;
        throw err;
      }
      return json.data !== undefined ? json.data : json;
    }

    return json as T;
  }
}

export const apiClient = new ApiClient();
