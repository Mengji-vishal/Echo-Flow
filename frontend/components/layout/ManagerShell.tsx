import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface ManagerShellProps {
  children: React.ReactNode;
}

export function ManagerShell({ children }: ManagerShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col pl-64 min-w-0">
        {/* Sticky Header */}
        <Header />

        {/* Dynamic Page Container */}
        <main className="flex-1 px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
