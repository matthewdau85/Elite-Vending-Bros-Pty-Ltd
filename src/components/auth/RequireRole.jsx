import React from 'react';
import { useCurrentUser } from './useCurrentUser';
import { logger } from '../lib/logger';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const roleHierarchy = {
  'viewer': 0,
  'driver': 1,
  'tech': 1,
  'accountant': 2,
  'ops_lead': 3,
  'admin': 4,
  'owner': 5
};

export default function RequireRole({ requiredRole, children }) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const userRole = user?.app_role?.toLowerCase() || user?.role?.toLowerCase();
  const userLevel = roleHierarchy[userRole] ?? -1;
  const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] ?? 99;
  
  const hasPermission = userLevel >= requiredLevel;

  if (!user) {
    // This case should be handled by the main layout's auth check,
    // but as a fallback, redirect to the dashboard which will trigger login.
    logger.warn('RequireRole: No user found, redirecting.', { requiredRole });
    return <Navigate to="/dashboard" replace />;
  }

  if (!hasPermission) {
    logger.warn('Access Denied', {
      userId: user.id,
      userRole,
      requiredRole,
      page: window.location.pathname
    });

    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-lg text-center bg-red-50 border-red-200">
          <CardHeader>
            <div className="mx-auto w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="mt-4 text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You do not have the necessary permissions to view this page.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Your current role is <span className="font-semibold">{userRole || 'not assigned'}</span>. 
              Access requires the <span className="font-semibold">{requiredRole}</span> role or higher.
            </p>
            <p className="text-xs text-red-500 mt-4">
              If you believe this is an error, please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}