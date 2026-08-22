import React from 'react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { ArrowRight, Trophy, Target } from 'lucide-react';

interface SkillBreakdownProps {
  onPracticeClick: () => void;
  metrics?: Record<string, number>;
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ onPracticeClick, metrics }) => {
  const m = metrics || {};

  const skills = [
    { name: 'Empathy', value: m.empathy ?? 0 },
    { name: 'Communication', value: m.communication ?? 0 },
    { name: 'Discovery', value: m.discovery ?? 0 },
    { name: 'Objection Handling', value: m.objectionHandling ?? 0 },
    { name: 'Closing', value: m.closing ?? 0 },
    { name: 'Compliance', value: m.compliance ?? 0 },
  ];

  const hasMetrics = skills.some((s) => s.value > 0);

  // Find strongest and weakest among evaluated skills
  const sorted = [...skills].sort((a, b) => b.value - a.value);
  const strongest = hasMetrics ? sorted[0] : { name: 'Not Evaluated', value: 0 };
  const weakest = hasMetrics ? sorted[sorted.length - 1] : { name: 'Not Evaluated', value: 0 };

  const getScoreColor = (val: number) => {
    if (val === 0) return 'var(--text-muted)';
    if (val >= 85) return 'var(--success)';
    if (val >= 70) return 'var(--primary)';
    return 'var(--warning)';
  };

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 700 }}>Skill Competency Breakdown</h3>

      {/* Skill progress list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {skills.map(sk => (
          <div key={sk.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{sk.name}</span>
              <span style={{ color: sk.value === 0 ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 700 }}>
                {sk.value}%
              </span>
            </div>
            <ProgressBar progress={sk.value} fillColor={getScoreColor(sk.value)} />
          </div>
        ))}
      </div>

      {/* Skill Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Trophy size={16} color={hasMetrics ? 'var(--success)' : 'var(--text-muted)'} style={{ marginTop: '0.15rem' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Strongest Skill</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {strongest.name} {hasMetrics ? `(${strongest.value}%)` : ''}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Target size={16} color={hasMetrics ? 'var(--warning)' : 'var(--text-muted)'} style={{ marginTop: '0.15rem' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Focus Target</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {weakest.name} {hasMetrics ? `(${weakest.value}%)` : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action */}
      <button 
        className="btn btn-primary" 
        style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
        onClick={onPracticeClick}
      >
        View Recommended Training
        <ArrowRight size={16} />
      </button>
    </Card>
  );
};
