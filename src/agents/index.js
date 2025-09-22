import { AiConversation, AiMessage } from '@/api/entities';

const hasRemoteAgentSupport = Boolean(
  AiConversation && typeof AiConversation.create === 'function'
);

const POLL_INTERVAL = 5000;

async function fetchConversationWithMessages(conversationId) {
  if (!AiConversation || typeof AiConversation.get !== 'function') {
    throw new Error('AI conversation APIs are not available');
  }

  const conversation = await AiConversation.get(conversationId);
  let messages = [];

  try {
    if (AiMessage && typeof AiMessage.filter === 'function') {
      messages = await AiMessage.filter(
        { conversation_id: conversationId },
        'created_at'
      );
    }
  } catch (error) {
    console.warn('Failed to load conversation messages', error);
  }

  return { ...conversation, messages };
}

const remoteAgentSDK = {
  subscribeToConversation(conversationId, callback) {
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      try {
        const data = await fetchConversationWithMessages(conversationId);
        if (isActive) {
          callback?.(data);
        }
      } catch (error) {
        console.error('Failed to poll conversation updates', error);
      }
    };

    poll();
    const timer = setInterval(poll, POLL_INTERVAL);

    return () => {
      isActive = false;
      clearInterval(timer);
    };
  },

  async createConversation(payload) {
    if (!hasRemoteAgentSupport) {
      throw new Error('AI conversation creation is not supported.');
    }
    return AiConversation.create(payload);
  },

  async addMessage(conversation, message) {
    if (!AiMessage || typeof AiMessage.create !== 'function') {
      throw new Error('AI message creation is not supported.');
    }

    const payload = {
      conversation_id: conversation.id,
      ...message,
    };

    await AiMessage.create(payload);
  },
};

const fallbackConversations = new Map();
const fallbackSubscribers = new Map();
let fallbackCounter = 1;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function notifyFallbackSubscribers(conversationId) {
  const conversation = fallbackConversations.get(conversationId);
  const subscribers = fallbackSubscribers.get(conversationId);

  if (!conversation || !subscribers) return;

  const snapshot = clone(conversation);
  subscribers.forEach((callback) => {
    try {
      callback(snapshot);
    } catch (error) {
      console.error('Fallback subscriber callback failed', error);
    }
  });
}

const fallbackAgentSDK = {
  subscribeToConversation(conversationId, callback) {
    if (!fallbackSubscribers.has(conversationId)) {
      fallbackSubscribers.set(conversationId, new Set());
    }

    const subscribers = fallbackSubscribers.get(conversationId);
    subscribers.add(callback);

    const conversation = fallbackConversations.get(conversationId);
    if (conversation) {
      callback(clone(conversation));
    }

    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        fallbackSubscribers.delete(conversationId);
      }
    };
  },

  async createConversation(payload) {
    const id = `local-${fallbackCounter++}`;
    const conversation = {
      id,
      title: payload?.title ?? 'New conversation',
      agent_name: payload?.agent_name ?? 'default',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [],
    };

    fallbackConversations.set(id, conversation);
    notifyFallbackSubscribers(id);
    return clone(conversation);
  },

  async addMessage(conversation, message) {
    const existing = fallbackConversations.get(conversation.id);
    if (!existing) {
      throw new Error('Conversation not found in fallback store');
    }

    const entry = {
      id: `msg-${Date.now()}`,
      role: message?.role ?? 'user',
      content: message?.content ?? '',
      created_at: new Date().toISOString(),
    };

    existing.messages = [...(existing.messages || []), entry];
    existing.updated_at = entry.created_at;
    fallbackConversations.set(conversation.id, existing);
    notifyFallbackSubscribers(conversation.id);
  },
};

export const agentSDK = hasRemoteAgentSupport ? remoteAgentSDK : fallbackAgentSDK;

export default agentSDK;
