import { ComponentType, SVGProps } from 'react';

export interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string | number;
  badgeVariant?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  exact?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  initials: string;
}
