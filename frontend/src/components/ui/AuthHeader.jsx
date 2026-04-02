import React from 'react';

/**
 * Simplified header for authentication pages (Sign In/Sign Up)
 * Features: Centered AutoPlanner branding only
 */
export default function AuthHeader() {
  return (
    <header className="bg-white dark:bg-black flex justify-center items-center w-full py-8 px-6 fixed top-0 z-50">
      <div className="flex items-center justify-center">
        <span className="text-xl font-black text-black dark:text-white uppercase tracking-widest font-headline">
          AutoPlanner
        </span>
      </div>
    </header>
  );
}
