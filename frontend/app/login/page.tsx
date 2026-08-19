'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthContext';
import { UserRole } from '@/types/auth';

function LoginContent() {
  const searchParams = useSearchParams();
  const portalParam = searchParams.get('portal') as UserRole | null;
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');

  const [selectedRole, setSelectedRole] = React.useState<UserRole>(
    portalParam === 'employee' ? 'employee' : 'manager'
  );
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { login, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (portalParam === 'employee' || portalParam === 'manager') {
      setSelectedRole(portalParam);
    }
  }, [portalParam]);

  React.useEffect(() => {
    if (errorParam === 'manager_portal_only') {
      setError('Access restricted: That section requires Manager permissions. Redirected to your dashboard.');
    } else if (errorParam === 'employee_portal_only') {
      setError('Access restricted: That section requires Employee permissions. Redirected to your dashboard.');
    }
  }, [errorParam]);

  // If already authenticated, redirect to appropriate role portal
  React.useEffect(() => {
    if (user) {
      if (redirectParam) {
        router.replace(redirectParam);
      } else if (user.role === 'manager') {
        router.replace('/manager/dashboard');
      } else if (user.role === 'employee') {
        router.replace('/employee/dashboard');
      }
    }
  }, [user, router, redirectParam]);

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const authenticatedUser = await login(email, password, selectedRole);

      if (redirectParam) {
        router.push(redirectParam);
      } else if (authenticatedUser.role === 'manager') {
        router.push('/manager/dashboard');
      } else if (authenticatedUser.role === 'employee') {
        router.push('/employee/dashboard');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      if (msg.includes('Invalid email or password')) {
        setError(
          `Invalid credentials for ${selectedRole === 'manager' ? 'Manager' : 'Employee'} portal. If you are ${
            selectedRole === 'manager' ? 'an Employee' : 'a Manager'
          }, please switch to the ${selectedRole === 'manager' ? 'Employee' : 'Manager'} tab above.`
        );
      } else {
        setError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
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
              AI Assessment & Training Platform
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-slate-200/80 shadow-md bg-white">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-bold text-slate-900">Sign in to your account</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Select your portal and enter your credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Explicit Portal Role Selector Tabs */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Select Portal to Sign In
              </label>
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200 gap-1">
                <button
                  type="button"
                  onClick={() => handleRoleChange('manager')}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-md font-bold text-xs transition-all ${
                    selectedRole === 'manager'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Manager Portal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('employee')}
                  className={`flex items-center justify-center space-x-2 py-2 rounded-md font-bold text-xs transition-all ${
                    selectedRole === 'employee'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Employee Portal</span>
                </button>
              </div>
            </div>

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
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-10 pl-9 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className={`w-full h-10 font-bold text-white gap-2 shadow-sm ${
                  selectedRole === 'manager'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <span>Sign In to {selectedRole === 'manager' ? 'Manager Portal' : 'Employee Portal'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Sign up
                </Link>
              </p>
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
