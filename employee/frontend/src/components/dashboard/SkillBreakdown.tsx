import React from 'react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { mockUserProgress } from '../../../../../shared/api/mockData';
import { ArrowRight, Trophy, Target } from 'lucide-react';

interface SkillBreakdownProps {
  onPracticeClick: () => void;
}

export const SkillBreakdown: React.FC<SkillBreakdownProps> = ({ onPracticeClick }) => {
  const skills = [
    { name: 'Empathy', value: mockUserProgress.metrics.empathy },
    { name: 'Communication', value: mockUserProgress.metrics.listening },
    { name: 'Discovery', value: mockUserProgress.metrics.productKnowledge }, // mapped to productKnowledge to simulate discovery
    { name: 'Objection Handling', value: 64 }, // exact value requested: 64%
    { name: 'Closing', value: mockUserProgress.metrics.closing }
  ];

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>Skill Breakdown</h3>

      {/* Skill progress list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {skills.map(sk => (
          <div key={sk.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{sk.name}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{sk.value}%</span>
            </div>
            <ProgressBar progress={sk.value} fillColor={sk.name === 'Objection Handling' ? 'var(--accent)' : 'var(--primary)'} />
          </div>
        ))}
      </div>

      {/* Skill Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Trophy size={16} color="var(--success)" style={{ marginTop: '0.15rem' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Strongest Skill</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Empathy (92%)</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <Target size={16} color="var(--accent)" style={{ marginTop: '0.15rem' }} />
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Next Focus</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>Objection Handling (64%)</div>
          </div>
        </div>
      </div>

      {/* Call To Action */}
      <button 
        className="btn btn-primary" 
        style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
        onClick={onPracticeClick}
      >
        Practice Now
        <ArrowRight size={16} />
      </button>
    </Card>
  );
};
