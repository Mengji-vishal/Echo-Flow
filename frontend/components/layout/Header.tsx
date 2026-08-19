'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { BreadcrumbItem } from '@/types/navigation';

export function Header() {
  const pathname = usePathname();

  const getPageMeta = (path: string): { title: string; breadcrumbs: BreadcrumbItem[] } => {
    if (path === '/manager/dashboard' || path === '/manager') {
      return {
        title: 'Manager Dashboard',
        breadcrumbs: [
          { label: 'Echo-Flow', href: '/manager/dashboard' },
          { label: 'Overview', current: true },
        ],
      };
    }
    if (path === '/manager/calls' || path.startsWith('/manager/calls')) {
      return {
        title: 'Phone Assessment Call',
        breadcrumbs: [
          { label: 'Echo-Flow', href: '/manager/dashboard' },
          { label: 'Configure Call', current: true },
        ],
      };
    }
    if (path === '/manager/analytics' || path.startsWith('/manager/analytics')) {
      return {
        title: 'Employee Performance Analytics',
        breadcrumbs: [
          { label: 'Echo-Flow', href: '/manager/dashboard' },
          { label: 'Analytics', current: true },
        ],
      };
    }
    if (path === '/manager/settings') {
      return {
        title: 'Settings',
        breadcrumbs: [
          { label: 'Echo-Flow', href: '/manager/dashboard' },
          { label: 'Settings', current: true },
        ],
      };
    }

    return {
      title: 'Manager Command Center',
      breadcrumbs: [
        { label: 'Echo-Flow', href: '/manager/dashboard' },
        { label: 'Manager', current: true },
      ],
    };
  };

  const { title, breadcrumbs } = getPageMeta(pathname);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-sm shadow-xs">
      {/* Title and Breadcrumb */}
      <div className="flex flex-col justify-center">
        <Breadcrumb items={breadcrumbs} className="mb-0.5" />
        <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
          {title}
        </h1>
      </div>

      {/* Action Controls & Profile Area */}
      <div className="flex items-center space-x-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reps, calls, metrics..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-12 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="absolute right-2.5 flex items-center pointer-events-none">
              <kbd className="inline-flex h-5 items-center rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        {/* Help / Docs */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Help & Documentation"
          aria-label="Help & Documentation"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
        </button>

        {/* Manager Avatar Trigger */}
        <div className="flex items-center pl-1">
          <div className="flex items-center space-x-2.5 rounded-lg p-1 hover:bg-slate-50 transition-colors cursor-pointer">
            <Avatar
              name="Alex Morgan"
              size="sm"
              status="online"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
