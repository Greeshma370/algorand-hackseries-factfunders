import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  border?: boolean;
  hoverEffect?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  elevation = 'md',
  rounded = 'md',
  border = false,
  hoverEffect = false,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8'
  };

  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  const borderClass = border ? 'border border-gray-200' : '';
  const hoverClass = hoverEffect ? 'transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg' : '';

  return (
    <div
      className={`
        bg-white
        ${paddingClasses[padding]}
        ${elevationClasses[elevation]}
        ${roundedClasses[rounded]}
        ${borderClass}
        ${hoverClass}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;