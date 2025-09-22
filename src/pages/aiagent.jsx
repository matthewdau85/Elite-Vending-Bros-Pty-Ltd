
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AiConversation, AiMessage, User } from '@/api/entities';
import { agentSDK } from '@/agents';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { MoreVertical, Send, MessageSquare, Plus, Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { softDeleteConversation, restoreConversation, purgeConversation } from '@/api/functions/ai';
import MessageBubble from '../components/ai/MessageBubble';
import EmptyState from '../components/shared/EmptyState';
import ConfirmationDialog from '../components/shared/ConfirmationDialog';

const AGENT_NAME = 'vendingOperationsAgent'; // Keep AGENT_NAME as it's used in createConversation and other places.

const ConversationItem = ({ conversation, isActive, onSelect }) => (
  <div
    onClick={onSelect}
    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
      isActive
        ? "bg-blue-50 border border-blue-200"
        : "hover:bg-slate-50 border border-transparent"
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate text-sm text-slate-900">
          {conversation.title || `Untitled Chat`}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {conversation.last_message_at ? formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true }) : 'No messages'}
        </p>
      </div>
    </div>
  </div>
);

const TrashedConversationBanner = ({ conversation, onRestore, onPurge }) => {
  if (!conversation?.deleted_at) return null;

  const purgeCountdown = conversation.purge_at 
    ? formatDistanceToNow(new Date(conversation.purge_at), { addSuffix: true })
    : 'N/A';
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-md">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-800">This conversation is in the trash.</h4>
          <p className="text-sm text-yellow-700">
            It will be permanently deleted {purgeCountdown}.
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRestore}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restore
          </Button>
          <Button size="sm" variant="destructive" onClick={onPurge}>
            Delete Forever
          </Button>
        </div>
      </div>
    </div>
  );
};

