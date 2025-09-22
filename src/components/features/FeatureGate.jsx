import React from 'react';
import { useFeatureGate } from './useFeatureGate';

/**
 * Conditionally renders children based on a feature flag.
 * @param {object} props
 * @param {string} props.featureKey - The key of the feature to check.
 * @param {React.ReactNode} props.children - The content to render if the feature is enabled.
 * @param {React.ReactNode} [props.fallback=null] - The content to render if the feature is disabled.
 */
export default function FeatureGate({ featureKey, children, fallback = null }) {
  const { checkFlag, isInitialized } = useFeatureGate();

  if (!isInitialized) {
    // Render nothing or a loader until flags are initialized to prevent flicker
    return null; 
  }

  const isEnabled = checkFlag(featureKey);

  return isEnabled ? <>{children}</> : <>{fallback}</>;
}