import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/teachers', label: 'Teachers' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/subjects', label: 'Subjects' },
  { to: '/class-groups', label: 'Class Groups' },
  { to: '/timeslots', label: 'Time Slots' },
  { to: '/timetable', label: 'Timetable' },
];

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto flex flex-wrap items-center gap-1 px-6 py-3">
        <span className="font-bold text-xl mr-6 tracking-tight">AutoPlanner</span>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                isActive ? 'bg-white text-blue-700' : 'hover:bg-blue-600'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
