import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type JournalEntry } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2, Share2, Lock, BookmarkPlus, BookmarkCheck, Sparkles } from 'lucide-react';
import { analyzeLearningPatterns } from '@/lib/openai';
import { useLocation } from 'wouter';
import { useWallet } from '@/hooks/useWallet';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface Props {
  entries: JournalEntry[];
  viewMode: 'recent' | 'learning' | 'shared';
}

export function LearningConstellation({ entries, viewMode }: Props) {
  const [_, navigate] = useLocation();
  const { account } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAllJournals, setShowAllJournals] = useState(false);

  // Show Spirit Study placeholder when in learning mode
  if (viewMode === 'learning') {
    return (
      <div className="grid place-items-center h-96">
        <Card className="max-w-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <Sparkles className="w-12 h-12 text-blue-500" />
          </div>
          <h3 className="text-2xl font-semibold mb-4">
            Spirit Study Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            We're building an intelligent learning system that analyzes your journal entries
            to create personalized learning paths. Spirit Study will help you discover
            patterns in your learning journey and suggest optimal ways to deepen your understanding.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">What to Expect</h4>
            <ul className="text-sm text-blue-600 text-left list-disc list-inside space-y-2">
              <li>AI-powered learning path recommendations</li>
              <li>Personalized study materials based on your interests</li>
              <li>Progress tracking and adaptive learning suggestions</li>
              <li>Connection to a community of like-minded learners</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  // Get all patterns
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['learning-patterns', entries.map(e => e.id).join(',')],
    queryFn: async () => {
      const entryData = entries.map(entry => ({
        title: entry.title,
        content: entry.content,
        isShared: entry.is_shared,
        creator: entry.wallet_address,
        id: entry.id,
        inPrivateCollection: entry.inPrivateCollection || false
      }));
      return analyzeLearningPatterns(entryData);
    },
    enabled: entries.length > 0,
  });

  // Add to private collection mutation
  const addToPrivate = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/journal/entries/${entryId}/collect?wallet_address=${account}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to add to private collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      toast({
        title: "Added to Collection",
        description: "Journal added to your private collection.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add to private collection. Please try again.",
      });
    }
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

  // Filter patterns based on view mode
  const displayPatterns = (() => {
    switch (viewMode) {
      case 'shared':
        return patterns.filter(pattern => 
          pattern.isShared && pattern.creator !== account
        );
      case 'recent':
        return patterns.filter(pattern => 
          pattern.creator === account || pattern.inPrivateCollection
        );
      default:
        return patterns.filter(pattern => pattern.creator === account);
    }
  })();

  return (
    <div>
      {viewMode === 'recent' && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={showAllJournals}
              onCheckedChange={setShowAllJournals}
            />
            <span className="text-sm text-gray-600">
              {showAllJournals ? 'Showing All Journals' : 'Showing My Journals'}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {displayPatterns.map((pattern, index) => (
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
              {pattern.creator !== account && pattern.isShared && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addToPrivate.mutate(pattern.id)}
                  disabled={addToPrivate.isPending || pattern.inPrivateCollection}
                >
                  {pattern.inPrivateCollection ? (
                    <BookmarkCheck className="w-4 h-4 text-[#B4A170]" />
                  ) : (
                    <BookmarkPlus className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>

            <span className="text-sm font-medium">{pattern.topic}</span>

            <p className="text-gray-600 mb-4">{pattern.description}</p>

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
    </div>
  );
}