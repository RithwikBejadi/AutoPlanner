import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({
  label,
  error,
  hint,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            className="w-5 h-5 rounded border-2 border-outline-variant bg-surface-container appearance-none checked:bg-primary checked:border-primary cursor-pointer transition-all focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-surface"
            aria-invalid={hasError}
            aria-describedby={error ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined}
            {...props}
          />
          <span className="material-symbols-outlined absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" style={{ fontSize: 16 }}>
            check
          </span>
        </div>
        
        {label && (
          <span className="text-sm text-on-surface group-hover:text-primary transition-colors">
            {label}
          </span>
        )}
      </label>
      
      {error && (
        <p id={`${props.id}-error`} className="text-xs text-error flex items-center gap-1 ml-8">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p id={`${props.id}-hint`} className="text-xs text-outline ml-8">
          {hint}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
