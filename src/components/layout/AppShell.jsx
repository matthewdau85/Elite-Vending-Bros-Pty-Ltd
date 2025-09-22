import React from 'react';
import Sidebar from '../navigation/Sidebar';

export default function AppShell({ children, currentPageName }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          <div className="md:pl-0 pl-16">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}