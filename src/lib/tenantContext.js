import { useSyncExternalStore } from 'react';

class TenantAccessError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'TenantAccessError';
    this.details = details;
  }
}

const tenantState = {
  orgId: null,
  orgUnitId: null,
  residency: null,
  initialized: false,
};

const subscribers = new Set();

function emitChange() {
  subscribers.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error('Tenant context subscriber failed', error);
    }
  });
}

function cloneResidency(residency) {
  if (!residency) return null;
  return {
    ...residency,
    region: residency.region ?? residency.region_code ?? residency.primary_region ?? residency.data_region ?? null,
    storageBucket:
      residency.storageBucket ??
      residency.bucket ??
      residency.storage_bucket ??
      residency.object_store ??
      residency.s3_bucket ??
      null,
    kmsKey:
      residency.kmsKey ??
      residency.kms_key ??
      residency.encryptionKey ??
      residency.encryption_key ??
      residency.kms ??
      null,
  };
}

function extractOrgId(source) {
  if (!source) return null;
  return (
    source.org_id ??
    source.organization_id ??
    source.orgId ??
    source.organizationId ??
    source.tenant_id ??
    source.tenantId ??
    null
  );
}

function extractOrgUnitId(source) {
  if (!source) return null;
  return (
    source.org_unit_id ??
    source.orgUnitId ??
    source.org_unit ??
    source.organization_unit_id ??
    source.organizationUnitId ??
    null
  );
}

function setTenantState({ orgId, orgUnitId, residency }) {
  tenantState.orgId = orgId ?? null;
  tenantState.orgUnitId = orgUnitId ?? null;
  tenantState.residency = residency ? cloneResidency(residency) : null;
  tenantState.initialized = Boolean(orgId);
  emitChange();
}

export function setTenantContextFromSession(session) {
  if (!session) {
    clearTenantContext();
    return;
  }

  const orgId = extractOrgId(session);
  const orgUnitId = extractOrgUnitId(session);
  const residency = session.data_residency ?? session.residency ?? session.tenant_residency ?? null;

  setTenantState({ orgId, orgUnitId, residency });
}

export function setTenantContextFromUser(user) {
  if (!user) {
    clearTenantContext();
    return;
  }

  const orgId = extractOrgId(user);
  const orgUnitId = extractOrgUnitId(user);
  const residency = user.data_residency ?? user.residency ?? user.tenant_residency ?? null;

  setTenantState({ orgId, orgUnitId, residency });
}

export function clearTenantContext() {
  tenantState.orgId = null;
  tenantState.orgUnitId = null;
  tenantState.residency = null;
  tenantState.initialized = false;
  emitChange();
}

export function hasTenantContext() {
  return Boolean(tenantState.orgId);
}

export function getTenantContext() {
  return {
    orgId: tenantState.orgId,
    orgUnitId: tenantState.orgUnitId,
    residency: tenantState.residency ? { ...tenantState.residency } : null,
    initialized: tenantState.initialized,
  };
}

export function requireTenantContext() {
  if (!tenantState.orgId) {
    throw new TenantAccessError('Tenant context is not initialized');
  }
  return getTenantContext();
}

export function withTenantScope(payload = {}) {
  const ctx = requireTenantContext();
  const currentOrgId = extractOrgId(payload);
  if (currentOrgId && currentOrgId !== ctx.orgId) {
    throw new TenantAccessError('Cross-tenant mutation rejected', {
      expectedOrgId: ctx.orgId,
      receivedOrgId: currentOrgId,
    });
  }

  const currentOrgUnitId = extractOrgUnitId(payload);
  if (ctx.orgUnitId && currentOrgUnitId && currentOrgUnitId !== ctx.orgUnitId) {
    throw new TenantAccessError('Cross-unit mutation rejected', {
      expectedOrgUnitId: ctx.orgUnitId,
      receivedOrgUnitId: currentOrgUnitId,
    });
  }

  return {
    ...payload,
    org_id: ctx.orgId,
    ...(ctx.orgUnitId ? { org_unit_id: ctx.orgUnitId } : {}),
  };
}

