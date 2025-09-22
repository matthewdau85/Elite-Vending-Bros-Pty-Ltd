
import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../shared/useLocalStorage';

// Default state of all features. False means OFF.
export const defaultFlags = {
  'payments.core': false,
  'refunds.portal': false,
  'telemetry.alerts': true, // Assuming alerts are a core, visible feature
  'mobile.field-app': false,
  'pwa.offline': true, // Enable PWA by default for a better base experience
  'accounting.xero-sync': false,
  'accounting.stripe-reconcile': false,
  'inventory.lottracking': true,
  'energy.monitoring': true,
  'esg.reports': false,
  'location.intelligence': true,
  'api.public': false, // Developer Portal
  'observability.core': false, // System Health/Metrics
};

export const useFeatureGate = () => {
  const [flags, setFlags] = useLocalStorage('featureFlags', defaultFlags);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Ensure localStorage is synced and defaults are applied for any new flags
    setFlags(currentFlags => ({
      ...defaultFlags,
      ...currentFlags
    }));
    setIsInitialized(true);
  }, [setFlags]);
  
  const checkFlag = useCallback((featureKey) => {
    if (!isInitialized) return defaultFlags[featureKey] || false;
    return flags[featureKey] || false;
  }, [flags, isInitialized]);

  const toggleFlag = (featureKey) => {
    setFlags(prevFlags => ({
      ...prevFlags,
      [featureKey]: !prevFlags[featureKey]
    }));
  };

  return { flags: isInitialized ? flags : defaultFlags, checkFlag, toggleFlag, isInitialized };
};
