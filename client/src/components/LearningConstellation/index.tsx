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
import { apiRequest } from '@/lib/queryClient';

interface Props {
  entries: JournalEntry[];
  viewMode: 'recent' | 'learning' | 'shared';
}

export function LearningConstellation({ entries, viewMode }: Props) {
  const [_, navigate] = useLocation();
  const { account } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAllPatterns, setShowAllPatterns] = useState(false);

  // Get all patterns
  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['learning-patterns', entries.map(e => e.id).join(',')],
    queryFn: async () => {
      const entryData = entries.map(entry => ({
        title: entry.title,
        content: entry.content,
        isShared: entry.is_shared,
        creator: entry.wallet_address,
        id: entry.id
      }));
      return analyzeLearningPatterns(entryData);
    },
    enabled: entries.length > 0,
  });

  // Toggle sharing mutation
  const toggleSharing = useMutation({
    mutationFn: async ({ entryId, isShared }: { entryId: number; isShared: boolean }) => {
      await apiRequest('PATCH', `/api/journal/entries/${entryId}/share`, {
        shared: isShared
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      queryClient.invalidateQueries({ queryKey: ['learning-patterns'] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update sharing status. Please try again.",
      });
    }
  });

  // Add to private collection mutation
  const addToPrivate = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await apiRequest('POST', `/api/journal/entries/${entryId}/collect?wallet_address=${account}`, {});
      if (!response.ok) throw new Error('Failed to add to private collection');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-patterns'] });
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      toast({
        title: "Added to Collection",
        description: "Pattern added to your private collection.",
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

  // Render loading state
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

  // Filter patterns based on view mode and sharing preferences
  const displayPatterns = (() => {
    switch (viewMode) {
      case 'shared':
        // Only show patterns from shared entries by other users
        return patterns.filter(pattern =>
          pattern.isShared && pattern.creator !== account
        );
      case 'recent':
        // Show either all patterns or just the user's own
        return showAllPatterns
          ? patterns
          : patterns.filter(pattern => pattern.creator === account);
      default:
        // Default to showing user's own patterns
        return patterns.filter(pattern => pattern.creator === account);
    }
  })();

  return (
    <div>
      {viewMode === 'recent' && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Switch
              checked={showAllPatterns}
              onCheckedChange={setShowAllPatterns}
            />
            <span className="text-sm text-gray-600">
              {showAllPatterns ? 'Showing All Patterns' : 'Showing My Patterns'}
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
              <div className="flex gap-2">
                {pattern.creator === account && (
                  <Switch
                    checked={pattern.isShared}
                    onCheckedChange={(checked) => 
                      toggleSharing.mutate({ entryId: pattern.id, isShared: checked })
                    }
                    aria-label="Toggle sharing"
                  />
                )}
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
              onClick={() => navigate(`/journal/pattern/${pattern.id}`)}
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