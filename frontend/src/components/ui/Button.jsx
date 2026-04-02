import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'bg-surface-container border border-outline-variant/30 text-on-surface hover:bg-surface-container-high hover:border-primary/30 focus:ring-primary/20',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'bg-success/10 border border-success/30 text-success hover:bg-success/20 hover:border-success/50 focus:ring-success/20',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };
  
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
          progress_activity
        </span>
      ) : icon ? (
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
