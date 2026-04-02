import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Dark mode toggle button
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? 'light_mode' : 'dark_mode'}
    </button>
  );
}
