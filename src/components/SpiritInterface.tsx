"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Send, Sparkles, RefreshCcw } from 'lucide-react';
import type { Message, SpiritChatResponse } from '@/types/spirit';

const SpiritInterface = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to generate a new conversation ID
  const startNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setConversationId(newId);
    setMessages([]); // Clear existing messages
    console.log('Starting new conversation with ID:', newId);
  };

  // Initial conversation setup
  useEffect(() => {
    startNewConversation();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setIsLoading(true);
    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationId
        })
      });

      const result = await response.json() as SpiritChatResponse;
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.data.spiritChat,
        timestamp: new Date().toISOString()
      }]);

    } catch (error) {
      console.error('Error:', error);
      let errorMessage = 'I apologize, but I encountered an error. Please try again.';

      if (error instanceof Error && error.message.includes('API key not configured')) {
        errorMessage = 'The system is not properly configured. Please check the API key setup.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col max-w-3xl mx-auto p-4">
        <Card className="flex-1 mb-4 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spirit Framework</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={startNewConversation}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              New Conversation
            </Button>
          </CardHeader>
          <CardContent className="overflow-auto h-[calc(100vh-280px)] space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="w-80 border-l bg-white p-4 overflow-auto hidden md:block">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Learning Patterns
        </h2>
        <p className="text-gray-500 text-sm">
          As you share your thoughts, I'll observe any natural learning patterns that emerge.
        </p>
      </div>
    </div>
  );
};

export default SpiritInterface;