import React from 'react';
import { Card } from '../common/Card';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CoachingRecommendationProps {
  onPracticeClick: () => void;
  focusAreas?: string[];
}

export const CoachingRecommendation: React.FC<CoachingRecommendationProps> = ({ onPracticeClick, focusAreas }) => {
  const hasFocus = focusAreas && focusAreas.length > 0;

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
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>AI-Coach Insights</h4>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        {hasFocus
          ? `Identified focus target: "${focusAreas[0]}". Strengthening this competency will improve your overall QA rating.`
          : 'Complete an assessment call to receive personalized AI coaching insights and tailored improvement recommendations.'}
      </p>
      {hasFocus && (
        <div>
          <button 
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            onClick={onPracticeClick}
          >
            View Personalized Training
            <ArrowRight size={14} />
          </button>
        </div>
      )}
    </Card>
  );
};
