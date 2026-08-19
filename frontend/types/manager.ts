export interface ManagerKPICard {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  iconName?: string;
}

export interface ManagerBreadcrumb {
  title: string;
  path?: string;
}
