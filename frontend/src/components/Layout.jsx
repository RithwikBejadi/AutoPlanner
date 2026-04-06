import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menuEntities = [
  { to: '/teachers', label: 'Teachers', icon: 'person' },
  { to: '/rooms', label: 'Rooms', icon: 'meeting_room' },
  { to: '/subjects', label: 'Subjects', icon: 'menu_book' },
  { to: '/class-groups', label: 'Classes', icon: 'groups' },
];

const menuSystem = [
  { to: '/timeslots', label: 'Time Slots', icon: 'calendar_today' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isFullPageView = ['/', '/timetable/generate', '/timetable'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-body antialiased">
      <header className="bg-white border-b border-outline-variant/20 sticky top-0 z-50">
        <div className="flex justify-between items-center w-full px-6 h-16 max-w-screen-2xl mx-auto font-body antialiased text-sm font-medium">
          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tight text-primary uppercase font-headline">AutoPlanner</span>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink 
                to="/" 
                className={({isActive}) => isActive ? "text-primary border-b-2 border-primary pb-4 -mb-4 font-semibold" : "text-on-surface-variant hover:text-primary transition-colors pb-4 -mb-4"}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/teachers" 
                className={({isActive}) => !isFullPageView ? "text-primary border-b-2 border-primary pb-4 -mb-4 font-semibold" : "text-on-surface-variant hover:text-primary transition-colors pb-4 -mb-4"}
              >
                Constraints
              </NavLink>
              <NavLink 
                to="/timetable/generate" 
                className={({isActive}) => isActive ? "text-primary border-b-2 border-primary pb-4 -mb-4 font-semibold" : "text-on-surface-variant hover:text-primary transition-colors pb-4 -mb-4"}
              >
                Generator
              </NavLink>
              <NavLink 
                to="/timetable" 
                className={({isActive}) => isActive ? "text-primary border-b-2 border-primary pb-4 -mb-4 font-semibold" : "text-on-surface-variant hover:text-primary transition-colors pb-4 -mb-4"}
              >
                Viewers
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant/20">
                  {user.picture ? (
                    <img src={user.picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined flex items-center justify-center w-full h-full text-primary">person</span>
                  )}
                </div>
                
                <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant/20 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2">
                  <div className="px-4 py-2 border-b border-outline-variant/10 mb-2">
                     <p className="text-sm font-bold text-primary truncate">{user.name}</p>
                     <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                  </div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container hover:text-error transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">logout</span> Logout
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto flex w-full flex-1">
        {!isFullPageView && location.pathname !== '/login' && (
          <aside className="w-64 border-r border-outline-variant/30 hidden md:block pt-8 px-4 bg-surface">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-4 px-2">Entities</p>
              {menuEntities.map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to}
                  className={({isActive}) => `flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-all ${isActive ? 'bg-surface-container-highest text-primary font-semibold' : 'font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-12 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-4 px-2">System</p>
              {menuSystem.map(item => (
                <NavLink 
                  key={item.to} 
                  to={item.to}
                  className={({isActive}) => `flex items-center gap-3 px-2 py-2 text-sm rounded-lg transition-all ${isActive ? 'bg-surface-container-highest text-primary font-semibold' : 'font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-primary'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          </aside>
        )}
        
        <section className={`flex-1 ${!isFullPageView && location.pathname !== '/login' ? 'bg-surface-container-lowest p-8' : 'w-full'}`}>
          {children}
        </section>
      </main>
    </div>
  );
}
