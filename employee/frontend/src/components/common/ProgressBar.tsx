import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  style?: React.CSSProperties;
  fillColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, style, fillColor }) => {
  return (
    <div className="progress-bar-track" style={style}>
      <div 
        className="progress-bar-fill" 
        style={{ 
          width: `${Math.max(0, Math.min(100, progress))}%`,
          backgroundColor: fillColor
        }} 
      />
    </div>
  );
};
