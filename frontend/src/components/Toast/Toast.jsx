import React, { useEffect, useState } from 'react';

export default function Toast({ id, message, type, duration, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  };
  
  const styles = {
    success: 'bg-success/10 border-success/30 text-success',
    error: 'bg-error/10 border-error/30 text-error',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    info: 'bg-secondary/10 border-secondary/30 text-secondary',
  };
  
  const icon = icons[type] || icons.info;
  const style = styles[type] || styles.info;
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };
  
  return (
    <div
      className={`flex items-center gap-3 min-w-[320px] max-w-md p-4 rounded-xl border ${style} shadow-lg backdrop-blur-sm transition-all duration-300 ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      role="alert"
    >
      <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 20 }}>
        {icon}
      </span>
      
      <p className="flex-1 text-sm font-medium">{message}</p>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
          close
        </span>
      </button>
    </div>
  );
}
