import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = true,
  onClick,
  accentColor = null,
  accentHeight = 'h-2'
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-lg shadow-xs overflow-hidden transition-all duration-200 flex flex-col ${
        hover ? 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {accentColor && (
        <div
          className={`w-full ${accentHeight} shrink-0 ${accentColor.startsWith('bg-') ? accentColor : ''}`}
          style={!accentColor.startsWith('bg-') ? { backgroundColor: accentColor } : undefined}
        />
      )}
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-5 pb-3 border-b border-slate-100 ${className}`}>{children}</div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 ${className}`}>
    {children}
  </div>
);

export default Card;
