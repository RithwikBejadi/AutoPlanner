import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  required = false,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-on-surface">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <span
            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            style={{ fontSize: 18 }}
          >
            {icon}
          </span>
        )}
        
        <input
          ref={ref}
          className={`input-dark w-full ${icon ? 'pl-10' : ''} ${
            hasError ? 'border-error focus:border-error focus:ring-error/20' : ''
          }`}
          aria-invalid={hasError}
          aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
          {...props}
        />
      </div>
      
      {error && (
        <p id={`${props.id}-error`} className="text-xs text-error flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p id={`${props.id}-hint`} className="text-xs text-outline">
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
