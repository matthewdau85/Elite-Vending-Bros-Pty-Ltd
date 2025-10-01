import { base44 } from './base44Client';
import { SettlementBatch, Sale, CashCollection, Chargeback } from './entities';

const getFunction = (key) => base44?.functions?.[key];

export const syncNayaxData = getFunction('syncNayaxData');
export const sendReportByEmail = getFunction('sendReportByEmail');
export const deleteAllData = getFunction('deleteAllData');
export const systemHealthCheck = getFunction('systemHealthCheck');
export const dailySyncAndTrain = getFunction('dailySyncAndTrain');
export const processSqsMessage = getFunction('processSqsMessage');
export const scheduledSync = getFunction('scheduledSync');
export const reauthStart = getFunction('reauthStart');
export const submitComplaintAndNotify = getFunction('submitComplaintAndNotify');
export const sendWeeklyReport = getFunction('sendWeeklyReport');
export const sendMonthlyReport = getFunction('sendMonthlyReport');
export const processVendFailure = getFunction('processVendFailure');
export const fetchWeatherData = getFunction('fetchWeatherData');
export const generateLocationScores = getFunction('generateLocationScores');
export const syncToXero = getFunction('syncToXero');
export const ping = getFunction('ping');
export const startXeroConnection = getFunction('startXeroConnection');
export const completeXeroConnection = getFunction('completeXeroConnection');
export const testWeatherApi = getFunction('testWeatherApi');
export const testTwilio = getFunction('testTwilio');
export const sendSmsAlert = getFunction('sendSmsAlert');
export const getMapsApiKey = getFunction('getMapsApiKey');
export const autoSyncNayaxData = getFunction('autoSyncNayaxData');
export const autoSyncXero = getFunction('autoSyncXero');
export const trackGA4Event = getFunction('trackGA4Event');
export const calculateStripeTax = getFunction('calculateStripeTax');
export const fetchWestpacTransactions = getFunction('fetchWestpacTransactions');
export const getGoogleAnalyticsId = getFunction('getGoogleAnalyticsId');
export const testGoogleAnalyticsApi = getFunction('testGoogleAnalyticsApi');
export const checkFeatureToggle = getFunction('checkFeatureToggle');
export const manageFeatureToggle = getFunction('manageFeatureToggle');
export const ingestTelemetryWebhook = getFunction('ingestTelemetryWebhook');
export const processTelemetryFile = getFunction('processTelemetryFile');
export const exportTelemetryData = getFunction('exportTelemetryData');
export const paymentProviderConnector = getFunction('paymentProviderConnector');
export const processRefund = getFunction('processRefund');
export const processSettlementFile = getFunction('processSettlementFile');
export const exportDeviceInventory = getFunction('exportDeviceInventory');
export const bulkDeviceUpdate = getFunction('bulkDeviceUpdate');
export const createAlert = getFunction('createAlert');
export const routeAlert = getFunction('routeAlert');
export const escalateAlerts = getFunction('escalateAlerts');
export const calculatePickList = getFunction('calculatePickList');
export const generateExpiryReport = getFunction('generateExpiryReport');
export const processLotRecall = getFunction('processLotRecall');
export const processInventoryAdjustment = getFunction('processInventoryAdjustment');
export const calculateEnergyOptimizations = getFunction('calculateEnergyOptimizations');
export const generateESGReport = getFunction('generateESGReport');
export const generateLocationIntelligence = getFunction('generateLocationIntelligence');
export const simulateHeatwaveScenario = getFunction('simulateHeatwaveScenario');
export const getOpenApiSpec = getFunction('getOpenApiSpec');
export const recordMetric = getFunction('recordMetric');
export const retryFailedWebhooks = getFunction('retryFailedWebhooks');
export const getMachine = getFunction('api/v1/getMachine');
export const listRoutes = getFunction('api/v1/listRoutes');
export const getTelemetry = getFunction('api/v1/getTelemetry');
export const dispatchWebhook = getFunction('webhooks/dispatchWebhook');
export const onboardingRecommend = getFunction('onboarding/recommend');
export const onboardingApply = getFunction('onboarding/apply');
export const onboardingProfiles = getFunction('onboarding/profiles');
export const collectCredentials = getFunction('credentials/collectCredentials');
export const connectProvider = getFunction('accounting/connectProvider');
export const completeConnection = getFunction('accounting/completeConnection');
export const connectBank = getFunction('banking/connectBank');
export const autoMatch = getFunction('reconciliation/autoMatch');
export const submitRefundRequest = getFunction('submitRefundRequest');
export const analyzeRefundRisk = getFunction('analyzeRefundRisk');
export const processRefundWithChecks = getFunction('processRefundWithChecks');
export const createServiceTicket = getFunction('createServiceTicket');
export const snoozeServiceTicket = getFunction('snoozeServiceTicket');
export const escalateServiceTickets = getFunction('escalateServiceTickets');
export const testNayax = getFunction('testNayax');
export const testXero = getFunction('testXero');
export const testGoogleMapsApi = getFunction('testGoogleMapsApi');
export const exportData = getFunction('exportData');
export const setupMockData = getFunction('setupMockData');
export const completeOnboarding = getFunction('completeOnboarding');
export const softDeleteConversation = getFunction('ai/softDeleteConversation');
export const restoreConversation = getFunction('ai/restoreConversation');
export const purgeConversation = getFunction('ai/purgeConversation');
export const purgeExpiredConversations = getFunction('ai/purgeExpiredConversations');
export const submitHelpFeedback = getFunction('submitHelpFeedback');
export const processPublicComplaint = getFunction('processPublicComplaint');

const safeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  return [value];
};

const parseCurrencyToCents = (value, alreadyCents = false) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return alreadyCents ? Math.round(value) : Math.round(value * 100);
  }
  if (typeof value === 'string') {
    const sanitized = value.replace(/[^0-9.-]/g, '');
    const numeric = parseFloat(sanitized);
    if (Number.isFinite(numeric)) {
      return alreadyCents ? Math.round(numeric) : Math.round(numeric * 100);
    }
  }
  return 0;
};

const resolveAmountCents = (record) => {
  if (!record) return 0;
  if (typeof record === 'number') return parseCurrencyToCents(record);
  const amountFields = [
    ['amount_cents', true],
    ['total_amount_cents', true],
    ['settlement_amount_cents', true],
    ['gross_amount_cents', true],
    ['net_amount_cents', true],
    ['amount', false],
    ['total_amount', false],
    ['gross_amount', false],
    ['net_amount', false],
    ['value', false],
  ];

  for (const [field, alreadyCents] of amountFields) {
    if (record[field] !== undefined && record[field] !== null) {
      return parseCurrencyToCents(record[field], alreadyCents);
    }
  }

  return 0;
};

const normaliseTransactionKey = (record) => {
  if (!record) return undefined;
  return (
    record.settlement_transaction_id ||
    record.transaction_id ||
    record.provider_transaction_id ||
    record.payment_reference ||
    record.provider_reference ||
    record.reference ||
    record.id ||
    undefined
  );
};

const resolveCashVariance = (cashRecord) => {
  if (!cashRecord) return {
    collected_cents: 0,
    expected_cents: 0,
    variance_cents: 0,
  };

  const collectedCents = parseCurrencyToCents(
    cashRecord.cash_collected_cents ??
      cashRecord.counted_amount_cents ??
      cashRecord.cash_total_cents ??
      cashRecord.counted_amount ??
      cashRecord.cash_collected,
    cashRecord.cash_collected_cents !== undefined || cashRecord.counted_amount_cents !== undefined || cashRecord.cash_total_cents !== undefined
  );

  let expectedCents = parseCurrencyToCents(
    cashRecord.expected_cash_cents ??
      cashRecord.expected_amount_cents ??
      cashRecord.meter_amount_cents ??
      cashRecord.expected_amount,
    cashRecord.expected_cash_cents !== undefined || cashRecord.expected_amount_cents !== undefined || cashRecord.meter_amount_cents !== undefined
  );

  if (!expectedCents && cashRecord.meter_reading) {
    expectedCents = parseCurrencyToCents(cashRecord.meter_reading, false);
  }

  const varianceCents =
    typeof cashRecord.variance_cents === 'number'
      ? Math.round(cashRecord.variance_cents)
      : collectedCents - expectedCents;

  return {
    collected_cents: collectedCents,
    expected_cents: expectedCents,
    variance_cents: varianceCents,
  };
};

