import React from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { ProgressBar } from '@/components/employee/common/ProgressBar';
import { mockTrainingModules } from '@shared/api/mockData';
import { Clock, GraduationCap } from 'lucide-react';

export const Training: React.FC = () => {
  const getDiffVariant = (cat: string) => {
    if (cat === 'Compliance') return 'success';
    if (cat === 'Soft Skills') return 'info';
    return 'warning';
  };

  return (
    <PageContainer>
      <Header 
        title="Training Curriculum" 
        subtitle="Recommended study modules based on your personal performance." 
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
        {mockTrainingModules.map(mod => (
          <Card key={mod.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GraduationCap size={18} color="var(--primary)" />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{mod.category}</span>
              </div>
              <Badge variant={getDiffVariant(mod.category)} style={{ fontSize: '0.65rem' }}>
                {mod.status === 'completed' ? 'Completed' : 'Active'}
              </Badge>
            </div>

            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{mod.title}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', flexGrow: 1 }}>{mod.description}</p>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                <span>Module Progress</span>
                <span>{mod.progress}%</span>
              </div>
              <ProgressBar progress={mod.progress} fillColor={mod.progress === 100 ? 'var(--success)' : 'var(--primary)'} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={14} />
                <span>{mod.estimatedMinutes} mins</span>
              </div>
              <button 
                className={mod.progress === 100 ? 'btn btn-secondary' : 'btn btn-primary'} 
                style={{ padding: '0.4rem 0.9rem', fontSize: '0.75rem' }}
                onClick={() => alert(`Launching lesson slides: "${mod.title}"...`)}
              >
                {mod.progress === 100 ? 'Replay' : mod.progress > 0 ? 'Resume' : 'Start'}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
export default Training;
