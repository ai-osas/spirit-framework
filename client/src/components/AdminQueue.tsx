import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type JournalEntry } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { calculateEntryReward, distributeReward } from '@/lib/rewardService';

export function AdminQueue() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending entries
  const { data: pendingEntries } = useQuery({
    queryKey: ['/api/journal/entries/pending'],
    queryFn: async () => {
      const response = await fetch('/api/journal/entries/pending');
      if (!response.ok) throw new Error('Failed to fetch pending entries');
      return response.json() as Promise<JournalEntry[]>;
    }
  });

  // Update entry status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ 
      entryId, 
      status, 
      rewardAmount 
    }: { 
      entryId: number, 
      status: 'approved' | 'denied',
      rewardAmount?: bigint 
    }) => {
      const response = await fetch(`/api/journal/entries/${entryId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rewardAmount: rewardAmount?.toString() })
      });
      if (!response.ok) throw new Error('Failed to update entry status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/entries/pending'] });
    }
  });

  const handleApproval = async (entry: JournalEntry) => {
    try {
      setIsProcessing(true);

      // Calculate reward amount
      const rewardAmount = await calculateEntryReward(entry);

      if (rewardAmount <= 0) {
        throw new Error('Invalid reward amount calculated');
      }

      // First try to distribute the reward
      await distributeReward(entry.wallet_address, rewardAmount);

      // If distribution successful, update entry status
      await updateStatusMutation.mutateAsync({
        entryId: entry.id,
        status: 'approved',
        rewardAmount
      });

      toast({
        title: "Reward Distributed",
        description: `Successfully approved and distributed ${ethers.formatUnits(rewardAmount, 18)} SPIRIT tokens`
      });

    } catch (error: any) {
      console.error('Failed to process approval:', error);
      toast({
        variant: "destructive",
        title: "Approval Failed",
        description: error.message || "Failed to process approval. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDenial = async (entry: JournalEntry) => {
    try {
      setIsProcessing(true);
      await updateStatusMutation.mutateAsync({
        entryId: entry.id,
        status: 'denied'
      });

      toast({
        title: "Entry Denied",
        description: "Successfully denied the journal entry reward"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Denial Failed",
        description: error.message || "Failed to deny entry. Please try again."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Reward Approvals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingEntries?.length === 0 && (
            <p className="text-sm text-gray-500">No pending entries to review</p>
          )}
          {pendingEntries?.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4">
              <h3 className="font-medium">{entry.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{entry.content.substring(0, 100)}...</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleApproval(entry)}
                  disabled={isProcessing}
                >
                  {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Approve & Distribute
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDenial(entry)}
                  disabled={isProcessing}
                >
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}