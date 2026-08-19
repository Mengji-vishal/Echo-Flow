import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, style }) => {
  return (
    <div 
      className="fade-in-anim" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100%',
        minHeight: '100%',
        ...style 
      }}
    >
      {children}
    </div>
  );
};
