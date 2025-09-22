import { useState, useEffect } from 'react';
import { useLocalStorage } from '../shared/useLocalStorage';
import { appConfig, isDevelopment } from './env';

// Production-ready feature flags with environment awareness
export const FEATURE_FLAGS = {
  // Core features - always enabled in production
  'core.alerts': true,
  'core.inventory': true,
  'core.routes': true,
  'core.machines': true,
  'core.locations': true,
  'core.sales': true,

  // Payment features
  'payments.core': false,
  'payments.refunds': false,
  'payments.settlements': false,

  // Advanced features - disabled by default
  'telemetry.advanced': false,
  'ai.insights': false,
  'ai.forecasting': false,
  'ai.agent': false,

  // Energy & sustainability
  'energy.monitoring': true,
  'energy.optimization': false,
  'esg.reporting': false,

  // Integrations
  'integrations.xero': false,
  'integrations.stripe': false,
  'integrations.maps': true,
  'integrations.weather': true,

  // Developer features
  'dev.portal': false,
  'dev.api': false,

  // Mobile & PWA
  'mobile.app': true,
  'pwa.offline': true,

  // Admin features
  'admin.observability': false,
  'admin.audit': true,
  'admin.security': true,
};

export const useFeatureFlags = () => {
  const [localFlags, setLocalFlags] = useLocalStorage('featureFlags', {});
  const [flags, setFlags] = useState(FEATURE_FLAGS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // In development, allow local overrides
    if (isDevelopment()) {
      setFlags({ ...FEATURE_FLAGS, ...localFlags });
    } else {
      // In production, use only predefined flags
      setFlags(FEATURE_FLAGS);
    }
    setIsInitialized(true);
  }, [localFlags]);

  const toggleFlag = (flagKey) => {
    if (!isDevelopment()) {
      console.warn('Feature flags can only be modified in development mode');
      return;
    }
    
    const newValue = !flags[flagKey];
    const newLocalFlags = { ...localFlags, [flagKey]: newValue };
    setLocalFlags(newLocalFlags);
  };

  const checkFlag = (flagKey) => {
    return flags[flagKey] || false;
  };

  const resetFlags = () => {
    if (isDevelopment()) {
      setLocalFlags({});
    }
  };

  return {
    flags,
    checkFlag,
    toggleFlag,
    resetFlags,
    isInitialized,
    isDevelopmentMode: isDevelopment(),
  };
};

// Feature Flag Component
export const FeatureFlag = ({ flag, children, fallback = null }) => {
  const { checkFlag, isInitialized } = useFeatureFlags();
  
  if (!isInitialized) {
    return null; // Or a loading spinner
  }
  
  return checkFlag(flag) ? children : fallback;
};