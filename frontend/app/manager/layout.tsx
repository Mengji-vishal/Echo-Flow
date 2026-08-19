'use client';

import * as React from 'react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { ManagerRouteGuard } from '@/components/auth/AuthContext';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ManagerRouteGuard>
      <ManagerShell>{children}</ManagerShell>
    </ManagerRouteGuard>
  );
}
