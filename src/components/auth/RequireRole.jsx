import React, { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';
import { logger } from '../lib/logger';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

const normalizeToArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export default function RequireRole({
  requiredRole,
  roles,
  anyRole,
  anyRoles,
  anyPermissions,
  allPermissions,
  requireScope,
  requireScopes,
  fallback = null,
  children,
}) {
  const {
    user,
    isLoading,
    hasRole,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    hasScope,
  } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const userRole = user?.app_role?.toLowerCase() || user?.role?.toLowerCase();

  const requiredRoles = useMemo(() => {
    const directRoles = normalizeToArray(requiredRole);
    const extraRoles = normalizeToArray(roles);
    return [...directRoles, ...extraRoles];
  }, [requiredRole, roles]);

  const optionalRoles = useMemo(() => {
    return [...normalizeToArray(anyRole), ...normalizeToArray(anyRoles)];
  }, [anyRole, anyRoles]);

  const requiredAllPermissions = normalizeToArray(allPermissions);
  const optionalPermissions = normalizeToArray(anyPermissions);

  const scopeRequirements = useMemo(() => {
    const scopes = normalizeToArray(requireScopes);
    if (requireScope) {
      scopes.push(requireScope);
    }
    return scopes;
  }, [requireScope, requireScopes]);

  const meetsRoleRequirement = requiredRoles.length === 0 || requiredRoles.some((role) => hasRole(role));
  const meetsOptionalRoleRequirement = optionalRoles.length === 0 || hasAnyRole(optionalRoles);
  const meetsAllPermissions = hasAllPermissions(requiredAllPermissions);
  const meetsAnyPermission = hasAnyPermission(optionalPermissions);

  const scopeFailures = scopeRequirements.filter((requirement) => {
    if (!requirement) return false;
    const { type, values, match } = requirement;
    return !hasScope(type, values, { match });
  });

  const hasPermission =
    meetsRoleRequirement &&
    meetsOptionalRoleRequirement &&
    meetsAllPermissions &&
    meetsAnyPermission &&
    scopeFailures.length === 0;

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
      requiredRoles,
      optionalRoles,
      requiredAllPermissions,
      optionalPermissions,
      scopeFailures,
      page: window.location.pathname
    });

    const accessDeniedCard = (
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
              {requiredRoles.length > 0 && (
                <> Access requires <span className="font-semibold">{requiredRoles.join(', ')}</span> or higher.</>
              )}
              {optionalPermissions.length > 0 && (
                <> Additional permissions needed: <span className="font-semibold">{optionalPermissions.join(', ')}</span>.</>
              )}
            </p>
            {scopeFailures.length > 0 && (
              <p className="text-xs text-red-500 mt-3">
                Missing scope access for: {scopeFailures.map((scope, index) => {
                  const label = scope?.type ? `${scope.type}` : 'scope';
                  return <span key={`${label}-${index}`} className="font-semibold">{label}</span>;
                }).reduce((prev, curr) => (prev === null ? [curr] : [...prev, ', ', curr]), null)}.
              </p>
            )}
            <p className="text-xs text-red-500 mt-4">
              If you believe this is an error, please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );

    return fallback ? fallback : accessDeniedCard;
  }

  return children;
}