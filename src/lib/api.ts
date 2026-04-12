// 브라우저에서는 Next.js API 프록시를 통해 백엔드 호출 (CORS 우회)
const BASE_URL = typeof window !== 'undefined' ? '/api/proxy' : (process.env.NEXT_PUBLIC_API_URL || 'https://moneyrun-backend.onrender.com');
const JWT_STORAGE_KEY = 'moneyrun_jwt';

class ApiClient {
  private token: string | null = null;
  private refreshing: Promise<boolean> | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(JWT_STORAGE_KEY);
    }
  }

  // 카카오 토큰으로 JWT 재발급
  private async refreshJwt(): Promise<boolean> {
    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const kakaoToken = session?.accessToken;
      if (!kakaoToken) return false;

      const authRes = await fetch(`${BASE_URL}/auth/kakao`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: kakaoToken }),
      });

      if (!authRes.ok) return false;

      const { data } = await authRes.json();
      this.token = data.accessToken;
      sessionStorage.setItem(JWT_STORAGE_KEY, data.accessToken);
      return true;
    } catch {
      return false;
    }
  }

  private async request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    // 401이고 아직 재시도 안 했으면 → JWT 재발급 후 재시도
    if (res.status === 401 && !isRetry && typeof window !== 'undefined') {
      // 동시 여러 요청이 401 받아도 재발급은 1번만
      if (!this.refreshing) {
        this.refreshing = this.refreshJwt().finally(() => { this.refreshing = null; });
      }
      const refreshed = await this.refreshing;
      if (refreshed) {
        return this.request<T>(path, options, true);
      }
    }

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.message || 'API 요청 실패');
    }

    return json.data;
  }

  get<T>(path: string) {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
