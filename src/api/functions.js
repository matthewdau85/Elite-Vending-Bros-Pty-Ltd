import { base44 } from './base44Client';

const getFunctionByPath = (path) => {
  if (!base44?.functions) return null;
  return path.split('/').reduce((acc, part) => (acc ? acc[part] : undefined), base44.functions) || null;
};

const FUNCTION_PATHS = {
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
  ingestTelemetryWebhook: 'ingestTelemetryWebhook',
  processTelemetryFile: 'processTelemetryFile',
  exportTelemetryData: 'exportTelemetryData',
  paymentProviderConnector: 'paymentProviderConnector',
  processRefund: 'processRefund',
  processSettlementFile: 'processSettlementFile',
  exportDeviceInventory: 'exportDeviceInventory',
  bulkDeviceUpdate: 'bulkDeviceUpdate',
  createAlert: 'createAlert',
  routeAlert: 'routeAlert',
  escalateAlerts: 'escalateAlerts',
  calculatePickList: 'calculatePickList',
  generateExpiryReport: 'generateExpiryReport',
  processLotRecall: 'processLotRecall',
  processInventoryAdjustment: 'processInventoryAdjustment',
  calculateEnergyOptimizations: 'calculateEnergyOptimizations',
  generateESGReport: 'generateESGReport',
  generateLocationIntelligence: 'generateLocationIntelligence',
  simulateHeatwaveScenario: 'simulateHeatwaveScenario',
  getMachine: 'api/v1/getMachine',
  listRoutes: 'api/v1/listRoutes',
  getTelemetry: 'api/v1/getTelemetry',
  dispatchWebhook: 'webhooks/dispatchWebhook',
  getOpenApiSpec: 'getOpenApiSpec',
  recordMetric: 'recordMetric',
  retryFailedWebhooks: 'retryFailedWebhooks',
  onboardingRecommend: 'onboarding/recommend',
  onboardingApply: 'onboarding/apply',
  onboardingProfiles: 'onboarding/profiles',
  collectCredentials: 'credentials/collectCredentials',
  connectProvider: 'accounting/connectProvider',
  completeConnection: 'accounting/completeConnection',
  connectBank: 'banking/connectBank',
  autoMatch: 'reconciliation/autoMatch',
  submitRefundRequest: 'submitRefundRequest',
  analyzeRefundRisk: 'analyzeRefundRisk',
  processRefundWithChecks: 'processRefundWithChecks',
  createServiceTicket: 'createServiceTicket',
  snoozeServiceTicket: 'snoozeServiceTicket',
  escalateServiceTickets: 'escalateServiceTickets',
  testNayax: 'testNayax',
  testXero: 'testXero',
  testGoogleMapsApi: 'testGoogleMapsApi',
  exportData: 'exportData',
  setupMockData: 'setupMockData',
  completeOnboarding: 'completeOnboarding',
  softDeleteConversation: 'ai/softDeleteConversation',
  restoreConversation: 'ai/restoreConversation',
  purgeConversation: 'ai/purgeConversation',
  purgeExpiredConversations: 'ai/purgeExpiredConversations',
  submitHelpFeedback: 'submitHelpFeedback',
  processPublicComplaint: 'processPublicComplaint',
};

const resolvedFunctions = Object.keys(FUNCTION_PATHS).reduce((acc, key) => {
  acc[key] = getFunctionByPath(FUNCTION_PATHS[key]);
  return acc;
}, {});

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
  paymentProviderConnector,
  processRefund,
  processSettlementFile,
  exportDeviceInventory,
  bulkDeviceUpdate,
  createAlert,
  routeAlert,
  escalateAlerts,
  calculatePickList,
  generateExpiryReport,
  processLotRecall,
  processInventoryAdjustment,
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
  submitRefundRequest,
  analyzeRefundRisk,
  processRefundWithChecks,
  createServiceTicket,
  snoozeServiceTicket,
  escalateServiceTickets,
  testNayax,
  testXero,
  testGoogleMapsApi,
  exportData,
  setupMockData,
  completeOnboarding,
  softDeleteConversation,
  restoreConversation,
  purgeConversation,
  purgeExpiredConversations,
  submitHelpFeedback,
  processPublicComplaint,
} = resolvedFunctions;

const toRadians = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
  if (!from || !to) return 0;
  const R = 6371; // kilometres
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lng - from.lng);

  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const isValidCoordinate = (lat, lng) => {
  const latOk = Number.isFinite(lat) && lat <= 90 && lat >= -90;
  const lngOk = Number.isFinite(lng) && lng <= 180 && lng >= -180;
  return latOk && lngOk;
};

