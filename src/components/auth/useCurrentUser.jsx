import { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { logger } from '../lib/logger';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentUser = await User.me();
        setUser(currentUser);
        logger.setUser(currentUser);
      } catch (err) {
        setError(err);
        setUser(null);
        logger.warn('Failed to fetch current user', { error: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const hasRole = (requiredRole) => {
    if (!user || !user.app_role) return false;
    
    const roleHierarchy = {
      'viewer': 0,
      'driver': 1,
      'tech': 1,
      'accountant': 2,
      'ops_lead': 3,
      'admin': 4,
      'owner': 5
    };

    const userLevel = roleHierarchy[user.app_role.toLowerCase()] || 0;
    const requiredLevel = roleHierarchy[requiredRole.toLowerCase()] || 0;

    return userLevel >= requiredLevel;
  };

  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.some(role => hasRole(role));
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  return {
    user,
    loading,
    error,
    hasRole,
    hasAnyRole,
    hasPermission,
    isAuthenticated: !!user,
  };
}