export function withTenantFilters(filters = {}) {
  const ctx = requireTenantContext();
  const nextFilters = { ...filters };
  const existingOrgId = extractOrgId(nextFilters);
  if (existingOrgId && existingOrgId !== ctx.orgId) {
    throw new TenantAccessError('Cross-tenant query rejected', {
      expectedOrgId: ctx.orgId,
      receivedOrgId: existingOrgId,
    });
  }
  nextFilters.org_id = ctx.orgId;

  const existingOrgUnitId = extractOrgUnitId(nextFilters);
  if (ctx.orgUnitId) {
    if (existingOrgUnitId && existingOrgUnitId !== ctx.orgUnitId) {
      throw new TenantAccessError('Cross-unit query rejected', {
        expectedOrgUnitId: ctx.orgUnitId,
        receivedOrgUnitId: existingOrgUnitId,
      });
    }
    nextFilters.org_unit_id = ctx.orgUnitId;
  }

  return nextFilters;
}

export function assertTenantAccess(record, entityName = 'Entity') {
  if (!record || typeof record !== 'object') {
    return record;
  }
  const ctx = requireTenantContext();

  const recordOrgId = extractOrgId(record);
  if (recordOrgId && recordOrgId !== ctx.orgId) {
    throw new TenantAccessError(`Cross-tenant access rejected for ${entityName}`, {
      expectedOrgId: ctx.orgId,
      receivedOrgId: recordOrgId,
      entityName,
    });
  }

  const recordOrgUnitId = extractOrgUnitId(record);
  if (ctx.orgUnitId && recordOrgUnitId && recordOrgUnitId !== ctx.orgUnitId) {
    throw new TenantAccessError(`Cross-unit access rejected for ${entityName}`, {
      expectedOrgUnitId: ctx.orgUnitId,
      receivedOrgUnitId: recordOrgUnitId,
      entityName,
    });
  }

  return record;
}

export function sanitizeTenantResults(result, entityName = 'Entity') {
  if (!result) return result;

  if (Array.isArray(result)) {
    return result.map((item) => sanitizeTenantResults(item, entityName));
  }

  if (typeof result === 'object') {
    if (Array.isArray(result.data)) {
      return {
        ...result,
        data: result.data.map((item) => sanitizeTenantResults(item, entityName)),
      };
    }

    return assertTenantAccess(result, entityName);
  }

  return result;
}

export function ensureTenantResidencyConfig(overrides = {}) {
  const ctx = requireTenantContext();
  const tenantResidency = tenantState.residency ? { ...tenantState.residency } : null;
  const overrideResidency = overrides ? cloneResidency(overrides) : null;
  const effectiveResidency = {
    ...tenantResidency,
    ...overrideResidency,
  };

  if (!effectiveResidency || !effectiveResidency.region) {
    throw new TenantAccessError('Tenant residency configuration is missing a region');
  }

  if (tenantResidency?.region && effectiveResidency.region !== tenantResidency.region) {
    throw new TenantAccessError('Residency region override does not match tenant configuration', {
      expectedRegion: tenantResidency.region,
      receivedRegion: effectiveResidency.region,
    });
  }

  if (!effectiveResidency.storageBucket) {
    throw new TenantAccessError('Tenant residency configuration is missing a storage bucket');
  }

  if (!effectiveResidency.kmsKey) {
    throw new TenantAccessError('Tenant residency configuration is missing an encryption key');
  }

  return {
    region: effectiveResidency.region,
    bucket: effectiveResidency.storageBucket,
    kms_key: effectiveResidency.kmsKey,
  };
}

export function validateResidencyTarget(residency) {
  if (!residency) return null;
  const normalized = cloneResidency(residency);
  const ctx = requireTenantContext();
  if (normalized.region && ctx.residency?.region && normalized.region !== ctx.residency.region) {
    throw new TenantAccessError('Residency validation failed: region mismatch', {
      expectedRegion: ctx.residency.region,
      receivedRegion: normalized.region,
    });
  }
  if (normalized.storageBucket && ctx.residency?.storageBucket && normalized.storageBucket !== ctx.residency.storageBucket) {
    throw new TenantAccessError('Residency validation failed: storage bucket mismatch', {
      expectedBucket: ctx.residency.storageBucket,
      receivedBucket: normalized.storageBucket,
    });
  }
  if (normalized.kmsKey && ctx.residency?.kmsKey && normalized.kmsKey !== ctx.residency.kmsKey) {
    throw new TenantAccessError('Residency validation failed: encryption key mismatch', {
      expectedKey: ctx.residency.kmsKey,
      receivedKey: normalized.kmsKey,
    });
  }
  return normalized;
}

function subscribe(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

function getSnapshot() {
  return getTenantContext();
}

export function useTenantContext() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export { TenantAccessError };

