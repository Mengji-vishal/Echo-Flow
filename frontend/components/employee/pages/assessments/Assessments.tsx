import React, { useState, useEffect } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { FileCheck, Calendar } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeeCallsApi } from '@/lib/employee';
import { CallSummary } from '@/types/call';

export const Assessments: React.FC = () => {
  const { token } = useAuth();
  const activeToken = token || getAuthToken();

  const [calls, setCalls] = useState<CallSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!activeToken) return;
    setIsLoading(true);
    fetchEmployeeCallsApi(activeToken)
      .then((data) => setCalls(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [activeToken]);

  return (
    <PageContainer>
      <Header 
        title="Assigned Assessments" 
        subtitle="Review your verified assessment calls and evaluations." 
      />

      {calls.length === 0 ? (
        <Card style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed var(--border)' }}>
          <FileCheck size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            No Assessment Calls Recorded Yet
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto' }}>
            When a manager conducts an AI assessment call, your verified evaluations and scores will appear here.
          </p>
        </Card>
      ) : (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Assessment ID</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Duration</th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall Score</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((c) => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileCheck size={16} color="var(--primary)" />
                      <span>Assessment #{c.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <Badge variant={c.status === 'completed' ? 'success' : 'info'}>
                      {c.status === 'completed' ? 'Completed' : 'Pending'}
                    </Badge>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      <span>{c.created_at ? c.created_at.split('T')[0] : 'Today'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {c.duration_seconds ? `${Math.floor(c.duration_seconds / 60)}m ${c.duration_seconds % 60}s` : '--'}
                  </td>
                  <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: c.status === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {c.analysis?.overall_score !== undefined ? `${c.analysis.overall_score}%` : '--'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </PageContainer>
  );
};
export default Assessments;
