import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { type JournalEntry } from '@shared/schema';

export default function SpiritJournal() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { account, connect, isConnecting } = useWallet();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/entries'],
    enabled: !!account,
    staleTime: 0
  });

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-4">
              Connect Your Wallet
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Connect your wallet to start journaling
            </p>
            <Button 
              onClick={connect} 
              className="w-full"
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Your Journal</h1>
        <Button onClick={() => navigate('/journal/new')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          New Entry
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4">
        {filteredEntries.map((entry) => (
          <Card 
            key={entry.id}
            className="hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={() => navigate(`/journal/${entry.id}`)}
          >
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">{entry.title}</h2>
              <p className="text-gray-600 line-clamp-2">{entry.content}</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                {entry.media?.length ? (
                  <span>{entry.media.length} media files</span>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No entries found
          </div>
        )}
      </div>
    </div>
  );
}