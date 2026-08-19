import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, style, ...props }) => {
  return (
    <button className={`btn btn-${variant}`} style={style} {...props}>
      {children}
    </button>
  );
};
