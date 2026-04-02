import React from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`card ${hover ? 'hover:shadow-lg hover:border-primary/20 cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
