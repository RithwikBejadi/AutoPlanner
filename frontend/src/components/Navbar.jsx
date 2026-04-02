import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', exact: true },
  { to: '/teachers', label: 'Teachers', icon: 'school' },
  { to: '/rooms', label: 'Rooms', icon: 'meeting_room' },
  { to: '/subjects', label: 'Subjects', icon: 'menu_book' },
  { to: '/class-groups', label: 'Class Groups', icon: 'groups' },
  { to: '/timeslots', label: 'Time Slots', icon: 'schedule' },
  { to: '/timetable', label: 'Timetable', icon: 'calendar_view_week' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 glass-sidebar flex flex-col py-6 px-4 z-50 border-r border-outline-variant/10">
      <div className="flex items-center gap-3 px-3 mb-10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg glow-secondary flex-shrink-0">
          <span className="material-symbols-outlined text-[#003640]" style={{fontSize: 18}}>auto_awesome</span>
        </div>
        <div>
          <h1 className="font-headline font-extrabold text-primary text-base leading-tight tracking-tight">AutoPlanner</h1>
          <p className="text-[10px] text-on-surface-variant opacity-60 font-medium tracking-widest uppercase">Scheduler v2</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, label, icon, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-surface-container-high text-secondary border border-secondary/20 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:translate-x-0.5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined flex-shrink-0 transition-all"
                  style={{
                    fontSize: 20,
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    color: isActive ? '#4cd7f6' : 'inherit',
                  }}
                >
                  {icon}
                </span>
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_#4cd7f6]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/10 space-y-1">
        <div className="px-3 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0 border border-primary/20">
            <span className="material-symbols-outlined" style={{fontSize: 16, color: '#c4c1fb'}}>person</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-on-surface truncate">Admin</p>
            <p className="text-[10px] text-on-surface-variant truncate">Global Coordinator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
