// src/components/LearningPatternsPanel.tsx
import { Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Pattern } from '@/types/spirit';

interface LearningPatternsPanelProps {
  conversationId: string;
  messageCount: number;
}

export const LearningPatternsPanel = ({ conversationId, messageCount }: LearningPatternsPanelProps) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatterns = async () => {
    if (!conversationId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/patterns?conversationId=${conversationId}`);
      const data = await response.json();
      if (data.data?.getConversationPatterns?.patterns) {
        setPatterns(data.data.getConversationPatterns.patterns);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, [conversationId, messageCount]);

  return (
    <div className="w-80 border-l bg-white p-4 overflow-auto hidden md:block">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Learning Patterns
      </h2>
      
      {isLoading ? (
        <div className="text-gray-500 text-sm">Loading patterns...</div>
      ) : patterns.length === 0 ? (
        <p className="text-gray-500 text-sm">
          As you share your thoughts, I'll observe any natural learning patterns that emerge.
        </p>
      ) : (
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <div 
              key={pattern.patternId}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-2">
                {pattern.observation}
              </p>
              <div className="text-xs text-gray-400">
                Confidence: {(pattern.confidence * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};