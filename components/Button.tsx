import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 border text-base font-bold uppercase tracking-wider transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow font-display";
  
  const variants = {
    primary: "border-transparent text-brand-dark bg-brand-yellow hover:bg-white hover:text-brand-dark shadow-lg shadow-brand-yellow/20",
    secondary: "border-transparent text-white bg-brand-gray hover:bg-brand-dark shadow-lg",
    outline: "border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark bg-transparent",
    ghost: "border-transparent text-gray-400 hover:text-white bg-transparent"
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};