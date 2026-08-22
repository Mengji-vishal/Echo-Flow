import React, { useEffect, useState } from 'react';
import { PageContainer } from '@/components/employee/layout/PageContainer';
import { Header } from '@/components/employee/layout/Header';
import { Card } from '@/components/employee/common/Card';
import { Badge } from '@/components/employee/common/Badge';
import { Award, ShieldCheck, Heart, Flame, Lock, Trophy } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthContext';
import { getAuthToken } from '@/lib/auth';
import { fetchEmployeePerformanceApi, EmployeePerformanceSummary } from '@/lib/employee';

export const Achievements: React.FC = () => {
  const { token } = useAuth();
  const activeToken = token || getAuthToken();

  const [perfData, setPerfData] = useState<EmployeePerformanceSummary | null>(null);

  useEffect(() => {
    if (!activeToken) return;
    fetchEmployeePerformanceApi(activeToken)
      .then((data) => setPerfData(data))
      .catch(() => {});
  }, [activeToken]);

  const completedCalls = perfData?.completed_calls || 0;
  const avgScore = perfData?.average_score || 0;
  const metrics = perfData?.metrics_averages || {};

  const allBadges = [
    {
      id: 'ach_01',
      title: 'First Verified Assessment',
      description: 'Complete your first live AI phone assessment call.',
      icon: 'Award',
      unlocked: completedCalls >= 1,
    },
    {
      id: 'ach_02',
      title: 'Consistent Performer',
      description: 'Complete at least 3 evaluated assessment calls.',
      icon: 'Flame',
      unlocked: completedCalls >= 3,
    },
    {
      id: 'ach_03',
      title: 'Empathy Champion',
      description: 'Achieve an empathy competency rating of 90% or higher.',
      icon: 'Heart',
      unlocked: (metrics.empathy || 0) >= 90,
    },
    {
      id: 'ach_04',
      title: 'Regulatory Standard',
      description: 'Achieve a compliance score of 95% or higher.',
      icon: 'ShieldCheck',
      unlocked: (metrics.compliance || 0) >= 95,
    },
    {
      id: 'ach_05',
      title: 'QA Excellence',
      description: 'Maintain an overall QA score average of 85% or higher.',
      icon: 'Trophy',
      unlocked: avgScore >= 85 && completedCalls >= 1,
    },
    {
      id: 'ach_06',
      title: 'Veteran Representative',
      description: 'Reach a milestone of 10 completed assessment calls.',
      icon: 'ShieldCheck',
      unlocked: completedCalls >= 10,
    },
  ];

  const unlockedList = allBadges.filter((b) => b.unlocked);
  const lockedList = allBadges.filter((b) => !b.unlocked);

  const renderBadgeIcon = (icon: string, unlocked: boolean) => {
    const color = unlocked ? 'var(--primary)' : 'var(--text-muted)';
    switch (icon) {
      case 'Heart': return <Heart size={28} color={unlocked ? '#ef4444' : color} />;
      case 'Flame': return <Flame size={28} color={unlocked ? '#f59e0b' : color} />;
      case 'ShieldCheck': return <ShieldCheck size={28} color={unlocked ? '#10b981' : color} />;
      case 'Trophy': return <Trophy size={28} color={unlocked ? '#6366f1' : color} />;
      default: return <Award size={28} color={color} />;
    }
  };

  return (
    <PageContainer>
      <Header 
        title="My Achievements" 
        subtitle="Credentials unlocked dynamically from your verified assessment call performance." 
      />

      {/* Unlocked Cabinet */}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 700 }}>
        Unlocked Credentials ({unlockedList.length})
      </h3>

      {unlockedList.length === 0 ? (
        <Card style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px dashed var(--border)', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
            No credentials unlocked yet. Complete your first evaluated assessment call to earn credentials.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {unlockedList.map((ach) => (
            <Card key={ach.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1.25rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderBadgeIcon(ach.icon, true)}
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
      )}

      {/* Locked cabinet */}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1rem', fontWeight: 700 }}>
        Next Milestones ({lockedList.length})
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', opacity: 0.8 }}>
        {lockedList.map((ach) => (
          <Card key={ach.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.75rem', padding: '1.25rem', borderStyle: 'dashed' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderBadgeIcon(ach.icon, false)}
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
