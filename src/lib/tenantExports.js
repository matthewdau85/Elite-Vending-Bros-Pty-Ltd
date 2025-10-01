import { base44 } from '@/api/base44Client';
import {
  withTenantFilters,
  ensureTenantResidencyConfig,
  validateResidencyTarget,
  requireTenantContext,
  TenantAccessError,
} from './tenantContext';

const SUPPORTED_EXPORT_FORMATS = new Set(['jsonl', 'parquet']);

export async function createTenantEntityExport({
  entityName,
  format = 'jsonl',
  filters = {},
  exportName,
}) {
  if (!entityName) {
    throw new Error('Entity name is required for export');
  }

  const normalizedFormat = String(format).toLowerCase();
  if (!SUPPORTED_EXPORT_FORMATS.has(normalizedFormat)) {
    throw new Error(`Unsupported export format: ${format}`);
  }

  const entity = base44.entities?.[entityName];
  if (!entity || typeof entity.export !== 'function') {
    throw new Error(`Entity ${entityName} does not support exports`);
  }

  requireTenantContext();

  const scopedFilters = withTenantFilters(filters);
  const residency = ensureTenantResidencyConfig({});

  const payload = {
    format: normalizedFormat,
    filters: scopedFilters,
    residency,
    export_name: exportName || `${entityName}_${normalizedFormat}_${Date.now()}`,
  };

  let exportResponse;
  try {
    const response = await entity.export(payload);
    exportResponse = response?.data ?? response;
  } catch (error) {
    if (error instanceof TenantAccessError) {
      throw error;
    }
    throw new Error(error?.message || 'Failed to initiate export');
  }

  if (exportResponse?.residency) {
    validateResidencyTarget(exportResponse.residency);
  }

  const downloadUrl =
    exportResponse?.signed_url ||
    exportResponse?.download_url ||
    exportResponse?.url ||
    exportResponse?.link ||
    null;

  if (!downloadUrl) {
    throw new Error('Export response did not include a signed download URL');
  }

  return {
    downloadUrl,
    format: normalizedFormat,
    residency: exportResponse?.residency || residency,
    headers: exportResponse?.headers || {},
    expiresAt: exportResponse?.expires_at || null,
  };
}

export function getSupportedExportFormats() {
  return Array.from(SUPPORTED_EXPORT_FORMATS);
}

