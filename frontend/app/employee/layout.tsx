import * as React from 'react';
import { EmployeeRouteGuard } from '@/components/auth/AuthContext';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EmployeeRouteGuard>
      {children}
    </EmployeeRouteGuard>
  );
}