const buildJournalPayloads = ({
  matchedRecords,
  unmatchedSettlements,
  unmatchedSales,
  varianceRecords,
  chargebackRecords,
  batch,
}) => {
  const matched = matchedRecords.map((entry) => ({
    reference: normaliseTransactionKey(entry.transaction),
    settlement_amount_cents: entry.settlement_amount_cents,
    sale_amount_cents: entry.sale_amount_cents,
    variance_cents: entry.variance_cents,
    sale_id: entry.sale?.id ?? null,
    settlement_id: entry.transaction?.id ?? null,
    settled_at: entry.transaction?.settlement_date ?? batch?.settlement_date ?? null,
    payment_method: entry.transaction?.payment_method ?? entry.sale?.payment_method ?? batch?.payment_method ?? null,
  }));

  const exceptions = [
    ...unmatchedSettlements.map((txn) => ({
      type: 'settlement',
      reference: normaliseTransactionKey(txn),
      amount_cents: resolveAmountCents(txn),
      occurred_at: txn.settlement_date ?? txn.transaction_date ?? batch?.settlement_date ?? null,
      raw: txn,
    })),
    ...unmatchedSales.map((sale) => ({
      type: 'sale',
      reference: normaliseTransactionKey(sale) ?? sale.id,
      amount_cents: resolveAmountCents(sale),
      occurred_at: sale.sale_datetime ?? sale.created_at ?? null,
      raw: sale,
    })),
  ];

  const cash = varianceRecords.map((record) => ({
    variance_cents: record.variance_cents,
    expected_cents: record.expected_cents,
    collected_cents: record.collected_cents,
    machine_id: record.machine_id,
    collected_at: record.collected_at,
    notes: record.notes ?? null,
  }));

  const chargebacks = chargebackRecords.map((cb) => ({
    reference: normaliseTransactionKey(cb),
    amount_cents: resolveAmountCents(cb),
    status: cb.status ?? cb.outcome ?? null,
    opened_at: cb.created_at ?? cb.opened_at ?? null,
    raw: cb,
  }));

  return { matched, exceptions, cash, chargebacks };
};

