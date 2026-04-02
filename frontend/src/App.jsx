import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Rooms from './pages/Rooms';
import Subjects from './pages/Subjects';
import ClassGroups from './pages/ClassGroups';
import Timeslots from './pages/Timeslots';
import Timetable from './pages/Timetable';

function AppLayout() {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex font-sans selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-x-hidden pt-8 pb-12 px-8 lg:px-12 xl:px-16 transition-all duration-300">
         <ErrorBoundary>
           <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/class-groups" element={<ClassGroups />} />
              <Route path="/timeslots" element={<Timeslots />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="*" element={<Navigate to="/" replace />} />
           </Routes>
         </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppProvider>
                  <AppLayout />
                </AppProvider>
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