export const optimizeRoutePlan = async ({
  depot,
  machines,
  vehicleCapacity = 400,
  startTime,
  endTime,
  averageSpeedKmh = 45,
} = {}) => {
  const startDate = startTime ? new Date(startTime) : new Date();
  const endDate = endTime ? new Date(endTime) : null;
  const speedKmh = Math.max(averageSpeedKmh || 0, 5);
  const speedKmPerMinute = speedKmh / 60;
  const validMachines = [];
  const unscheduled = [];

  (machines || []).forEach((machine) => {
    const lat = Number(machine.latitude);
    const lng = Number(machine.longitude);
    if (!isValidCoordinate(lat, lng)) {
      unscheduled.push({
        ...machine,
        unscheduledReason: machine.unscheduledReason || 'Missing coordinates',
      });
    } else {
      validMachines.push({
        ...machine,
        latitude: lat,
        longitude: lng,
      });
    }
  });

  if (!validMachines.length) {
    return {
      stops: [],
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      startTime: startDate.toISOString(),
      endTime: endDate ? endDate.toISOString() : null,
      vehicleCapacity,
      unscheduled,
    };
  }

  const pending = [...validMachines];
  const itinerary = [];
  let cursor = {
    lat: Number(depot?.latitude) || 0,
    lng: Number(depot?.longitude) || 0,
  };
  let clock = new Date(startDate);
  let remainingCapacity = vehicleCapacity;
  let totalDistance = 0;

  while (pending.length) {
    let bestIndex = -1;
    let bestCandidate = null;
    let bestMetrics = null;

    pending.forEach((machine, index) => {
      const travelDistance = haversineDistanceKm(cursor, {
        lat: machine.latitude,
        lng: machine.longitude,
      });
      const travelMinutes = travelDistance / speedKmPerMinute;
      const rawArrival = new Date(clock.getTime() + travelMinutes * 60000);

      const windowStart = machine.timeWindow?.start ? new Date(machine.timeWindow.start) : startDate;
      const windowEnd = machine.timeWindow?.end ? new Date(machine.timeWindow.end) : endDate;

      let waitMinutes = 0;
      let arrival = rawArrival;
      if (windowStart && rawArrival < windowStart) {
        waitMinutes = (windowStart.getTime() - rawArrival.getTime()) / 60000;
        arrival = new Date(windowStart);
      }

      if (windowEnd && arrival > windowEnd) {
        return;
      }

      const serviceDuration = Number(machine.serviceDurationMinutes) || 10;
      const departure = new Date(arrival.getTime() + serviceDuration * 60000);

      if (endDate && departure > endDate) {
        return;
      }

      const score = travelMinutes + waitMinutes;
      if (bestCandidate === null || score < bestMetrics.score) {
        bestCandidate = machine;
        bestIndex = index;
        bestMetrics = {
          score,
          travelDistance,
          travelMinutes,
          waitMinutes,
          arrival,
          departure,
          serviceDuration,
        };
      }
    });

    if (bestCandidate === null) {
      // Remaining machines cannot be scheduled due to windows or shift constraints
      pending.forEach((machine) => {
        unscheduled.push({
          ...machine,
          unscheduledReason: machine.unscheduledReason || 'Time window or shift constraint',
        });
      });
      break;
    }

    remainingCapacity = Math.max(0, remainingCapacity - (Number(bestCandidate.demandUnits) || 0));
    totalDistance += bestMetrics.travelDistance;

    itinerary.push({
      machineId: bestCandidate.id,
      machineCode: bestCandidate.machineCode,
      locationId: bestCandidate.locationId,
      locationName: bestCandidate.location?.name || bestCandidate.locationName,
      eta: bestMetrics.arrival.toISOString(),
      departure: bestMetrics.departure.toISOString(),
      travelMinutes: Number(bestMetrics.travelMinutes.toFixed(2)),
      travelDistanceKm: Number(bestMetrics.travelDistance.toFixed(2)),
      waitMinutes: Number(bestMetrics.waitMinutes.toFixed(2)),
      serviceDurationMinutes: bestMetrics.serviceDuration,
      remainingCapacity: Number(remainingCapacity.toFixed(2)),
      demandUnits: Number(bestCandidate.demandUnits) || 0,
      items: bestCandidate.items || [],
    });

    cursor = { lat: bestCandidate.latitude, lng: bestCandidate.longitude };
    clock = new Date(bestMetrics.departure);
    pending.splice(bestIndex, 1);
  }

  const totalDuration = itinerary.length
    ? (new Date(itinerary[itinerary.length - 1].departure).getTime() - startDate.getTime()) / 60000
    : 0;

  return {
    stops: itinerary,
    totalDistanceKm: Number(totalDistance.toFixed(2)),
    totalDurationMinutes: Number(totalDuration.toFixed(2)),
    startTime: startDate.toISOString(),
    endTime: itinerary.length ? itinerary[itinerary.length - 1].departure : endDate ? endDate.toISOString() : null,
    vehicleCapacity,
    unscheduled,
  };
};

