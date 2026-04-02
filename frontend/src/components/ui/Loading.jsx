import React from 'react';

export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <span className={`material-symbols-outlined animate-spin text-primary ${sizeClass}`} style={{ fontSize: 'inherit' }}>
        progress_activity
      </span>
    </div>
  );
}

export function LoadingSkeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    button: 'h-10 rounded-xl',
    avatar: 'h-12 w-12 rounded-full',
    card: 'h-32 rounded-xl',
  };
  
  const variantClass = variants[variant] || variants.text;
  
  return (
    <div className={`bg-surface-container-high animate-pulse ${variantClass} ${className}`} />
  );
}

export function LoadingCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="title" className="w-1/3" />
          <LoadingSkeleton className="w-1/2" />
        </div>
      </div>
      <LoadingSkeleton className="w-full" />
      <LoadingSkeleton className="w-3/4" />
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-sm text-on-surface">{message}</p>
    </div>
  );
}
