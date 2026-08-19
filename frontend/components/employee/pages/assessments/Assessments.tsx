import React from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { mockAssessments } from '@shared/api/mockData';
import { FileCheck, Calendar, Play } from 'lucide-react';

export const Assessments: React.FC = () => {
  const getStatusVariant = (status: string, score: number) => {
    if (status === 'pending') return 'warning';
    if (score >= 80) return 'success';
    return 'info';
  };

  const getStatusText = (status: string) => {
    if (status === 'pending') return 'Not Started';
    return 'Completed';
  };

  return (
    <PageContainer>
      <Header 
        title="Assigned Assessments" 
        subtitle="Complete your pending compliance certifications and evaluated tests." 
      />

      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-muted)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Assessment Name</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Domain</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Status</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Due Date</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Score</th>
              <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {mockAssessments.map(asm => (
              <tr key={asm.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCheck size={16} color="var(--primary)" />
                    {asm.callTitle}
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {asm.id === 'asm_104' ? 'Real Estate' : asm.id === 'asm_105' ? 'Insurance' : asm.id === 'asm_106' ? 'B2B SaaS' : 'Personal Loan'}
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  <Badge variant={getStatusVariant(asm.status, asm.overallScore)}>
                    {getStatusText(asm.status)}
                  </Badge>
                </td>
                <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <span>2026-08-31</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1rem', fontSize: '0.875rem', fontWeight: 700, color: asm.status === 'completed' ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {asm.status === 'completed' ? `${asm.overallScore}%` : '--'}
                </td>
                <td style={{ padding: '1.25rem 1rem' }}>
                  {asm.status === 'completed' ? (
                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => alert("Re-inspecting call record evaluations in Calls page.")}>
                      View Report
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem' }} onClick={() => alert("Launching corporate assessment simulation agent...")}>
                      <Play size={12} fill="white" />
                      Start Test
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContainer>
  );
};
export default Assessments;
