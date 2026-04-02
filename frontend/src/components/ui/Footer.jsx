import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component with branding and links
 * Features: "Precision Utility" tagline, Privacy/Terms/Support links
 */
export default function Footer({ fixed = false }) {
  const footerClass = fixed 
    ? "bg-white dark:bg-black fixed bottom-0 w-full flex justify-between items-center px-12 py-6 z-40"
    : "bg-white dark:bg-black flex justify-between items-center px-12 py-6 w-full";

  return (
    <footer className={footerClass}>
      <div className="text-[10px] uppercase tracking-widest font-medium text-gray-400 dark:text-gray-600">
        © 2024 AutoPlanner. Precision Utility.
      </div>
      <div className="flex gap-8">
        <Link 
          to="/privacy" 
          className="text-[10px] uppercase tracking-widest font-medium text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white transition-all duration-300"
        >
          Privacy
        </Link>
        <Link 
          to="/terms" 
          className="text-[10px] uppercase tracking-widest font-medium text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white transition-all duration-300"
        >
          Terms
        </Link>
        <a 
          href="#" 
          className="text-[10px] uppercase tracking-widest font-medium text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white transition-all duration-300"
        >
          Support
        </a>
      </div>
    </footer>
  );
}
