import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Loader2, Brain, Users, Clock } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { type JournalEntry } from '@shared/schema';
import { LearningConstellation } from './LearningConstellation';
import { TokenBalance } from './TokenBalance';
import { RewardAdmin } from './RewardAdmin';

export default function SpiritJournal() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const { account, connect, isConnecting } = useWallet();

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal/entries'],
    enabled: !!account,
    staleTime: 0
  });

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
    <div className="flex h-screen bg-gray-50">
      {/* Updated Header */}
      <header className="fixed top-0 left-0 right-0 border-b bg-white z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <span className="flex items-center gap-2 cursor-pointer">
                <img src="/spirit-logo.svg" alt="Spirit" className="h-8 w-auto" />
                <span className="text-lg font-semibold">Spirit Framework</span>
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/blog">
              <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Blog</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex mt-16">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white">
          <div className="p-4">
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
              >
                <Users className="w-4 h-4 mr-2" />
                Shared Patterns
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Your Learning Constellation</h1>
              <p className="text-gray-600">Mapping your journey of understanding</p>
            </div>

            <div className="flex gap-4 mb-8">
              <Button variant="outline">
                Filter
              </Button>
              <Button variant="outline">
                Timeline
              </Button>
            </div>

            <LearningConstellation entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}