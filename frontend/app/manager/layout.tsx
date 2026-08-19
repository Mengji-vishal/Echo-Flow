import * as React from 'react';
import { ManagerShell } from '@/components/layout/ManagerShell';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ManagerShell>{children}</ManagerShell>;
}
