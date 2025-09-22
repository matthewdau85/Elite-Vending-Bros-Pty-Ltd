import { appConfig, isDevelopment } from './env';

// Production-grade logging with proper correlation IDs and Sentry integration
class Logger {
  constructor() {
    this.correlationId = this.generateCorrelationId();
    this.userId = null;
    this.currentRoute = null;
    this.sentryEnabled = false;
    this.initializeSentry();
  }

  generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async initializeSentry() {
    if (!appConfig.sentry.enabled) return;

    try {
      // Dynamically import Sentry to avoid bundle bloat in development
      const Sentry = await import('@sentry/browser');
      
      Sentry.init({
        dsn: appConfig.sentry.dsn,
        environment: appConfig.environment,
        integrations: [
          new Sentry.BrowserTracing(),
        ],
        tracesSampleRate: isDevelopment() ? 1.0 : 0.1,
        beforeSend(event) {
          // Add correlation ID to all events
          event.extra = { ...event.extra, correlationId: logger.correlationId };
          return event;
        },
      });

      this.sentryEnabled = true;
      this.info('Sentry initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize Sentry:', error);
    }
  }

  setUser(user) {
    this.userId = user?.id || user?.email || null;
    
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.setUser({
        id: this.userId,
        email: user?.email,
        role: user?.app_role,
      });
    }
  }

  setRoute(route) {
    this.currentRoute = route;
    
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.addBreadcrumb({
        message: `Navigated to ${route}`,
        category: 'navigation',
        level: 'info',
      });
    }
  }

  createLogEntry(level, message, data = {}) {
    return {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      correlationId: this.correlationId,
      userId: this.userId,
      route: this.currentRoute,
      environment: appConfig.environment,
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...data,
    };
  }

  debug(message, data = {}) {
    if (!isDevelopment()) return;
    
    const entry = this.createLogEntry('debug', message, data);
    console.log('🔍 [DEBUG]', entry);
  }

  info(message, data = {}) {
    const entry = this.createLogEntry('info', message, data);
    console.log('ℹ️ [INFO]', entry);
    
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.addBreadcrumb({
        message,
        level: 'info',
        data,
      });
    }
  }

  warn(message, data = {}) {
    const entry = this.createLogEntry('warn', message, data);
    console.warn('⚠️ [WARN]', entry);
    
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.captureMessage(message, 'warning');
    }
  }

  error(message, error = null, data = {}) {
    const entry = this.createLogEntry('error', message, {
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : null,
      ...data,
    });
    
    console.error('🚨 [ERROR]', entry);
    
    if (this.sentryEnabled && window.Sentry) {
      if (error instanceof Error) {
        window.Sentry.captureException(error);
      } else {
        window.Sentry.captureMessage(message, 'error');
      }
    }
  }

  // Performance monitoring
  timing(name, duration, data = {}) {
    this.info(`⏱️ Performance: ${name}`, {
      duration,
      performanceEntry: name,
      ...data,
    });
  }

  // User action tracking
  userAction(action, data = {}) {
    this.info(`👤 User Action: ${action}`, {
      action,
      ...data,
    });
  }

  // Feature usage tracking
  featureUsed(feature, data = {}) {
    this.info(`🚀 Feature Used: ${feature}`, {
      feature,
      ...data,
    });
  }

  // Get session info for debugging
  getSessionInfo() {
    return {
      correlationId: this.correlationId,
      userId: this.userId,
      route: this.currentRoute,
      timestamp: new Date().toISOString(),
      environment: appConfig.environment,
    };
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export convenience methods
export const logDebug = (message, data) => logger.debug(message, data);
export const logInfo = (message, data) => logger.info(message, data);
export const logWarn = (message, data) => logger.warn(message, data);
export const logError = (message, error, data) => logger.error(message, error, data);
export const logTiming = (name, duration, data) => logger.timing(name, duration, data);
export const logUserAction = (action, data) => logger.userAction(action, data);
export const logFeatureUsed = (feature, data) => logger.featureUsed(feature, data);

export default logger;