import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2, Brain, Users, Clock, Globe, Lock } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { type JournalEntry } from '@shared/schema';
import { LearningConstellation } from './LearningConstellation';
import { TokenBalance } from './TokenBalance';
import { RewardAdmin } from './RewardAdmin';
import { toast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

export default function SpiritJournal() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSharedOnly, setShowSharedOnly] = useState(false);
  const { account } = useWallet();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/entries', account],
    queryFn: async () => {
      if (!account) return [];
      const response = await fetch(`/api/journal/entries?wallet_address=${account}`);
      if (!response.ok) throw new Error('Failed to fetch entries');
      return response.json();
    },
    enabled: !!account,
    staleTime: 0
  });

  // Filter entries based on showSharedOnly toggle
  const filteredEntries = entries.filter(entry => 
    showSharedOnly ? entry.is_shared : true
  );

  // Handle sharing toggle
  const handleShareToggle = async (entry: JournalEntry) => {
    try {
      const response = await fetch(`/api/journal/entries/${entry.id}/share`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shared: !entry.is_shared })
      });

      if (!response.ok) throw new Error('Failed to update sharing status');

      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries'] });

      toast({
        title: entry.is_shared ? 'Entry privacy restored' : 'Entry shared',
        description: entry.is_shared 
          ? 'This entry is now private' 
          : 'This entry is now visible to other users',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update sharing status',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white">
        <div className="p-4">
          <h1 className="text-xl font-semibold mb-6">Spirit Journal</h1>

          <TokenBalance />
          <RewardAdmin />

          <Button 
            onClick={() => navigate('/journal/new')}
            className="w-full mb-8 mt-4"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            New Entry
          </Button>

          <div className="space-y-1">
            <h2 className="text-sm font-medium mb-2 text-gray-500">YOUR PATTERNS</h2>
            <Button
              variant="ghost"
              className="w-full justify-start bg-blue-50"
            >
              <Clock className="w-4 h-4 mr-2" />
              Recent Insights
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <Brain className="w-4 h-4 mr-2" />
              Learning Paths
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowSharedOnly(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Shared Patterns
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Your Learning Constellation</h1>
                <p className="text-gray-600">Mapping your journey of understanding</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="shared-toggle"
                  checked={showSharedOnly}
                  onCheckedChange={setShowSharedOnly}
                />
                <Label htmlFor="shared-toggle">Show Shared Only</Label>
              </div>
            </div>
          </div>

          {/* Journal Entries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium">{entry.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => handleShareToggle(entry)}
                    >
                      {entry.is_shared ? (
                        <>
                          <Globe className="w-4 h-4" />
                          <span className="text-sm">Public</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span className="text-sm">Private</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {entry.content}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/journal/${entry.id}`)}
                  >
                    View Entry
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-4 mb-8">
            <Button variant="outline">
              Filter
            </Button>
            <Button variant="outline">
              Timeline
            </Button>
          </div>

          <LearningConstellation entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
}