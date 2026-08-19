import React from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { mockUserProgress } from '@shared/api/mockData';
import { Award, ShieldAlert, ShieldCheck, Heart, Flame, Lock } from 'lucide-react';

export const Achievements: React.FC = () => {
  const getBadgeIcon = (iconName: string, isLocked: boolean) => {
    const color = isLocked ? 'var(--text-muted)' : 'var(--primary)';
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert size={28} color={isLocked ? 'var(--text-muted)' : '#f59e0b'} />;
      case 'ShieldCheck': return <ShieldCheck size={28} color={isLocked ? 'var(--text-muted)' : '#10b981'} />;
      case 'Heart': return <Heart size={28} color={isLocked ? 'var(--text-muted)' : '#ef4444'} />;
      case 'Flame': return <Flame size={28} color={isLocked ? 'var(--text-muted)' : 'var(--warning)'} />;
      default: return <Award size={28} color={color} />;
    }
  };

  const unlocked = mockUserProgress.achievements;
  const locked = [
    { id: "ach_05", title: "Top Performer", description: "Maintain a QA score above 90% for 5 consecutive calls.", icon: "Award" },
    { id: "ach_06", title: "100 Calls Completed", description: "Reach a milestone of 100 evaluated client calls.", icon: "ShieldCheck" }
  ];

  return (
    <PageContainer>
      <Header 
        title="My Achievements" 
        subtitle="Earn professional credentials as you refine your communication skills." 
      />

      {/* Unlocked Cabinet */}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Unlocked Badges</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        {unlocked.map(ach => (
          <Card key={ach.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {getBadgeIcon(ach.icon, false)}
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{ach.title}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>{ach.description}</p>
            </div>
            <Badge variant="success" style={{ fontSize: '0.6rem', padding: '0.05rem 0.4rem', marginTop: 'auto' }}>
              Unlocked
            </Badge>
          </Card>
        ))}
      </div>

      {/* Locked cabinet */}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Next Milestones</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', opacity: 0.75 }}>
        {locked.map(ach => (
          <Card key={ach.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1.25rem', borderStyle: 'dashed' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getBadgeIcon(ach.icon, true)}
              </div>
              <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={10} color="var(--text-muted)" />
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>{ach.title}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>{ach.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};
export default Achievements;
