import React, { useState, useEffect } from "react";
import { agentSDK } from "@/agents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  MessageSquare, 
  Plus,
  Clock,
  Sparkles,
  TrendingUp,
  Brain,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

import MessageBubble from "../components/ai/MessageBubble";

export default function AIAgent() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      // Subscribe to conversation updates for real-time message streaming
      const unsubscribe = agentSDK.subscribeToConversation(activeConversation.id, (data) => {
        setMessages(data.messages || []);
      });

      return () => unsubscribe();
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const conversationList = await agentSDK.listConversations({
        agent_name: "vendingOperationsAgent"
      });
      setConversations(conversationList);
      
      // Auto-select the most recent conversation or create a new one
      if (conversationList.length > 0) {
        const latest = conversationList[0];
        setActiveConversation(latest);
        setMessages(latest.messages || []);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
    setIsLoading(false);
  };

  const createNewConversation = async () => {
    try {
      const newConversation = await agentSDK.createConversation({
        agent_name: "vendingOperationsAgent",
        metadata: {
          name: `Business Chat ${new Date().toLocaleDateString()}`,
          description: "AI-powered business operations discussion"
        }
      });
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      setMessages([]);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !activeConversation || isSending) return;

    setIsSending(true);
    const messageText = inputMessage.trim();
    setInputMessage("");

    try {
      await agentSDK.addMessage(activeConversation, {
        role: "user",
        content: messageText
      });
      
      // The subscription will handle updating messages automatically
    } catch (error) {
      console.error("Error sending message:", error);
      setInputMessage(messageText); // Restore message on error
    }
    setIsSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedPrompts = [
    "Analyze this week's sales performance",
    "Which machines need restocking?", 
    "Show me profit margins by location",
    "What maintenance is due this month?",
    "Recommend route optimization",
    "Find underperforming products"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Business Assistant
              </h1>
              <p className="text-slate-600 text-lg">
                Your intelligent partner for vending machine operations and insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-medium">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Agent Active
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
              <Brain className="w-4 h-4" />
              Business Intelligence Mode
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversations Sidebar */}
          <Card className="lg:col-span-1 border-0 shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <Button size="sm" onClick={createNewConversation}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setActiveConversation(conversation);
                        setMessages(conversation.messages || []);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        activeConversation?.id === conversation.id
                          ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-medium text-sm truncate">
                        {conversation.metadata?.name || "New Conversation"}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {new Date(conversation.created_date).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <div className="lg:col-span-3 space-y-6">
            {/* Messages */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <ScrollArea className="h-[500px] p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-indigo-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Ready to Help with Your Business
                      </h3>
                      <p className="text-slate-500 mb-6">
                        Ask me anything about your vending machine operations, sales, inventory, or performance insights.
                      </p>
                      
                      {/* Suggested Prompts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                        {suggestedPrompts.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(prompt)}
                            className="p-3 text-left bg-slate-50 hover:bg-slate-100 rounded-lg border transition-colors text-sm"
                          >
                            <TrendingUp className="w-4 h-4 text-indigo-600 mb-2" />
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                      ))}
                      {isSending && (
                        <div className="flex justify-start">
                          <div className="bg-white border rounded-2xl px-4 py-3 flex items-center gap-3">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                            <span className="text-slate-600 text-sm">AI is thinking...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Message Input */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Ask about sales, inventory, maintenance, or any business insights..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!activeConversation || isSending}
                      className="text-base py-3 px-4"
                    />
                  </div>
                  <Button 
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || !activeConversation || isSending}
                    className="bg-indigo-600 hover:bg-indigo-700 px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}