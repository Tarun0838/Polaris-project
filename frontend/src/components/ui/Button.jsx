import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-slate-900 text-white hover:bg-slate-800 shadow-xs border border-transparent';
      case 'polar':
        return 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs border border-blue-700';
      case 'secondary':
        return 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs';
      case 'outline':
        return 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300';
      case 'ghost':
        return 'bg-transparent text-slate-600 hover:bg-slate-100 border-none';
      case 'danger':
        return 'bg-rose-600 text-white hover:bg-rose-700';
      case 'success':
        return 'bg-emerald-600 text-white hover:bg-emerald-700';
      default:
        return 'bg-slate-900 text-white hover:bg-slate-800';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs';
      case 'lg':
        return 'px-5 py-2.5 text-base';
      case 'md':
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {Icon && <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />}
      {children}
    </button>
  );
};

export default Button;
