import { base44 } from './base44Client';

const getFunction = (name) => {
  const fn = base44?.functions?.[name];
  if (typeof fn === 'function') {
    return fn;
  }

  return async (..._args) => {
    throw new Error(`base44 function "${name}" is not available`);
  };
};

const functionMap = {
  // Core platform
  syncNayaxData: 'syncNayaxData',
  sendReportByEmail: 'sendReportByEmail',
  deleteAllData: 'deleteAllData',
  systemHealthCheck: 'systemHealthCheck',
  dailySyncAndTrain: 'dailySyncAndTrain',
  processSqsMessage: 'processSqsMessage',
  scheduledSync: 'scheduledSync',
  reauthStart: 'reauthStart',
  submitComplaintAndNotify: 'submitComplaintAndNotify',
  sendWeeklyReport: 'sendWeeklyReport',
  sendMonthlyReport: 'sendMonthlyReport',
  processVendFailure: 'processVendFailure',
  fetchWeatherData: 'fetchWeatherData',
  generateLocationScores: 'generateLocationScores',
  syncToXero: 'syncToXero',
  ping: 'ping',
  startXeroConnection: 'startXeroConnection',
  completeXeroConnection: 'completeXeroConnection',
  testWeatherApi: 'testWeatherApi',
  testTwilio: 'testTwilio',
  sendSmsAlert: 'sendSmsAlert',
  getMapsApiKey: 'getMapsApiKey',
  autoSyncNayaxData: 'autoSyncNayaxData',
  autoSyncXero: 'autoSyncXero',
  trackGA4Event: 'trackGA4Event',
  calculateStripeTax: 'calculateStripeTax',
  fetchWestpacTransactions: 'fetchWestpacTransactions',
  getGoogleAnalyticsId: 'getGoogleAnalyticsId',
  testGoogleAnalyticsApi: 'testGoogleAnalyticsApi',
  checkFeatureToggle: 'checkFeatureToggle',
  manageFeatureToggle: 'manageFeatureToggle',

  // Telemetry + ingest
  ingestTelemetryWebhook: 'ingestTelemetryWebhook',
  processTelemetryFile: 'processTelemetryFile',
  exportTelemetryData: 'exportTelemetryData',
  normalizeTelemetryEvents: 'telemetry/normalizeEvents',
  submitTelemetryBatch: 'telemetry/submitBatch',
  fetchTelemetryMonitorSummary: 'telemetry/monitorSummary',
  replayDeadLetters: 'telemetry/replayDeadLetters',
  exportTelemetryPayload: 'telemetry/exportPayload',

  // Payments + settlements
  paymentProviderConnector: 'paymentProviderConnector',
  processRefund: 'processRefund',
  processSettlementFile: 'processSettlementFile',
  submitRefundRequest: 'submitRefundRequest',
  analyzeRefundRisk: 'analyzeRefundRisk',
  processRefundWithChecks: 'processRefundWithChecks',

  // Devices + inventory
  exportDeviceInventory: 'exportDeviceInventory',
  bulkDeviceUpdate: 'bulkDeviceUpdate',
  calculatePickList: 'calculatePickList',
  generateExpiryReport: 'generateExpiryReport',
  processLotRecall: 'processLotRecall',
  processInventoryAdjustment: 'processInventoryAdjustment',

  // Alerts + service
  createAlert: 'createAlert',
  routeAlert: 'routeAlert',
  escalateAlerts: 'escalateAlerts',
  createServiceTicket: 'createServiceTicket',
  snoozeServiceTicket: 'snoozeServiceTicket',
  escalateServiceTickets: 'escalateServiceTickets',

  // Energy + intelligence
  calculateEnergyOptimizations: 'calculateEnergyOptimizations',
  generateESGReport: 'generateESGReport',
  generateLocationIntelligence: 'generateLocationIntelligence',
  simulateHeatwaveScenario: 'simulateHeatwaveScenario',

  // API + webhooks
  getMachine: 'api/v1/getMachine',
  listRoutes: 'api/v1/listRoutes',
  getTelemetry: 'api/v1/getTelemetry',
  dispatchWebhook: 'webhooks/dispatchWebhook',
  getOpenApiSpec: 'getOpenApiSpec',
  recordMetric: 'recordMetric',
  retryFailedWebhooks: 'retryFailedWebhooks',

  // Onboarding + credentials
  onboardingRecommend: 'onboarding/recommend',
  onboardingApply: 'onboarding/apply',
  onboardingProfiles: 'onboarding/profiles',
  collectCredentials: 'credentials/collectCredentials',
  connectProvider: 'accounting/connectProvider',
  completeConnection: 'accounting/completeConnection',
  connectBank: 'banking/connectBank',
  autoMatch: 'reconciliation/autoMatch',

  // AI helpers used in UI
  softDeleteConversation: 'ai/softDeleteConversation',
  restoreConversation: 'ai/restoreConversation',
  purgeConversation: 'ai/purgeConversation',
  purgeExpiredConversations: 'ai/purgeExpiredConversations',

  // Misc utilities
  exportData: 'exportData',
  setupMockData: 'setupMockData',
  completeOnboarding: 'completeOnboarding',
  submitHelpFeedback: 'submitHelpFeedback',
  processPublicComplaint: 'processPublicComplaint',
  testNayax: 'testNayax',
  testXero: 'testXero',
  testGoogleMapsApi: 'testGoogleMapsApi'
};

