import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { TopNavigation } from '../components/TopNavigation';
import { useStudySphere } from '../context/StudySphereContext';

export const DashboardLayout: React.FC = () => {
  const { isSidebarOpen } = useStudySphere();
  const location = useLocation();

  // If the user lands on bare / or /dashboard, we render the page
  return (
    <div className="bg-academic-black text-academic-cream h-full w-full flex overflow-hidden font-sans select-none relative">
      {/* Decorative Gradients for Frosted Glass Backdrop */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none z-0"></div>

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Navbar */}
        <TopNavigation />

        {/* Viewport Area */}
        <main className={`flex-1 flex flex-col bg-transparent animate-fade-in relative z-10 ${
          location.pathname === '/chat' ? 'overflow-hidden min-h-0 p-0' : 'overflow-y-auto p-6 md:p-8'
        }`}>
          {/* Outlet for Nested Pages */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};
