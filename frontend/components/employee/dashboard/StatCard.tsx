import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, isPositive = true }) => {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
        {title}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {value}
        </span>
        <Badge variant={isPositive ? 'success' : 'danger'} style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem' }}>
          {trend}
        </Badge>
      </div>
    </Card>
  );
};
