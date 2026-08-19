import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Clock, Play, User } from 'lucide-react';

interface PracticeScenarioInfo {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  targetSkill: string;
  customerPersona: string;
}

interface PracticeCardProps {
  scenario: PracticeScenarioInfo;
  onStart: () => void;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({ scenario, onStart }) => {
  const getDiffVariant = (diff: string) => {
    if (diff === 'Easy') return 'success';
    if (diff === 'Medium') return 'warning';
    return 'danger';
  };

  return (
    <Card 
      className="interactive" 
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{scenario.title}</h3>
        <Badge variant={getDiffVariant(scenario.difficulty)} style={{ fontSize: '0.65rem' }}>
          {scenario.difficulty}
        </Badge>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', flexGrow: 1 }}>
        {scenario.description}
      </p>

      <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={14} color="var(--text-muted)" />
          <span>{scenario.duration}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <User size={14} color="var(--text-muted)" />
          <span>{scenario.customerPersona}</span>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        Target skill: <strong style={{ color: 'var(--primary)' }}>{scenario.targetSkill}</strong>
      </div>

      <button 
        className="btn btn-primary" 
        style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
        onClick={onStart}
      >
        <Play size={14} fill="white" />
        Start Practice
      </button>
    </Card>
  );
};
export type { PracticeScenarioInfo };