export async function reconcileSettlementBatch(batchOrBatchId, options = {}) {
  const {
    sales: providedSales = null,
    cashCounts: providedCashCounts = null,
    toleranceCents = 500,
    includeChargebacks = true,
  } = options;

  if (!batchOrBatchId) {
    throw new Error('A settlement batch or identifier must be provided for reconciliation.');
  }

  let batch = typeof batchOrBatchId === 'string' ? null : batchOrBatchId;

  if (!batch && typeof batchOrBatchId === 'string') {
    if (SettlementBatch?.retrieve) {
      try {
        batch = await SettlementBatch.retrieve(batchOrBatchId);
      } catch (error) {
        console.warn('Failed to retrieve settlement batch by id, falling back to list lookup.', error);
      }
    }

    if (!batch && SettlementBatch?.list) {
      try {
        const batches = safeArray(await SettlementBatch.list());
        batch = batches.find(
          (item) => item.id === batchOrBatchId || item.batch_id === batchOrBatchId,
        ) ?? null;
      } catch (error) {
        console.warn('Unable to resolve settlement batch via list lookup.', error);
      }
    }
  }

  if (!batch) {
    throw new Error('Unable to resolve settlement batch for reconciliation.');
  }

  const transactions = safeArray(batch.settlement_transactions || batch.transactions || []);

  let sales = safeArray(providedSales);
  if (!sales.length && Sale?.list) {
    try {
      const saleData = safeArray(await Sale.list());
      sales = saleData.filter((sale) => {
        const settlementId = sale.settlement_batch_id || sale.batch_id || sale.settlement_batch;
        if (!settlementId) return false;
        return settlementId === batch.id || settlementId === batch.batch_id;
      });
    } catch (error) {
      console.warn('Failed to load sales for reconciliation, proceeding with empty set.', error);
      sales = [];
    }
  }

  let cashCounts = safeArray(providedCashCounts);
  if (!cashCounts.length && CashCollection?.list) {
    try {
      const cashData = safeArray(await CashCollection.list());
      cashCounts = cashData.filter((record) => {
        if (!record) return false;
        if (record.settlement_batch_id) {
          return record.settlement_batch_id === batch.id || record.settlement_batch_id === batch.batch_id;
        }
        if (record.batch_id) {
          return record.batch_id === batch.id || record.batch_id === batch.batch_id;
        }
        if (record.collected_at && batch.settlement_date) {
          try {
            const collected = new Date(record.collected_at);
            const settled = new Date(batch.settlement_date);
            const diff = Math.abs(collected - settled);
            const oneDay = 24 * 60 * 60 * 1000;
            return diff < oneDay * 7;
          } catch (error) {
            return false;
          }
        }
        return false;
      });
    } catch (error) {
      console.warn('Failed to load cash counts for reconciliation.', error);
      cashCounts = [];
    }
  }

  let chargebackRecords = [];
  if (includeChargebacks && Chargeback?.list) {
    try {
      const chargebackData = safeArray(await Chargeback.list());
      chargebackRecords = chargebackData.filter((record) => {
        if (!record) return false;
        if (record.settlement_batch_id) {
          return record.settlement_batch_id === batch.id || record.settlement_batch_id === batch.batch_id;
        }
        if (record.batch_id) {
          return record.batch_id === batch.id || record.batch_id === batch.batch_id;
        }
        const txnKey = normaliseTransactionKey(record);
        return transactions.some((txn) => normaliseTransactionKey(txn) === txnKey);
      });
    } catch (error) {
      console.warn('Failed to load chargebacks for reconciliation.', error);
      chargebackRecords = [];
    }
  }

  const saleBuckets = new Map();
  sales.forEach((sale) => {
    const key = normaliseTransactionKey(sale) || sale.id;
    if (!key) return;
    const bucket = saleBuckets.get(key) || [];
    bucket.push(sale);
    saleBuckets.set(key, bucket);
  });

  const matchedRecords = [];
  const unmatchedSettlements = [];

  transactions.forEach((transaction) => {
    const key = normaliseTransactionKey(transaction);
    let matchedSale = null;

    if (key && saleBuckets.has(key)) {
      const bucket = saleBuckets.get(key);
      matchedSale = bucket.shift();
      if (!bucket.length) {
        saleBuckets.delete(key);
      } else {
        saleBuckets.set(key, bucket);
      }
    }

    if (!matchedSale && transaction.sale_id) {
      matchedSale = sales.find((sale) => sale.id === transaction.sale_id) ?? null;
      if (matchedSale) {
        const fallbackKey = normaliseTransactionKey(matchedSale) || matchedSale.id;
        if (fallbackKey && saleBuckets.has(fallbackKey)) {
          const bucket = saleBuckets.get(fallbackKey).filter((item) => item !== matchedSale);
          if (bucket.length) {
            saleBuckets.set(fallbackKey, bucket);
          } else {
            saleBuckets.delete(fallbackKey);
          }
        }
      }
    }

    if (matchedSale) {
      const settlementAmountCents = resolveAmountCents(transaction);
      const saleAmountCents = resolveAmountCents(matchedSale);
      matchedRecords.push({
        transaction,
        sale: matchedSale,
        variance_cents: settlementAmountCents - saleAmountCents,
        settlement_amount_cents: settlementAmountCents,
        sale_amount_cents: saleAmountCents,
      });
    } else {
      unmatchedSettlements.push(transaction);
    }
  });

  const unmatchedSales = [];
  saleBuckets.forEach((bucket) => {
    unmatchedSales.push(...bucket);
  });

  const varianceRecords = cashCounts.map((record) => {
    const { collected_cents, expected_cents, variance_cents } = resolveCashVariance(record);
    return {
      id:
        record.id ||
        `${record.machine_id || record.device_id || 'cash'}-${record.cash_collected_at || record.collected_at || Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
      machine_id: record.machine_id ?? record.device_id ?? null,
      collected_at: record.cash_collected_at ?? record.collected_at ?? record.created_at ?? null,
      collected_cents,
      expected_cents,
      variance_cents,
      variance_dollars: variance_cents / 100,
      notes: record.variance_reason || record.notes || null,
      photos: safeArray(record.cash_collection_photos || record.photos || []),
      exceededTolerance: Math.abs(variance_cents) > toleranceCents,
      raw: record,
    };
  });

  const toleranceAlerts = [];

  matchedRecords.forEach((entry) => {
    if (Math.abs(entry.variance_cents) > toleranceCents) {
      toleranceAlerts.push({
        id: `matched-${normaliseTransactionKey(entry.transaction) || entry.transaction?.id}`,
        type: 'settlement-variance',
        severity: 'warning',
        message: `Variance of ${(entry.variance_cents / 100).toFixed(2)} detected between sale and settlement.`,
        context: {
          transaction: entry.transaction,
          sale: entry.sale,
          variance_cents: entry.variance_cents,
        },
      });
    }
  });

  varianceRecords.forEach((record) => {
    if (record.exceededTolerance) {
      toleranceAlerts.push({
        id: `cash-${record.id}`,
        type: 'cash-variance',
        severity: 'warning',
        message: `Cash variance of ${(record.variance_cents / 100).toFixed(2)} exceeds tolerance.`,
        context: record,
      });
    }
  });

  unmatchedSettlements.forEach((transaction) => {
    toleranceAlerts.push({
      id: `settlement-${normaliseTransactionKey(transaction) || transaction.id || Math.random().toString(36).slice(2, 8)}`,
      type: 'unmatched-settlement',
      severity: 'critical',
      message: 'Settlement transaction has no matching sale record.',
      context: transaction,
    });
  });

  unmatchedSales.forEach((sale) => {
    toleranceAlerts.push({
      id: `sale-${normaliseTransactionKey(sale) || sale.id || Math.random().toString(36).slice(2, 8)}`,
      type: 'unmatched-sale',
      severity: 'critical',
      message: 'Sale was not found in settlement batch.',
      context: sale,
    });
  });

  const chargebackSummary = (() => {
    const totalAmountCents = chargebackRecords.reduce(
      (sum, record) => sum + resolveAmountCents(record),
      0,
    );
    const statusBuckets = { pending: 0, won: 0, lost: 0 };

    chargebackRecords.forEach((record) => {
      const status = (record.status || record.outcome || '').toString().toLowerCase();
      if (['pending', 'open', 'in_review', 'investigating'].includes(status)) {
        statusBuckets.pending += 1;
      } else if (['won', 'resolved', 'upheld', 'closed_won'].includes(status)) {
        statusBuckets.won += 1;
      } else if (['lost', 'rejected', 'closed_lost'].includes(status)) {
        statusBuckets.lost += 1;
      }
    });

    return {
      records: chargebackRecords,
      totalAmountCents,
      pendingCount: statusBuckets.pending,
      wonCount: statusBuckets.won,
      lostCount: statusBuckets.lost,
    };
  })();

  const totals = {
    matchedCount: matchedRecords.length,
    matchedAmountCents: matchedRecords.reduce(
      (sum, record) => sum + record.settlement_amount_cents,
      0,
    ),
    unmatchedSettlementCount: unmatchedSettlements.length,
    unmatchedSettlementAmountCents: unmatchedSettlements.reduce(
      (sum, record) => sum + resolveAmountCents(record),
      0,
    ),
    unmatchedSaleCount: unmatchedSales.length,
    unmatchedSaleAmountCents: unmatchedSales.reduce(
      (sum, record) => sum + resolveAmountCents(record),
      0,
    ),
    cashVarianceCents: varianceRecords.reduce((sum, record) => sum + record.variance_cents, 0),
    toleranceBreaches: toleranceAlerts.length,
    chargebackCount: chargebackSummary.records.length,
    chargebackAmountCents: chargebackSummary.totalAmountCents,
  };

  const journalExports = buildJournalPayloads({
    matchedRecords,
    unmatchedSettlements,
    unmatchedSales,
    varianceRecords,
    chargebackRecords: chargebackSummary.records,
    batch,
  });

  return {
    batch,
    transactions: {
      matched: matchedRecords,
      unmatchedSettlements,
      unmatchedSales,
    },
    varianceRecords,
    toleranceAlerts,
    chargebacks: chargebackSummary,
    totals,
    journalExports,
  };
}
