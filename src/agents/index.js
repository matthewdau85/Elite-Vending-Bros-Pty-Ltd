// Base44 agentSDK stub — replace with real Base44 integration when credentials are available
export const agentSDK = {
  listConversations: async () => [],
  createConversation: async (opts) => ({ id: crypto.randomUUID(), messages: [], metadata: opts?.metadata || {}, created_date: new Date().toISOString() }),
  subscribeToConversation: (_id, _cb) => () => {},
  addMessage: async () => {},
};
