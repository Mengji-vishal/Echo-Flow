'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  PhoneCall,
  BarChart3,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/components/auth/AuthContext';

interface NavLinkItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';
}

const mainNavItems: NavLinkItem[] = [
  {
    name: 'Overview',
    href: '/manager/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Calls',
    href: '/manager/calls',
    icon: PhoneCall,
  },
  {
    name: 'Analytics',
    href: '/manager/analytics',
    icon: BarChart3,
  },
];

const secondaryNavItems: NavLinkItem[] = [
  {
    name: 'Settings',
    href: '/manager/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const displayName = user?.name || 'Demo Manager';

  const isRouteActive = (href: string) => {
    if (href === '/manager/dashboard') {
      return pathname === '/manager/dashboard' || pathname === '/manager';
    }
    if (href === '/manager/calls') {
      return pathname.startsWith('/manager/calls');
    }
    if (href === '/manager/analytics') {
      return pathname.startsWith('/manager/analytics');
    }
    if (href === '/manager/settings') {
      return pathname.startsWith('/manager/settings');
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white shadow-sm">
      {/* Branding */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
        <Link href="/manager/dashboard" className="flex items-center space-x-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              Echo-Flow
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
              Command Center
            </span>
          </div>
        </Link>
        <Badge variant="primary" size="sm" className="hidden sm:inline-flex text-[10px] px-1.5 py-0">
          Manager
        </Badge>
      </div>

      {/* Navigation Section */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Main Menu
            </p>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          active
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || 'neutral'}
                          size="sm"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              System
            </p>
            <nav className="space-y-1">
              {secondaryNavItems.map((item) => {
                const active = isRouteActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          'h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors',
                          active && 'text-blue-600'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Manager Profile Footer Area with Logout */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <div className="flex items-center justify-between rounded-lg p-2 bg-slate-50 border border-slate-100">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <Avatar
                name={displayName}
                size="sm"
                status="online"
              />
              <div className="flex flex-col text-left truncate">
                <span className="text-xs font-semibold text-slate-900 truncate">
                  {displayName}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {user?.role || 'manager'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
