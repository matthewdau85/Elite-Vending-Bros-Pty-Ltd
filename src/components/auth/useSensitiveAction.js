import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import StepUpDialog from './StepUpDialog';
import { useCurrentUser } from './useCurrentUser';
import { AuditLog } from '@/api/entities';
import { logger } from '../lib/logger';

const normalize = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

/**
 * Hook to wrap sensitive actions with mandatory pre-checks, including
 * fine-grained permission evaluation, step-up authentication, and audit logging.
 */
export function useSensitiveAction({
  action,
  actionName,
  getRequiredPermissions = () => [],
  buildAuditContext = () => ({}),
  stepUpTitle,
  elevationDurationMinutes,
}) {
  const {
    user,
    hasAllPermissions,
    requiresTwoFactorFor,
    isElevationActive,
    activateElevation,
    claims,
  } = useCurrentUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingArgs, setPendingArgs] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [pendingPermissions, setPendingPermissions] = useState([]);

  const defaultDuration = claims?.elevation?.defaultDurationMinutes || 15;

  const computedTitle = useMemo(() => {
    if (stepUpTitle) return stepUpTitle;
    if (actionName) {
      return `Confirm ${actionName.replace(/[_-]/g, ' ')}`;
    }
    return 'Enhanced Security Required';
  }, [actionName, stepUpTitle]);

  const resolvePermissions = useCallback((args) => {
    const result = typeof getRequiredPermissions === 'function'
      ? getRequiredPermissions(...(Array.isArray(args) ? args : [args]))
      : getRequiredPermissions;

    return normalize(result);
  }, [getRequiredPermissions]);

  const shouldRequireStepUp = useCallback((permissions) => {
    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Require step-up if any permission explicitly demands it
    const requires = permissions.some((permission) => requiresTwoFactorFor(permission));
    if (requires) {
      return true;
    }

    // If the current elevation window has expired, require step-up for sensitive actions
    return !isElevationActive();
  }, [isElevationActive, requiresTwoFactorFor]);

  const writeAuditEntry = useCallback(async (status, args, error) => {
    if (!actionName) return;

    const metadata = buildAuditContext(...(Array.isArray(args) ? args : [args])) || {};

    try {
      await AuditLog.create?.({
        action: actionName,
        actor_id: user?.id,
        actor_email: user?.email,
        status,
        occurred_at: new Date().toISOString(),
        metadata: {
          ...metadata,
          permissions: pendingPermissions,
          error: error?.message,
        },
      });
    } catch (auditError) {
      logger.warn('Failed to record audit log', {
        action: actionName,
        error: auditError.message,
      });
    }
  }, [actionName, buildAuditContext, pendingPermissions, user?.email, user?.id]);

  const runAction = useCallback(async (args) => {
    if (!action) {
      return;
    }

    setIsExecuting(true);
    try {
      const result = await action(...(Array.isArray(args) ? args : [args]));
      await writeAuditEntry('success', args);
      return result;
    } catch (err) {
      await writeAuditEntry('failed', args, err);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [action, writeAuditEntry]);

  const execute = useCallback(async (...args) => {
    const permissions = resolvePermissions(args);
    setPendingPermissions(permissions);

    if (!hasAllPermissions(permissions)) {
      toast.error('You do not have the required permissions to perform this action.');
      await writeAuditEntry('denied', args, new Error('permission_denied'));
      return;
    }

    if (shouldRequireStepUp(permissions)) {
      setPendingArgs(args);
      setIsDialogOpen(true);
      return;
    }

    return runAction(args);
  }, [hasAllPermissions, resolvePermissions, runAction, shouldRequireStepUp, writeAuditEntry]);

  const onStepUpSuccess = useCallback((token) => {
    activateElevation(token, {
      durationMinutes: elevationDurationMinutes || defaultDuration,
      reason: actionName,
    });
    setIsDialogOpen(false);

    if (pendingArgs) {
      runAction(pendingArgs).catch((err) => {
        toast.error(err.message || 'Failed to complete action');
      }).finally(() => {
        setPendingArgs(null);
      });
    }
  }, [activateElevation, actionName, defaultDuration, elevationDurationMinutes, pendingArgs, runAction]);

  const StepUpPrompt = (
    <StepUpDialog
      open={isDialogOpen}
      onOpenChange={setIsDialogOpen}
      onSuccess={onStepUpSuccess}
      title={computedTitle}
    />
  );

  return {
    execute,
    StepUpPrompt,
    isDialogOpen,
    isExecuting,
  };
}

export default useSensitiveAction;
