'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthContext';

function LoginContent() {
  const [email, setEmail] = React.useState('manager@echoflow.com');
  const [password, setPassword] = React.useState('manager123');
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/manager/dashboard';
  const errorParam = searchParams.get('error');

  React.useEffect(() => {
    if (errorParam === 'unauthorized_role') {
      setError('Access restricted: Only users with Manager permissions can access the Manager Command Center.');
    }
  }, [errorParam]);

  // If already logged in as manager, forward to dashboard
  React.useEffect(() => {
    if (user && user.role === 'manager') {
      router.replace(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(email, password);

      if (authenticatedUser.role === 'manager') {
        router.push(redirectUrl);
      } else if (authenticatedUser.role === 'employee') {
        // Redirect toward the independent Employee application
        window.location.href = 'http://localhost:5173';
      } else {
        router.push('/manager/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Branding Header */}
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            <Zap className="h-6 w-6 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-tight">
              Echo-Flow
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Assessment & Training Platform
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-200/80 shadow-md bg-white">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-bold text-slate-900">Sign in to your account</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your credentials to access the operational portal
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message Banner */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-2.5 text-xs animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@echoflow.com"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-10 font-bold bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Development Only Demo Credentials Helper */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Development Demo Accounts
                </span>
                <Badge variant="neutral" size="sm" className="text-[10px] py-0">
                  DEV ONLY
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('manager@echoflow.com', 'manager123')}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Manager
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">manager@echoflow.com</p>
                  <p className="text-[10px] text-slate-400">pass: manager123</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleFillDemo('employee@echoflow.com', 'employee123')}
                  className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors text-left group"
                >
                  <div className="flex items-center space-x-1.5 mb-1">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      Employee
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">employee@echoflow.com</p>
                  <p className="text-[10px] text-slate-400">pass: employee123</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-500">Loading Login...</div>}>
      <LoginContent />
    </React.Suspense>
  );
}
