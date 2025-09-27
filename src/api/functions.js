import { base44 } from './base44Client';


export const syncNayaxData = base44.functions.syncNayaxData;

export const sendReportByEmail = base44.functions.sendReportByEmail;

export const deleteAllData = base44.functions.deleteAllData;

export const systemHealthCheck = base44.functions.systemHealthCheck;

export const dailySyncAndTrain = base44.functions.dailySyncAndTrain;

export const processSqsMessage = base44.functions.processSqsMessage;

export const scheduledSync = base44.functions.scheduledSync;

export const reauthStart = base44.functions.reauthStart;

export const submitComplaintAndNotify = base44.functions.submitComplaintAndNotify;

export const sendWeeklyReport = base44.functions.sendWeeklyReport;

export const sendMonthlyReport = base44.functions.sendMonthlyReport;

export const processVendFailure = base44.functions.processVendFailure;

export const fetchWeatherData = base44.functions.fetchWeatherData;

export const generateLocationScores = base44.functions.generateLocationScores;

export const syncToXero = base44.functions.syncToXero;

export const ping = base44.functions.ping;

export const startXeroConnection = base44.functions.startXeroConnection;

export const completeXeroConnection = base44.functions.completeXeroConnection;

export const testWeatherApi = base44.functions.testWeatherApi;

export const testTwilio = base44.functions.testTwilio;

export const sendSmsAlert = base44.functions.sendSmsAlert;

export const getMapsApiKey = base44.functions.getMapsApiKey;

export const autoSyncNayaxData = base44.functions.autoSyncNayaxData;

export const autoSyncXero = base44.functions.autoSyncXero;

export const trackGA4Event = base44.functions.trackGA4Event;

export const calculateStripeTax = base44.functions.calculateStripeTax;

export const fetchWestpacTransactions = base44.functions.fetchWestpacTransactions;

export const getGoogleAnalyticsId = base44.functions.getGoogleAnalyticsId;

export const testGoogleAnalyticsApi = base44.functions.testGoogleAnalyticsApi;

export const checkFeatureToggle = base44.functions.checkFeatureToggle;

export const manageFeatureToggle = base44.functions.manageFeatureToggle;

export const ingestTelemetryWebhook = base44.functions.ingestTelemetryWebhook;

export const processTelemetryFile = base44.functions.processTelemetryFile;

export const exportTelemetryData = base44.functions.exportTelemetryData;

export const paymentProviderConnector = base44.functions.paymentProviderConnector;

export const processRefund = base44.functions.processRefund;

export const processSettlementFile = base44.functions.processSettlementFile;

export const exportDeviceInventory = base44.functions.exportDeviceInventory;

export const bulkDeviceUpdate = base44.functions.bulkDeviceUpdate;

export const createAlert = base44.functions.createAlert;

export const routeAlert = base44.functions.routeAlert;

export const escalateAlerts = base44.functions.escalateAlerts;

export const calculatePickList = base44.functions.calculatePickList;

export const generateExpiryReport = base44.functions.generateExpiryReport;

export const processLotRecall = base44.functions.processLotRecall;

export const processInventoryAdjustment = base44.functions.processInventoryAdjustment;

export const calculateEnergyOptimizations = base44.functions.calculateEnergyOptimizations;

export const generateESGReport = base44.functions.generateESGReport;

export const generateLocationIntelligence = base44.functions.generateLocationIntelligence;

export const simulateHeatwaveScenario = base44.functions.simulateHeatwaveScenario;

export const apiV1GetMachine = base44.functions["api/v1/getMachine"];

export const apiV1ListRoutes = base44.functions["api/v1/listRoutes"];

export const apiV1GetTelemetry = base44.functions["api/v1/getTelemetry"];

export const webhooksDispatchWebhook = base44.functions["webhooks/dispatchWebhook"];

export const getOpenApiSpec = base44.functions.getOpenApiSpec;

export const recordMetric = base44.functions.recordMetric;

export const retryFailedWebhooks = base44.functions.retryFailedWebhooks;

export const onboardingRecommend = base44.functions["onboarding/recommend"];

export const onboardingApply = base44.functions["onboarding/apply"];

export const onboardingProfiles = base44.functions["onboarding/profiles"];

export const credentialsCollectCredentials = base44.functions["credentials/collectCredentials"];

export const accountingConnectProvider = base44.functions["accounting/connectProvider"];

export const accountingCompleteConnection = base44.functions["accounting/completeConnection"];

export const bankingConnectBank = base44.functions["banking/connectBank"];

export const reconciliationAutoMatch = base44.functions["reconciliation/autoMatch"];

export const submitRefundRequest = base44.functions.submitRefundRequest;

export const analyzeRefundRisk = base44.functions.analyzeRefundRisk;

export const processRefundWithChecks = base44.functions.processRefundWithChecks;

export const createServiceTicket = base44.functions.createServiceTicket;

export const snoozeServiceTicket = base44.functions.snoozeServiceTicket;

export const escalateServiceTickets = base44.functions.escalateServiceTickets;

export const testNayax = base44.functions.testNayax;

export const testXero = base44.functions.testXero;

export const testGoogleMapsApi = base44.functions.testGoogleMapsApi;

export const exportData = base44.functions.exportData;

export const setupMockData = base44.functions.setupMockData;

export const completeOnboarding = base44.functions.completeOnboarding;

export const aiSoftDeleteConversation = base44.functions["ai/softDeleteConversation"];

export const aiRestoreConversation = base44.functions["ai/restoreConversation"];

export const aiPurgeConversation = base44.functions["ai/purgeConversation"];

export const aiPurgeExpiredConversations = base44.functions["ai/purgeExpiredConversations"];

export const submitHelpFeedback = base44.functions.submitHelpFeedback;

export const processPublicComplaint = base44.functions.processPublicComplaint;

