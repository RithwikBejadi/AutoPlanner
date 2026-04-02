import React, { forwardRef } from 'react';

const Toggle = forwardRef(({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex flex-col gap-1">
        {label && (
          <span className="text-sm font-medium text-on-surface">
            {label}
          </span>
        )}
        {description && (
          <span className="text-xs text-outline">
            {description}
          </span>
        )}
      </div>
      
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-surface ${
          checked ? 'bg-primary' : 'bg-outline-variant'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        {...props}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
});

Toggle.displayName = 'Toggle';
export default Toggle;
