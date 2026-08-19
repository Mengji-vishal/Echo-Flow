'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser } from '@/types/auth';
import { getAuthToken, getAuthUser, saveAuthSession, clearAuthSession, loginApi, fetchMeApi } from '@/lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    // Check existing stored session on mount
    const storedToken = getAuthToken();
    const storedUser = getAuthUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      // Verify token in background
      fetchMeApi(storedToken)
        .then((res) => {
          setUser(res.user);
          saveAuthSession(storedToken, res.user);
        })
        .catch(() => {
          // Token expired or invalid
          clearAuthSession();
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const res = await loginApi(email, password);
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
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
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
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (user.role !== 'manager') {
        router.replace('/login?error=unauthorized_role');
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
    return null;
  }

  return <>{children}</>;
}
