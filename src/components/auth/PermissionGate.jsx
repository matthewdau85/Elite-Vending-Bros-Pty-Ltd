import React from 'react';
import { useCurrentUser } from './useCurrentUser';

/**
 * Simple permission gate that conditionally renders children
 * @param {object} props
 * @param {string} [props.role] - Required role
 * @param {string[]} [props.roles] - Required roles (any of)
 * @param {string} [props.permission] - Required permission
 * @param {string[]} [props.permissions] - Required permissions (any of)
 * @param {React.ReactNode} [props.fallback=null] - What to render if unauthorized
 * @param {React.ReactNode} props.children - Content to render if authorized
 */
export default function PermissionGate({ 
  role, 
  roles = [], 
  permission,
  permissions = [],
  fallback = null,
  children 
}) {
  const { hasRole, hasAnyRole, hasPermission } = useCurrentUser();

  let isAuthorized = true;

  // Check single role
  if (role && !hasRole(role)) {
    isAuthorized = false;
  }

  // Check multiple roles (any of)
  if (roles.length > 0 && !hasAnyRole(roles)) {
    isAuthorized = false;
  }

  // Check single permission
  if (permission && !hasPermission(permission)) {
    isAuthorized = false;
  }

  // Check multiple permissions (any of)
  if (permissions.length > 0 && !permissions.some(perm => hasPermission(perm))) {
    isAuthorized = false;
  }

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}