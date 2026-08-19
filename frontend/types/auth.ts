export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'manager' | 'employee' | string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface MeResponse {
  user: AuthUser;
}
