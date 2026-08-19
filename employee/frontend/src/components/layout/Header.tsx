import React from 'react';
import { Flame } from 'lucide-react';
import { mockUserProgress } from '../../../../../shared/api/mockData';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        marginBottom: '2rem'
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{title}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>

      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: '0.5rem 1rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <Flame size={20} color="var(--warning)" fill="var(--warning)" />
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: '1.2' }}>{mockUserProgress.streak} Days</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Practice Streak</div>
        </div>
      </div>
    </header>
  );
};
