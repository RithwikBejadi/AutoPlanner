import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Header component for authenticated pages
 * Features: AutoPlanner branding, navigation tabs, user controls
 */
export default function Header({ user, onLogout, hideNav = false }) {
  return (
    <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 h-16 max-w-screen-2xl mx-auto font-body antialiased text-sm font-medium">
        <div className="flex items-center gap-8">
          <span className="text-lg font-bold tracking-tight text-black dark:text-white uppercase font-headline">AutoPlanner</span>
          
          {!hideNav && (
            <nav className="hidden md:flex items-center gap-6">
              <NavLink 
                to="/" 
                className={({isActive}) => isActive 
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-4 -mb-4 transition-colors" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors pb-4 -mb-4"}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/teachers" 
                className={({isActive}) => isActive 
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-4 -mb-4 transition-colors" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors pb-4 -mb-4"}
              >
                Constraints
              </NavLink>
              <NavLink 
                to="/timetable/generate" 
                className={({isActive}) => isActive 
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-4 -mb-4 transition-colors" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors pb-4 -mb-4"}
              >
                Generator
              </NavLink>
              <NavLink 
                to="/timetable" 
                className={({isActive}) => isActive 
                  ? "text-black dark:text-white border-b-2 border-black dark:border-white pb-4 -mb-4 transition-colors" 
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors pb-4 -mb-4"}
              >
                Viewers
              </NavLink>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20">
                {user.picture ? (
                  <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined flex items-center justify-center w-full h-full text-primary">
                    person
                  </span>
                )}
              </div>
              
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-outline-variant/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
                <div className="px-4 py-2 border-b border-outline-variant/10 mb-2">
                  <p className="text-sm font-bold text-primary truncate">{user.name}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                </div>
                <button 
                  onClick={onLogout} 
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container hover:text-error transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span> 
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
