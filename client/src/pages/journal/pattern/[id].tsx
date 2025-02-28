import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { type JournalEntry } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { analyzeLearningPatterns } from '@/lib/openai';

export default function ExplorePatternPage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();

  const { data: entries = [] } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/entries'],
  });

  const { data: patterns = [], isLoading } = useQuery({
    queryKey: ['learning-patterns', entries.map(e => e.id).join(',')],
    queryFn: async () => {
      const entryData = entries.map(entry => ({
        title: entry.title,
        content: entry.content
      }));
      return analyzeLearningPatterns(entryData);
    },
    enabled: entries.length > 0,
  });

  const pattern = patterns[Number(id) - 1];

  if (!pattern) {
    return (
      <div className="grid place-items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Pattern Not Found</h2>
          <p className="text-gray-600 mb-4">This learning pattern does not exist.</p>
          <Button onClick={() => navigate('/journal')}>
            Return to Journal
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid place-items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

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

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{pattern.topic}</h1>
        <p className="text-gray-600">{pattern.description}</p>
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
              {entries.slice(0, 3).map((entry) => (
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