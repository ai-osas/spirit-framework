// src/components/LearningPatternsPanel.tsx
import { Sparkles, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Pattern, PatternsResponse } from '@/types/spirit';

interface LearningPatternsPanelProps {
  conversationId: string;
}

export const LearningPatternsPanel = ({ conversationId }: LearningPatternsPanelProps) => {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPatterns = async () => {
    if (!conversationId) return;
    setIsLoading(true);

    try {
      const response = await fetch(`/api/patterns?conversationId=${conversationId}`);
      const data = await response.json() as PatternsResponse;
      if (data.patterns) {
        setPatterns(data.patterns);
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 border-l bg-white p-4 overflow-auto hidden md:block">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Learning Patterns
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchPatterns}
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Patterns found: {patterns.length}
      </div>

      {patterns.length > 0 && (
        <div className="space-y-4">
          {patterns.map((pattern) => (
            <div
              key={pattern.patternId}
              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <p className="text-sm text-gray-600 mb-2">
                {pattern.observation}
              </p>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{pattern.patternType}</span>
                <span>Confidence: {(pattern.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};