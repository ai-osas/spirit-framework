import React from 'react';
import { type JournalEntry } from '@shared/schema';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface Props {
  entries: JournalEntry[];
}

export function LearningConstellation({ entries }: Props) {
  // Extract patterns from entries
  const patterns = React.useMemo(() => {
    return entries.slice(-4).map((entry, index) => ({
      id: index + 1,
      title: entry.title,
      description: entry.content.slice(0, 100) + '...',
      relatedConcepts: Math.floor(Math.random() * 3) + 2,
      timeAgo: index === 0 ? '5 min ago' : '2d ago'
    }));
  }, [entries]);

  return (
    <div className="grid grid-cols-2 gap-6">
      {patterns.map((pattern) => (
        <Card key={pattern.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {pattern.timeAgo}
              </span>
            </div>
            <span className="text-sm">Learning Pattern {pattern.id}</span>
          </div>

          <p className="text-gray-600 mb-4">
            {pattern.description}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {Array.from({ length: pattern.relatedConcepts }).map((_, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-gray-200"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {pattern.relatedConcepts} related concepts
            </span>
          </div>

          <Button variant="ghost" className="w-full justify-between">
            Explore Pattern
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Card>
      ))}
    </div>
  );
}