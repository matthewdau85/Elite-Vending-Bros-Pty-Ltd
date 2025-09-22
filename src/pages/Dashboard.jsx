import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '../components/lib/logger';

/**
 * A redirect component to fix case-sensitivity issues in navigation.
 * Any links or programmatic navigation to "/Dashboard" will be caught
 * by this component and redirected to the correct "/dashboard" path.
 */
export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    logger.warn('Redirecting from incorrect /Dashboard path', {
      from: window.location.pathname,
      to: '/dashboard',
    });
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Render a simple loading state while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}