const ConversationHeader = ({ conversation, onDelete, disabled }) => {
  if (!conversation) return <div className="h-[65px]" />;

  return (
    <div className="flex items-center justify-between p-4 border-b h-[65px]">
      <h3 className="font-semibold text-lg">{conversation.title || "Untitled Chat"}</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={disabled}>
            <MoreVertical className="w-5 h-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onDelete} className="text-red-600">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function AiAgentPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPurgeConfirmOpen, setIsPurgeConfirmOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const navigate = useNavigate();
  const { conversationId } = useParams();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };
  
  useEffect(() => {
    loadUser();
  }, []);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch only non-deleted conversations
      const convos = await AiConversation.filter({ 'deleted_at': null }, '-last_message_at');
      setConversations(convos);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      toast.error("Could not load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    let unsubscribe;
    if (conversationId) {
      setLoading(true);
      const fetchAndSubscribe = async () => {
        try {
          const conversation = await AiConversation.get(conversationId);
          setActiveConversation(conversation);
          unsubscribe = agentSDK.subscribeToConversation(conversationId, (data) => {
            if (data) {
              setMessages(data.messages || []);
              setActiveConversation(prev => ({ ...prev, ...data }));
            }
          });
        } catch (error) {
          console.error("Failed to get conversation:", error);
          toast.error("Could not load conversation details.");
          setActiveConversation(null);
          setMessages([]);
          navigate('/aiagent'); // Redirect if conversation not found or error
        } finally {
          setLoading(false);
        }
      };
      fetchAndSubscribe();
    } else {
      setActiveConversation(null);
      setMessages([]);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [conversationId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const createNewConversation = async () => {
    setIsCreating(true);
    try {
      const newConversation = await agentSDK.createConversation({
        agent_name: AGENT_NAME,
        title: `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      });
      await loadConversations();
      navigate(`/aiagent/${newConversation.id}`);
      toast.success("New chat started.");
    } catch (error) {
      console.error("Failed to create new conversation:", error);
      toast.error("Could not start a new chat.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    // Prevent sending messages to a deleted conversation
    if (activeConversation.deleted_at) {
      toast.error("Cannot send messages to a conversation in the trash.");
      return;
    }

    setIsSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      await agentSDK.addMessage(activeConversation, { role: 'user', content: messageContent });
      // Optimistically update last message time
      // This is handled by the subscription, but can also be set immediately for faster UI
      // activeConversation.last_message_at = new Date().toISOString();
      // setConversations(prev => [activeConversation, ...prev.filter(c => c.id !== activeConversation.id)]);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleSoftDelete = async () => {
    if (!activeConversation) return;

    const originalConversation = { ...activeConversation };
    
    // Optimistic UI update
    setConversations(prev => prev.filter(c => c.id !== activeConversation.id));
    setActiveConversation(null); // Clear active conversation
    setMessages([]); // Clear messages
    navigate('/aiagent');

    toast("Conversation moved to trash.", {
      action: {
        label: "Undo",
        onClick: async () => {
          try {
            await restoreConversation({ conversationId: originalConversation.id });
            // Put it back in the list
            await loadConversations(); // Reload to get proper sort order and state
            navigate(`/aiagent/${originalConversation.id}`);
            toast.success("Conversation restored.");
          } catch (error) {
            toast.error("Failed to undo delete.");
          }
        },
      },
    });

    try {
      await softDeleteConversation({ conversationId: originalConversation.id });
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
      // Revert optimistic update on failure
      await loadConversations(); // Reload to put it back
      navigate(`/aiagent/${originalConversation.id}`);
    }
  };

  const handleRestore = async () => {
    if (!activeConversation) return;
    try {
      await restoreConversation({ conversationId: activeConversation.id });
      toast.success("Conversation restored.");
      // Reload the conversation to clear the deleted_at flag
      const restoredConvo = await AiConversation.get(activeConversation.id);
      setActiveConversation(restoredConvo);
      // Add it back to the main list
      await loadConversations();
    } catch (error) {
      toast.error(`Restore failed: ${error.message}`);
    }
  };

  const handleConfirmPurge = async () => {
    if (!activeConversation) return;
    try {
      await purgeConversation({ conversationId: activeConversation.id });
      toast.success("Conversation permanently deleted.");
      setIsPurgeConfirmOpen(false);
      setConversations(prev => prev.filter(c => c.id !== activeConversation.id));
      setActiveConversation(null);
      setMessages([]);
      navigate('/aiagent');
    } catch (error) {
      toast.error(`Purge failed: ${error.message}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] border rounded-lg overflow-hidden">
      <aside className="w-80 border-r flex flex-col bg-white">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">Conversations</h2>
          <Button variant="ghost" size="icon" onClick={createNewConversation} disabled={isCreating}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <ScrollArea className="flex-1 py-2">
          <div className="space-y-1 px-3">
            {loading && conversations.length === 0 ? (
              <div className="text-center p-4 text-slate-500">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-4 text-slate-500 text-sm">No active conversations. Start a new one!</div>
            ) : (
              conversations.map(convo => (
                <ConversationItem
                  key={convo.id}
                  conversation={convo}
                  isActive={convo.id === activeConversation?.id}
                  onSelect={() => navigate(`/aiagent/${convo.id}`)}
                />
              ))
            )}
          </div>
        </ScrollArea>
        {currentUser?.app_role === 'admin' && (
          <div className="p-2 border-t">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => navigate('/ai/trash')}>
              <Trash2 className="w-4 h-4" />
              Trash
            </Button>
          </div>
        )}
      </aside>
      <main className="flex-1 flex flex-col bg-slate-50">
        <ConversationHeader
          conversation={activeConversation}
          onDelete={handleSoftDelete}
          disabled={!activeConversation || isSending}
        />
        <div className="flex-1 p-6 overflow-y-auto">
          {activeConversation ? (
            <div>
              <TrashedConversationBanner 
                conversation={activeConversation}
                onRestore={handleRestore}
                onPurge={() => setIsPurgeConfirmOpen(true)}
              />
              <div className="space-y-6">
                {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
                <div ref={messagesEndRef} />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Welcome to the AI Agent"
              description="Select a conversation from the sidebar or start a new one to begin."
            >
              <Button onClick={createNewConversation} className="mt-4" disabled={isCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Start New Chat
              </Button>
            </EmptyState>
          )}
        </div>
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask me about your business data, sales trends, or operational insights..."
              disabled={isSending || !activeConversation || activeConversation.deleted_at}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSending || !newMessage.trim() || !activeConversation || activeConversation.deleted_at}
              className="px-6"
            >
              {isSending ? (
                <span>Sending...</span>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </main>

      <ConfirmationDialog
        isOpen={isPurgeConfirmOpen}
        onClose={() => setIsPurgeConfirmOpen(false)}
        onConfirm={handleConfirmPurge}
        title="Permanently Delete Conversation?"
        description="This action cannot be undone. All messages and data associated with this conversation will be permanently removed."
        confirmText="Yes, Delete Forever"
        icon={<AlertTriangle className="text-destructive w-6 h-6" />}
      />
    </div>
  );
}
