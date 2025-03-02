import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { type JournalEntry } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, Share2, Lock } from 'lucide-react';
import { analyzeLearningPatterns } from '@/lib/openai';
import { useLocation } from 'wouter';
import { useWallet } from '@/hooks/useWallet';

interface Props {
  entries: JournalEntry[];
}

export function LearningConstellation({ entries }: Props) {
  const [_, navigate] = useLocation();
  const { account } = useWallet();

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['learning-patterns', entries.map(e => e.id).join(',')],
    queryFn: async () => {
      const entryData = entries.map(entry => ({
        title: entry.title,
        content: entry.content,
        isShared: entry.is_shared,
        creator: entry.wallet_address
      }));
      return analyzeLearningPatterns(entryData);
    },
    enabled: entries.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid place-items-center h-96">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Analyzing your learning patterns...</p>
        </div>
      </div>
    );
  }

  if (patterns.length === 0) {
    return (
      <div className="grid place-items-center h-96">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">No Learning Patterns Yet</h3>
          <p className="text-gray-600">
            Start writing about what you're learning, and we'll help you identify patterns
            and connections in your knowledge journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {patterns.map((pattern, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              {pattern.isShared ? (
                <Share2 className="w-4 h-4 text-green-500" aria-label="Shared with Community" />
              ) : (
                <Lock className="w-4 h-4 text-[#B4A170]" aria-label="Private" />
              )}
              <span className="text-sm text-gray-500">
                Confidence: {Math.round(pattern.confidence * 100)}%
              </span>
            </div>
            <span className="text-sm font-medium">{pattern.topic}</span>
          </div>

          <p className="text-gray-600 mb-4">
            {pattern.description}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {pattern.relatedConcepts.slice(0, 4).map((concept: string, i: number) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-blue-100 border border-white grid place-items-center"
                  aria-label={concept}
                >
                  <span className="text-xs text-blue-700">
                    {concept.charAt(0).toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {pattern.relatedConcepts.length} related concepts
            </span>
          </div>

          <Button 
            variant="ghost" 
            className="w-full justify-between"
            onClick={() => navigate(`/journal/pattern/${index + 1}`)}
          >
            Explore Pattern
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
}