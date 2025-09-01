import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "68a9859032719af23976947e", 
  requiresAuth: true // Ensure authentication is required for all operations
});
