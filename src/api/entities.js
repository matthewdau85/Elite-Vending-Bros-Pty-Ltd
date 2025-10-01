import { base44 } from './base44Client';
import {
  withTenantFilters,
  withTenantScope,
  sanitizeTenantResults,
  requireTenantContext,
  ensureTenantResidencyConfig,
  validateResidencyTarget,
} from '@/lib/tenantContext';

const rawEntities = base44.entities || {};

const applyTenantFiltersToOptions = (options = {}) => {
  const scopedOptions = { ...options };
  if ('filters' in scopedOptions) {
    scopedOptions.filters = withTenantFilters(scopedOptions.filters || {});
  } else if ('filter' in scopedOptions) {
    scopedOptions.filter = withTenantFilters(scopedOptions.filter || {});
  } else {
    scopedOptions.filter = withTenantFilters({});
  }
  return scopedOptions;
};

const wrapEntity = (entityName, entity) => {
  if (!entity || typeof entity !== 'object') {
    return entity;
  }

  return new Proxy(entity, {
    get(target, prop, receiver) {
      if (prop === 'list') {
        return async (...args) => {
          requireTenantContext();
          let result;
          if (args.length === 0) {
            result = await target.list(applyTenantFiltersToOptions({}));
          } else if (typeof args[0] === 'string') {
            const [order, options = {}] = args;
            const scopedOptions = applyTenantFiltersToOptions(options);
            result = await target.list(order, scopedOptions, ...args.slice(2));
          } else {
            const [options = {}, ...rest] = args;
            const scopedOptions = applyTenantFiltersToOptions(options);
            result = await target.list(scopedOptions, ...rest);
          }
          return sanitizeTenantResults(result, entityName);
        };
      }

      if (prop === 'create') {
        return async (payload = {}, ...rest) => {
          requireTenantContext();
          const scopedPayload = withTenantScope(payload);
          const result = await target.create(scopedPayload, ...rest);
          return sanitizeTenantResults(result, entityName);
        };
      }

      if (prop === 'update') {
        return async (...args) => {
          requireTenantContext();
          if (args.length === 1 && typeof args[0] === 'object') {
            const scopedPayload = withTenantScope(args[0]);
            const result = await target.update(scopedPayload);
            return sanitizeTenantResults(result, entityName);
          }
          if (args.length >= 2) {
            const [id, payload, ...rest] = args;
            const scopedPayload = withTenantScope(payload || {});
            const result = await target.update(id, scopedPayload, ...rest);
            return sanitizeTenantResults(result, entityName);
          }
          return target.update(...args);
        };
      }

      if (prop === 'export') {
        return async (...args) => {
          requireTenantContext();
          const [options = {}, ...rest] = args;
          const { residency, data_residency, ...restOptions } = options || {};
          const scopedOptions = applyTenantFiltersToOptions(restOptions);
          const residencyConfig = ensureTenantResidencyConfig(residency || data_residency || {});
          const result = await target.export(
            {
              ...scopedOptions,
              residency: residencyConfig,
            },
            ...rest,
          );
          if (result?.residency) {
            validateResidencyTarget(result.residency);
          }
          return result;
        };
      }

      if (['get', 'findOne', 'findById'].includes(prop)) {
        return async (...args) => {
          requireTenantContext();
          const result = await target[prop](...args);
          return sanitizeTenantResults(result, entityName);
        };
      }

      return Reflect.get(target, prop, receiver);
    },
  });
};

const tenantEntities = Object.fromEntries(
  Object.entries(rawEntities).map(([entityName, entity]) => [entityName, wrapEntity(entityName, entity)]),
);

export const {
  Location,
  Machine,
  Product,
  MachineStock,
  Sale,
  Alert,
  Route,
  Visit,
  Payout,
  Supplier,
  NayaxSetting,
  UnmappedProduct,
  ReportRecipient,
  ForecastData,
  MaintenancePrediction,
  SmartPricing,
  AuditLog,
  CashCollection,
  Commission,
  MaintenanceSchedule,
  RolePermission,
  Complaint,
  RefundCase,
  ServiceTicket,
  Agreement,
  WeatherData,
  ProductBatch,
  LocationScore,
  XeroConnection,
  TempState,
  FeatureToggle,
  FeatureAuditLog,
  TelemetryReading,
  CashMeter,
  VendEvent,
  ErrorCode,
  TemperatureReading,
  MachineRegistry,
  TelemetryIngestJob,
  DeadLetterQueue,
  PaymentProvider,
  PaymentTerminal,
  SettlementBatch,
  SettlementTransaction,
  Chargeback,
  PaymentAuditLog,
  Device,
  DeviceAssignment,
  DeviceAuditLog,
  DeviceRMA,
  DeviceErrorLog,
  AlertPolicy,
  MaintenanceWindow,
  Planogram,
  InventoryTransaction,
  InventoryReceipt,
  InventoryAdjustment,
  EnergyReading,
  EnergyTariff,
  ESGMetric,
  EnergyOptimization,
  LocationIntelligence,
  WeatherImpact,
  FootfallData,
  CompetitorMapping,
  ApiKey,
  WebhookSubscription,
  ApiAuditLog,
  SecurityPolicy,
  SystemMetric,
  ServiceLevelObjective,
  SystemEvent,
  OnboardingProfile,
  HelpArticle,
  HelpFeedback,
  HelpEvent,
  CredentialSpec,
  TenantCredential,
  CredentialHealth,
  CredentialAuditLog,
  AccountingProvider,
  AccountingConnection,
  BankConnection,
  BankAccount,
  BankTransaction,
  ReconciliationRule,
  ReconciliationMatch,
  DataConsent,
  AiConversation,
  AiMessage,
  AiEmbedding,
  AiTrashPolicy,
} = tenantEntities;

export const User = base44.auth;

