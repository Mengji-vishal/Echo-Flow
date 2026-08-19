import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  color?: string;
  count?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isActive, 
  color = 'var(--primary)', 
  count = 12 
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '4px', 
        height: '40px',
        width: '100%',
        padding: '0.5rem 0'
      }}
    >
      {[...Array(count)].map((_, i) => {
        // Create unique delays for each bar
        const delay = `${i * 0.08}s`;
        const height = isActive ? '20px' : '4px';

        return (
          <div
            key={i}
            className={isActive ? 'wave-bar-anim' : ''}
            style={{
              width: '3px',
              height: height,
              backgroundColor: color,
              borderRadius: 'var(--radius-full)',
              animationDelay: delay,
              transition: 'height var(--transition-normal)'
            }}
          />
        );
      })}
    </div>
  );
};
