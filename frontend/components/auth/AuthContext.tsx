'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser, UserRole } from '@/types/auth';
import {
  getAuthToken,
  getAuthUser,
  saveAuthSession,
  clearAuthSession,
  loginApi,
  registerApi,
  fetchMeApi,
} from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<AuthUser>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const storedToken = getAuthToken();
        const storedUser = getAuthUser();

        if (!storedToken) {
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        // Set preliminary state from stored cache
        if (isMounted) {
          setToken(storedToken);
          if (storedUser) {
            setUser(storedUser);
          }
        }

        // Validate token with backend /auth/me
        try {
          const res = await fetchMeApi(storedToken);
          if (isMounted && res.user) {
            setUser(res.user);
            setToken(storedToken);
            saveAuthSession(storedToken, res.user);
          }
        } catch (verifyErr) {
          // Token is expired, invalid, or server returned unauthorized
          console.warn('Auth session verification failed:', verifyErr);
          clearAuthSession();
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Unexpected error during auth initialization:', err);
        clearAuthSession();
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthUser> => {
    const res = await loginApi(email, password, role);
    setToken(res.token);
    setUser(res.user);
    saveAuthSession(res.token, res.user);
    return res.user;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<AuthUser> => {
    const res = await registerApi(name, email, password, role);
    setToken(res.token);
    setUser(res.user);
    saveAuthSession(res.token, res.user);
    return res.user;
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function ManagerRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.replace(`/login?portal=manager&redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'manager') {
        router.replace('/employee/dashboard?error=manager_portal_only');
      }
    }
  }, [user, token, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Verifying Manager Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Redirecting to Employee Workspace...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function EmployeeRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading) {
      if (!token || !user) {
        router.replace(`/login?portal=employee&redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'employee') {
        router.replace('/manager/dashboard?error=employee_portal_only');
      }
    }
  }, [user, token, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Verifying Employee Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'employee') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Redirecting to Manager Command Center...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
