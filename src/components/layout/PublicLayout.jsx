import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link to="/docs" className="flex items-center space-x-2">
            <Coffee className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-slate-800">Elite Vending Support</span>
          </Link>
          <nav>
            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600">
              Operator Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          {children}
        </div>
      </main>
      <footer className="py-6 border-t bg-white">
        <div className="container text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} The Elite Vending Bros Pty Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}