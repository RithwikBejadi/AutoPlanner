import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import Rooms from './pages/Rooms';
import Subjects from './pages/Subjects';
import ClassGroups from './pages/ClassGroups';
import Timeslots from './pages/Timeslots';
import Timetable from './pages/Timetable';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/class-groups" element={<ClassGroups />} />
            <Route path="/timeslots" element={<Timeslots />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
