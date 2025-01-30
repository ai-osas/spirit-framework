"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Brain, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Message, FollowUpQuestion, ChatResponse } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { getStoredTokens } from '@/lib/auth';

interface ChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDialog: React.FC<ChatDialogProps> = ({ isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([{
    content: "How would you like to explore your learning patterns today?",
    sender: 'assistant'
  }]);
  const [input, setInput] = useState('');
  const [followUps, setFollowUps] = useState<FollowUpQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || !isAuthenticated) return;

    setMessages(prev => [...prev, { content, sender: 'user' }]);
    setInput('');
    setIsLoading(true);

    try {
      const tokens = getStoredTokens();
      if (!tokens?.access_token) {
        throw new Error('No auth token available');
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.access_token}`
        },
        body: JSON.stringify({
          message: content,
          user: {
            id: user?.id,
            name: user?.name,
            email: user?.email
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Chat error:', errorText);
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      if (data.message) {
        setMessages(prev => [...prev, {
          content: data.message,
          sender: 'assistant'
        }]);

        if (Array.isArray(data.followUpQuestions)) {
          setFollowUps(data.followUpQuestions.map(q => ({
            question: q,
            isSelected: false
          })));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);

      // Check if it's an auth error
      if (error instanceof Error && error.message.includes('401')) {
        setMessages(prev => [...prev, {
          content: "Please log in again to continue our conversation.",
          sender: 'assistant'
        }]);
      } else {
        setMessages(prev => [...prev, {
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
          sender: 'assistant'
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleFollowUpClick = (question: string) => {
    setInput(question);
    setFollowUps(prev => prev.map(f => ({
      ...f,
      isSelected: f.question === question
    })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col border-2 border-blue-200 z-50">
      {/* Header */}
      <div className="p-4 border-b bg-blue-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-medium">Pattern Assistant</h3>
        </div>
        <button 
          onClick={onClose} 
          className="hover:bg-blue-100 p-1 rounded-full"
          aria-label="Close chat"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {/* Follow-up Questions */}
        {followUps.length > 0 && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Follow-up questions to consider:</p>
            {followUps.map((followUp, i) => (
              <button
                key={i}
                onClick={() => handleFollowUpClick(followUp.question)}
                className={`text-sm text-left p-2 rounded-lg w-full hover:bg-gray-50 transition-colors ${
                  followUp.isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {followUp.question}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share your insights..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            size="icon"
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
          >
            <Send className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </div>
  );
};