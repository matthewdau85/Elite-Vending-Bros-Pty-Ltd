import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';

export default function PermissionCheck({ requiredRole, children }) {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const currentUser = await User.me();
        setUserRole(currentUser.app_role || 'viewer');
      } catch (error) {
        setUserRole('viewer'); // Default to lowest role if not logged in
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  if (isLoading) {
    return null; // Don't render anything while checking permissions
  }

  const hasPermission = () => {
    if (!requiredRole || !userRole) return false;
    
    // Super admin can do anything
    if (userRole === 'admin') return true;

    // Check for exact role match
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };

  return hasPermission() ? <>{children}</> : null;
}