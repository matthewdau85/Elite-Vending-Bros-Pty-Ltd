import { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from '@/api/entities';
import { logger } from '../lib/logger';

const ROLE_HIERARCHY = {
  viewer: 0,
  driver: 1,
  tech: 1,
  accountant: 2,
  ops_lead: 3,
  manager: 3,
  operator: 2,
  ops_admin: 4,
  admin: 4,
  owner: 5,
};

const normalizeToArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stepUpSession, setStepUpSession] = useState(null);

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

  const claims = useMemo(() => {
    const rawClaims = user?.permission_claims || user?.claims || {};
    const securityProfile = user?.security_profile || {};

    const capabilitySources = [
      user?.permissions,
      rawClaims?.capabilities,
      rawClaims?.permissions,
      securityProfile?.capabilities,
    ].filter(Boolean);

    const capabilities = new Set();
    capabilitySources.forEach((source) => {
      normalizeToArray(source).forEach((cap) => {
        if (typeof cap === 'string') {
          capabilities.add(cap);
        }
      });
    });

    const scopeAccumulator = {
      tenant: new Set(),
      sites: new Set(),
      routes: new Set(),
    };

    const scopeSources = [
      rawClaims?.scopes,
      securityProfile?.scopes,
      user?.site_scope ? { sites: normalizeToArray(user.site_scope) } : null,
      user?.route_scope ? { routes: normalizeToArray(user.route_scope) } : null,
    ].filter(Boolean);

    scopeSources.forEach((source) => {
      Object.entries(source).forEach(([type, value]) => {
        const normalizedType = ['site', 'sites', 'location', 'locations'].includes(type)
          ? 'sites'
          : ['route', 'routes'].includes(type)
          ? 'routes'
          : type;

        normalizeToArray(value).forEach((scopeValue) => {
          if (scopeValue === '*' || scopeValue === 'all') {
            scopeAccumulator[normalizedType]?.add('*');
          } else if (scopeAccumulator[normalizedType]) {
            scopeAccumulator[normalizedType].add(String(scopeValue));
          }
        });
      });
    });

    const twoFactorRequired = new Set(
      normalizeToArray(rawClaims?.two_factor_required_for || securityProfile?.two_factor_required_for)
        .map((value) => (typeof value === 'string' ? value : null))
        .filter(Boolean)
    );

    const elevationPolicy = securityProfile?.elevation_policy || rawClaims?.elevation || {};

    return {
      capabilities,
      scopes: scopeAccumulator,
      twoFactorRequired,
      elevation: {
        schedule: normalizeToArray(elevationPolicy?.schedule),
        defaultDurationMinutes: elevationPolicy?.default_duration_minutes || elevationPolicy?.duration_minutes || 15,
        activeUntil: elevationPolicy?.active_until,
      },
      raw: rawClaims,
    };
  }, [user]);

  const hasRole = useCallback(
    (requiredRole) => {
      if (!user?.app_role || !requiredRole) return false;

      const userRole = user.app_role.toLowerCase();
      const roleToCheck = requiredRole.toLowerCase();

      const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
      const requiredLevel = ROLE_HIERARCHY[roleToCheck] ?? -1;

      return userLevel >= requiredLevel;
    },
    [user?.app_role]
  );

  const hasAnyRole = useCallback((requiredRoles = []) => {
    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.some((role) => hasRole(role));
  }, [hasRole]);

  const hasPermission = useCallback(
    (permission) => {
      if (!permission) return true;
      return claims.capabilities.has(permission);
    },
    [claims.capabilities]
  );

  const hasAllPermissions = useCallback(
    (permissions = []) => {
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return true;
      }

      return permissions.every((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  const hasAnyPermission = useCallback(
    (permissions = []) => {
      if (!Array.isArray(permissions) || permissions.length === 0) {
        return true;
      }

      return permissions.some((perm) => hasPermission(perm));
    },
    [hasPermission]
  );

  const hasScope = useCallback(
    (scopeType, values, { match = 'any' } = {}) => {
      if (!scopeType) return true;

      const normalizedType = ['site', 'sites', 'location', 'locations'].includes(scopeType)
        ? 'sites'
        : ['route', 'routes'].includes(scopeType)
        ? 'routes'
        : scopeType;

      const scopedValues = claims.scopes[normalizedType];
      if (!scopedValues) return false;

      if (scopedValues.has('*')) {
        return true;
      }

      const valuesToCheck = normalizeToArray(values).map((value) => String(value));

      if (valuesToCheck.length === 0) {
        return scopedValues.size > 0;
      }

      if (match === 'all') {
        return valuesToCheck.every((value) => scopedValues.has(value));
      }

      return valuesToCheck.some((value) => scopedValues.has(value));
    },
    [claims.scopes]
  );

  const requiresTwoFactorFor = useCallback(
    (permission) => {
      if (!permission) return false;
      return claims.twoFactorRequired.has(permission);
    },
    [claims.twoFactorRequired]
  );

  const isWithinScheduledElevation = useCallback(() => {
    const scheduleWindows = claims.elevation.schedule;
    if (!Array.isArray(scheduleWindows) || scheduleWindows.length === 0) {
      return false;
    }

    const now = new Date();
    return scheduleWindows.some((window) => {
      if (!window) return false;
      const start = window.start || window.starts_at || window.from;
      const end = window.end || window.ends_at || window.to;

      if (!start || !end) return false;

      const startDate = new Date(start);
      const endDate = new Date(end);

      return startDate <= now && now <= endDate;
    });
  }, [claims.elevation.schedule]);

  const isElevationActive = useCallback(() => {
    const now = Date.now();
    if (stepUpSession?.expiresAt && new Date(stepUpSession.expiresAt).getTime() > now) {
      return true;
    }

    if (claims.elevation.activeUntil) {
      const expires = new Date(claims.elevation.activeUntil).getTime();
      if (expires > now) {
        return true;
      }
    }

    return isWithinScheduledElevation();
  }, [claims.elevation.activeUntil, isWithinScheduledElevation, stepUpSession?.expiresAt]);

  const activateElevation = useCallback((token, { durationMinutes, reason } = {}) => {
    const minutes = durationMinutes || claims.elevation.defaultDurationMinutes || 15;
    const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    setStepUpSession({
      token,
      expiresAt,
      grantedAt: new Date().toISOString(),
      reason,
    });
  }, [claims.elevation.defaultDurationMinutes]);

  const clearElevation = useCallback(() => {
    setStepUpSession(null);
  }, []);

  return {
    user,
    loading,
    isLoading: loading,
    error,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission,
    hasScope,
    requiresTwoFactorFor,
    isElevationActive,
    activateElevation,
    clearElevation,
    elevationSession: stepUpSession,
    claims,
    isAuthenticated: !!user,
  };
}