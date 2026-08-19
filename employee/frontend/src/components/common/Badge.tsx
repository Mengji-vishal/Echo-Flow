import React from 'react';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'info', children, style }) => {
  return (
    <span className={`badge-tag badge-tag-${variant}`} style={style}>
      {children}
    </span>
  );
};