const apiFunctions = Object.fromEntries(
  Object.entries(functionMap).map(([exportName, remoteName]) => [exportName, getFunction(remoteName)])
);

export const {
  syncNayaxData,
  sendReportByEmail,
  deleteAllData,
  systemHealthCheck,
  dailySyncAndTrain,
  processSqsMessage,
  scheduledSync,
  reauthStart,
  submitComplaintAndNotify,
  sendWeeklyReport,
  sendMonthlyReport,
  processVendFailure,
  fetchWeatherData,
  generateLocationScores,
  syncToXero,
  ping,
  startXeroConnection,
  completeXeroConnection,
  testWeatherApi,
  testTwilio,
  sendSmsAlert,
  getMapsApiKey,
  autoSyncNayaxData,
  autoSyncXero,
  trackGA4Event,
  calculateStripeTax,
  fetchWestpacTransactions,
  getGoogleAnalyticsId,
  testGoogleAnalyticsApi,
  checkFeatureToggle,
  manageFeatureToggle,
  ingestTelemetryWebhook,
  processTelemetryFile,
  exportTelemetryData,
  normalizeTelemetryEvents,
  submitTelemetryBatch,
  fetchTelemetryMonitorSummary,
  replayDeadLetters,
  exportTelemetryPayload,
  paymentProviderConnector,
  processRefund,
  processSettlementFile,
  submitRefundRequest,
  analyzeRefundRisk,
  processRefundWithChecks,
  exportDeviceInventory,
  bulkDeviceUpdate,
  calculatePickList,
  generateExpiryReport,
  processLotRecall,
  processInventoryAdjustment,
  createAlert,
  routeAlert,
  escalateAlerts,
  createServiceTicket,
  snoozeServiceTicket,
  escalateServiceTickets,
  calculateEnergyOptimizations,
  generateESGReport,
  generateLocationIntelligence,
  simulateHeatwaveScenario,
  getMachine,
  listRoutes,
  getTelemetry,
  dispatchWebhook,
  getOpenApiSpec,
  recordMetric,
  retryFailedWebhooks,
  onboardingRecommend,
  onboardingApply,
  onboardingProfiles,
  collectCredentials,
  connectProvider,
  completeConnection,
  connectBank,
  autoMatch,
  softDeleteConversation,
  restoreConversation,
  purgeConversation,
  purgeExpiredConversations,
  exportData,
  setupMockData,
  completeOnboarding,
  submitHelpFeedback,
  processPublicComplaint,
  testNayax,
  testXero,
  testGoogleMapsApi
} = apiFunctions;

export default apiFunctions;
