import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ interactive = false, children, className = '', style, ...props }) => {
  return (
    <div 
      className={`card-panel ${interactive ? 'interactive' : ''} ${className}`}
      style={style} 
      {...props}
    >
      {children}
    </div>
  );
};
