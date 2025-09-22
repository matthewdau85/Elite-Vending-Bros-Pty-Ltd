// Server-side environment validation for Deno functions
// This file is only used in backend functions, never shipped to client

const requiredServerEnvs = [
  'BASE44_APP_ID',
] ;

const optionalServerEnvs = [
  'XERO_CLIENT_ID',
  'XERO_CLIENT_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_SQS_QUEUE_URL',
  'NAYAX_API_KEY',
  'NAYAX_API_SECRET',
  'OPENAI_API_KEY',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
  'RESEND_API_KEY',
  'OPENWEATHERMAP_API_KEY',
  'GOOGLE_MAPS_API_KEY',
  'GA4_MEASUREMENT_ID',
  'GA4_API_SECRET',
  'STEP_UP_SECRET',
  'JWT_SECRET',
];

// Validated environment cache
let envCache = null;

// Get and validate server environment
export function getServerEnv() {
  if (envCache) return envCache;

  // Check required environment variables
  const missing = [];
  const env = {};

  // Validate required envs
  for (const key of requiredServerEnvs) {
    const value = Deno.env.get(key);
    if (!value) {
      missing.push(key);
    }
    env[key] = value;
  }

  // Get optional envs
  for (const key of optionalServerEnvs) {
    env[key] = Deno.env.get(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your environment variables in the base44 dashboard settings.'
    );
  }

  envCache = env;
  return env;
}

// Helper to get a specific env var with validation
export function requireServerEnv(key) {
  const value = Deno.env.get(key);
  
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  
  return value;
}

// Helper to get optional env var
export function getOptionalServerEnv(key) {
  return Deno.env.get(key);
}

// Feature flag helpers
export function isFeatureEnabled(feature) {
  const value = Deno.env.get(`ENABLE_${feature.toUpperCase()}`);
  return value === 'true' || value === '1';
}

// Environment helpers
export const isServerDevelopment = () => Deno.env.get('NODE_ENV') === 'development';
export const isServerProduction = () => Deno.env.get('NODE_ENV') === 'production';