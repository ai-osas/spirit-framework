import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2, Share2, Lock } from 'lucide-react';
import { type JournalEntry } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeLearningPatterns } from '@/lib/openai';
import { useWallet } from '@/hooks/useWallet';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function ExplorePatternPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { account } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/entries', account],
    queryFn: async () => {
      if (!account) return [];
      const response = await fetch(`/api/journal/entries?wallet_address=${account}`);
      if (!response.ok) throw new Error('Failed to fetch entries');
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

  const toggleSharing = useMutation({
    mutationFn: async (isShared: boolean) => {
      await apiRequest('PATCH', `/api/journal/entries/${id}/share`, {
        shared: isShared
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });
      queryClient.invalidateQueries({ queryKey: ['learning-patterns'] });
      toast({
        title: "Sharing Updated",
        description: "Your pattern sharing preferences have been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating sharing status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update sharing status",
      });
    }
  });

  const isLoading = entriesLoading || patternsLoading;

  // Find the pattern by matching the entry ID instead of array index
  const pattern = patterns.find(p => p.id === Number(id));

  if (isLoading) {
    return (
      <div className="grid place-items-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-600">Loading pattern details...</p>
        </div>
      </div>
    );
  }

  if (!pattern) {
    return (
      <div className="grid place-items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Pattern Not Found</h2>
          <p className="text-gray-600 mb-4">The learning pattern you're looking for could not be found.</p>
          <Button onClick={() => navigate('/journal')}>
            Return to Journal
          </Button>
        </div>
      </div>
    );
  }

  const relatedEntries = entries.filter(entry =>
    pattern.relatedConcepts.some(concept =>
      entry.title.toLowerCase().includes(concept.toLowerCase()) ||
      entry.content.toLowerCase().includes(concept.toLowerCase())
    )
  );

  const isCreator = relatedEntries.some(entry => entry.wallet_address === account);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => navigate('/journal')}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back to Learning Constellation
      </Button>

      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">{pattern.topic}</h1>
          <p className="text-gray-600">{pattern.description}</p>
        </div>

        <div className="flex items-center gap-4">
          {pattern.isShared ? (
            <Share2 className="w-4 h-4 text-green-500" aria-label="Shared with Community" />
          ) : (
            <Lock className="w-4 h-4 text-[#B4A170]" aria-label="Private" />
          )}
          {isCreator && (
            <div className="flex items-center gap-2">
              <Switch
                checked={pattern.isShared}
                onCheckedChange={(checked) => toggleSharing.mutate(checked)}
                disabled={toggleSharing.isPending}
              />
              <span className="text-sm text-gray-600">
                {pattern.isShared ? 'Shared with Community' : 'Private'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Related Concepts</h2>
            <div className="grid grid-cols-2 gap-4">
              {pattern.relatedConcepts.map((concept, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-blue-50 border border-blue-100"
                >
                  <h3 className="font-medium text-blue-900">{concept}</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Connected to {pattern.topic}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Contributing Entries</h2>
            <div className="space-y-4">
              {relatedEntries.map((entry) => (
                <div key={entry.id} className="p-4 rounded-lg border">
                  <h3 className="font-medium mb-2">{entry.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {entry.content}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => navigate(`/journal/${entry.id}`)}
                  >
                    View Entry
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}