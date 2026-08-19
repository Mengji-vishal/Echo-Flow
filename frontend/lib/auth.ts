import { AuthUser, LoginResponse, MeResponse } from '@/types/auth';

const TOKEN_KEY = 'echoflow_auth_token';
const USER_KEY = 'echoflow_auth_user';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

export function saveAuthSession(token: string, user: AuthUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Also store in cookie for potential SSR / middleware access
  document.cookie = `echoflow_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `echoflow_token=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = 'echoflow_role=; path=/; max-age=0';
  document.cookie = 'echoflow_token=; path=/; max-age=0';
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Authentication failed. Please check your credentials.');
  }

  return data as LoginResponse;
}

export async function fetchMeApi(token: string): Promise<MeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Failed to verify session.');
  }

  return data as MeResponse;
}
