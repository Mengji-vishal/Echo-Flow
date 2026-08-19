import { AuthUser, AuthResponse, MeResponse, UserRole } from '@/types/auth';

const TOKEN_KEY = 'echoflow_auth_token';
const USER_KEY = 'echoflow_auth_user';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Reusable helper to parse and format any FastAPI/Pydantic error into a clean human-readable string.
 * Handles strings, objects, arrays of validation errors, and network errors.
 */
export function formatErrorMessage(detail: any, fallback: string = 'An error occurred'): string {
  if (!detail) return fallback;

  if (typeof detail === 'string') {
    return detail;
  }

  // Handle FastAPI Pydantic validation error arrays: [{ loc: ['body', 'role'], msg: 'Field required' }]
  if (Array.isArray(detail)) {
    const messages = detail.map((err) => {
      if (typeof err === 'string') return err;
      if (err && typeof err === 'object') {
        const field = Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
        const msg = err.msg || err.message || JSON.stringify(err);
        return field && field !== 'body' ? `${field}: ${msg}` : msg;
      }
      return String(err);
    });
    return messages.join('. ') || fallback;
  }

  // Handle structured error object: { message: '...' } or { msg: '...' }
  if (typeof detail === 'object') {
    if (detail.message) return String(detail.message);
    if (detail.msg) return String(detail.msg);
    if (detail.detail) return formatErrorMessage(detail.detail, fallback);
    try {
      return JSON.stringify(detail);
    } catch {
      return fallback;
    }
  }

  return String(detail);
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    document.cookie = `echoflow_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `echoflow_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  } catch {
    // Ignore storage quota errors
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    document.cookie = 'echoflow_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'echoflow_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch {
    // Ignore
  }
}

export async function loginApi(
  email: string,
  password: string,
  role: UserRole = 'manager'
): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
        role,
      }),
      signal: controller.signal,
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMsg = formatErrorMessage(
        data.detail || data.message || data.error,
        `Authentication failed (HTTP ${response.status})`
      );
      throw new Error(errorMsg);
    }

    return data as AuthResponse;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Login request timed out. Please verify backend server is running.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function registerApi(
  name: string,
  email: string,
  password: string,
  role: UserRole = 'manager'
): Promise<AuthResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      }),
      signal: controller.signal,
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMsg = formatErrorMessage(
        data.detail || data.message || data.error,
        `Registration failed (HTTP ${response.status})`
      );
      throw new Error(errorMsg);
    }

    return data as AuthResponse;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Registration request timed out. Please verify backend server is running.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchMeApi(token: string): Promise<MeResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    let data: any = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      const errorMsg = formatErrorMessage(
        data.detail || data.message,
        `Session verification failed (HTTP ${response.status})`
      );
      throw new Error(errorMsg);
    }

    return data as MeResponse;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('Session verification request timed out.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
