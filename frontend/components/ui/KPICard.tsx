import * as React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  caption?: string;
  icon: LucideIcon;
  iconVariant?: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo';
  statusDot?: boolean;
}

export function KPICard({
  title,
  value,
  trend,
  trendType = 'positive',
  caption,
  icon: Icon,
  iconVariant = 'blue',
  statusDot = false,
  className,
  ...props
}: KPICardProps) {
  const iconVariantStyles = {
    blue: 'bg-blue-50 text-blue-600 ring-1 ring-blue-100/80',
    emerald: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100/80',
    purple: 'bg-purple-50 text-purple-600 ring-1 ring-purple-100/80',
    amber: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100/80',
    indigo: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100/80',
  };

  const trendStyles = {
    positive: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    negative: 'bg-rose-50 text-rose-700 border-rose-200/60',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/60',
  };

  const TrendIcon =
    trendType === 'positive'
      ? TrendingUp
      : trendType === 'negative'
      ? TrendingDown
      : Minus;

  return (
    <Card
      className={cn(
        'group relative overflow-hidden p-5 transition-all duration-200 hover:shadow-card-hover hover:border-slate-300/80',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105',
            iconVariantStyles[iconVariant]
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </div>

        <div className="mt-2.5 flex items-center flex-wrap gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-semibold border',
                trendStyles[trendType]
              )}
            >
              <TrendIcon className="h-3 w-3 shrink-0" />
              {trend}
            </span>
          )}

          {statusDot && (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {caption}
            </span>
          )}

          {!statusDot && caption && (
            <span className="text-slate-500 font-medium">{caption}</span>
          )}
        </div>
      </div>
    </Card>
  );
}
