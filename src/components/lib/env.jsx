
// `import.meta.env` is not available in the base44 frontend environment.
// This is a simplified, static configuration to allow the app to build.
// For production, environment-specific variables like a Sentry DSN
// should be handled via the base44 secrets management, likely fetched by a backend function.

// Helper functions
export const isDevelopment = () => false; // Assume production for safety
export const isProduction = () => true;
// isStaging is removed as import.meta.env.MODE is no longer used or available.

// App configuration
export const appConfig = {
  name: 'Elite Vending Bros Pty Ltd',
  environment: 'production',
  base44AppId: '68a9859032719af23976947e',

  // Sentry is disabled as its DSN cannot be read from client-side env vars here.
  // This could be enabled via a backend function that provides the DSN.
  sentry: {
    dsn: null,
    enabled: false,
  },

  // Analytics are disabled for the same reason.
  analytics: {
    googleAnalyticsId: null,
    enabled: false,
  },

  // The Base44 User SDK should get its configuration automatically from the platform.
  // The previous custom `auth` object is removed to avoid conflicts.

  api: {
    baseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  },
};
