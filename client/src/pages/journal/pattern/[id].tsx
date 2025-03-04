
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ChevronLeft, Loader2, Lock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeLearningPatterns } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast'; // Fixed import path
import { useWallet } from '@/hooks/useWallet'; // Fixed import path
import { JournalEntry } from '@shared/schema';

export default function PatternPage() {
  const [_, navigate] = useLocation();
  const id = window.location.pathname.split('/').pop();
  const { account } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const response = await fetch('/api/journal');
      if (!response.ok) {
        throw new Error('Failed to fetch journal entries');
      }
      return response.json();
    },
    enabled: !!account,
  });

  const { data: patterns = [], isLoading: patternsLoading } = useQuery({
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

  // Find the current pattern
  const pattern = patterns.find(p => p.id.toString() === id);

  // Find entries that are related to this pattern
  const relatedEntries = entries.filter(entry => 
    pattern?.relatedConcepts?.some(concept => 
      entry.title.toLowerCase().includes(concept.toLowerCase()) || 
      entry.content.toLowerCase().includes(concept.toLowerCase())
    )
  );

  const toggleSharing = useMutation({
    mutationFn: async (checked: boolean) => {
      if (!pattern) {
        throw new Error('Pattern not found');
      }
      
      const relatedEntry = relatedEntries.find(entry => 
        entry.wallet_address === account
      );
      
      if (!relatedEntry) {
        throw new Error('No entries found that you can share');
      }

      const response = await fetch(`/api/journal/${relatedEntry.id}/share`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_shared: checked }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sharing status');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      toast({
        title: 'Sharing updated',
        description: 'Your journal sharing preferences have been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Check if the user has any entries related to this pattern
  const userHasRelatedEntries = relatedEntries.some(entry => entry.wallet_address === account);
  
  // Determine if the user's related entry is shared
  const isUserEntryShared = relatedEntries.find(
    entry => entry.wallet_address === account
  )?.is_shared || false;

  if (entriesLoading || patternsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading pattern insights...</p>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pattern not found</h2>
          <p className="text-muted-foreground mb-4">
            The learning pattern you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/journal')}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/journal')}
          className="mb-4"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Journal
        </Button>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{pattern.topic}</h1>
          
          {userHasRelatedEntries && (
            <div className="flex items-center space-x-2">
              {isUserEntryShared ? (
                <Share2 className="h-4 w-4 text-primary" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              <Switch
                checked={isUserEntryShared}
                onCheckedChange={(checked) => toggleSharing.mutate(checked)}
                disabled={toggleSharing.isPending}
              />
              <span className="text-sm font-medium">
                {isUserEntryShared ? 'Shared' : 'Private'}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-lg text-muted-foreground mt-2">{pattern.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {pattern.relatedConcepts.map((concept, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {concept}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Related Journal Entries</h2>
        
        {relatedEntries.length === 0 ? (
          <p className="text-muted-foreground">No related entries found.</p>
        ) : (
          relatedEntries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">{entry.title}</h3>
                  <div className="flex items-center">
                    {entry.is_shared ? (
                      <Share2 className="h-4 w-4 text-primary mr-2" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground mr-2" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {entry.wallet_address === account
                        ? 'You'
                        : `${entry.wallet_address.slice(0, 6)}...${entry.wallet_address.slice(-4)}`}
                    </span>
                  </div>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: entry.content }} />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
