import { base44 } from '@/api/base44Client';

const agents = base44?.agents;

const noopUnsubscribe = () => {};

export const agentSDK = {
  subscribeToConversation(conversationId, callback) {
    if (agents?.subscribeToConversation) {
      return agents.subscribeToConversation(conversationId, callback);
    }

    console.warn('Agent subscription is not configured. Returning a no-op unsubscribe function.');
    return noopUnsubscribe;
  },

  async createConversation(payload) {
    if (agents?.createConversation) {
      return agents.createConversation(payload);
    }

    console.warn('Agent conversation creation is not configured. Returning null.');
    return null;
  },

  async addMessage(conversation, message) {
    if (agents?.addMessage) {
      return agents.addMessage(conversation, message);
    }

    console.warn('Agent message handling is not configured. No action performed.');
    return null;
  },
};
