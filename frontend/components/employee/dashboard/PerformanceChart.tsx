import React from 'react';
import { Card } from '../common/Card';
import { CompetencyPieChart } from '@/components/ui/CompetencyPieChart';

interface PerformanceChartProps {
  scores?: number[];
  metrics?: Record<string, number>;
  isLoading?: boolean;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ metrics, isLoading }) => {
  return (
    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>
        Performance Progression
      </h3>
      <CompetencyPieChart skills={metrics} isLoading={isLoading} />
    </Card>
  );
};
