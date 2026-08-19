import React from 'react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

interface PracticeScoreProps {
  score: number;
  previousScore?: number;
  breakdown: {
    empathy: number;
    communication: number;
    discovery: number;
    objectionHandling: number;
    solutionOffering: number;
    closing: number;
    compliance: number;
  };
}

export const PracticeScore: React.FC<PracticeScoreProps> = ({ score, previousScore = 74, breakdown }) => {
  const getScoreColor = (val: number) => {
    if (val >= 85) return 'var(--success)';
    if (val >= 70) return 'var(--primary)';
    return 'var(--warning)';
  };

  const improvement = score - previousScore;

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Session Score</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Based on real-time conversational analysis</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(score) }}>{score}%</div>
          {improvement !== 0 && (
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: improvement > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {improvement > 0 ? `↑ +${improvement}%` : `↓ ${improvement}%`} vs last score
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.25rem' }}>Skill Breakdown</h4>
        {Object.entries(breakdown).map(([key, val]) => (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{val}%</span>
            </div>
            <ProgressBar progress={val} fillColor={getScoreColor(val)} />
          </div>
        ))}
      </div>
    </Card>
  );
};
export type { PracticeScoreProps };
