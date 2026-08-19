import React from 'react';
import { Card } from '../common/Card';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface PracticeFeedbackProps {
  feedback: {
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}

export const PracticeFeedback: React.FC<PracticeFeedbackProps> = ({ feedback }) => {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1.2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <Sparkles size={18} color="var(--primary)" />
        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>AI Coach Feedback</h3>
      </div>

      <div>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.5rem' }}>Session Summary</h4>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.5', fontStyle: 'italic', backgroundColor: 'var(--surface-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          "{feedback.summary}"
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Strengths */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Key Strengths
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {feedback.strengths.map((str, idx) => (
              <li key={idx} style={{ lineHeight: '1.4' }}>{str}</li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
            <AlertCircle size={16} /> Focus Areas
          </h4>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {feedback.improvements.map((imp, idx) => (
              <li key={idx} style={{ lineHeight: '1.4' }}>{imp}</li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};
