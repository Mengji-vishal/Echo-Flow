import * as React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Preferences"
        description="Configure organization QA criteria thresholds, notifications, and AI analysis parameters."
      />

      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Settings}
            title="System Settings"
            description="Manage QA evaluation weights, alert notifications, and manager workspace preferences."
          />
        </CardContent>
      </Card>
    </div>
  );
}
