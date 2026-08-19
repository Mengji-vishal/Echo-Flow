import React from 'react';
import { Card } from '../common/Card';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CoachingRecommendationProps {
  onPracticeClick: () => void;
}

export const CoachingRecommendation: React.FC<CoachingRecommendationProps> = ({ onPracticeClick }) => {
  return (
    <Card 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem',
        borderLeft: '4px solid var(--primary)',
        background: 'linear-gradient(90deg, rgba(79, 70, 229, 0.02) 0%, rgba(255, 255, 255, 0.0) 100%)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={18} color="var(--primary)" />
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>AI-Coach Insights</h4>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        "Your objection handling has improved, but price-related objections remain your biggest opportunity. Let's practice active listening during pricing disputes."
      </p>
      <div>
        <button 
          className="btn btn-secondary" 
          style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
          onClick={onPracticeClick}
        >
          Practice this skill
          <ArrowRight size={14} />
        </button>
      </div>
    </Card>
  );
};
