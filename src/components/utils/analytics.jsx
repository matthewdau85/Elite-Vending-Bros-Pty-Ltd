import { trackGA4Event as trackBackendEvent } from '@/api/functions';

/**
 * Tracks a custom event, sending it to the backend only if user has consented.
 * The backend then securely forwards it to the analytics service (e.g., GA4).
 *
 * @param {string} eventName - The name of the event (e.g., 'page_view', 'feature_used').
 * @param {object} [eventParams={}] - A dictionary of parameters to associate with the event.
 */
export const trackGA4Event = (eventName, eventParams = {}) => {
  if (typeof window === 'undefined') return;

  const consent = localStorage.getItem('analytics_consent');
  
  // Only track if consent is explicitly granted
  if (consent !== 'granted') {
    return;
  }

  if (!eventName) {
    console.warn("Analytics Tracking: eventName is required.");
    return;
  }

  // Asynchronously call the backend function to track the event
  trackBackendEvent({ eventName, params: eventParams })
    .catch(error => {
      // Silently fail - analytics should never break the app
      console.warn(`Failed to track event '${eventName}':`, error);
    });
};