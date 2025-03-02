import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type JournalEntry } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { calculateEntryReward, distributeReward } from '@/lib/rewardService';

interface EntryMetrics {
  id: number;
  contentLength: number;
  mediaCount: number;
  daysSinceLastEntry: number;
  entryStreak: number;
  calculatedReward: string;
  wallet_address: string;
  created_at: string;
}

export function AdminQueue() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending reward requests with metrics only
  const { data: pendingRewards } = useQuery<EntryMetrics[]>({
    queryKey: ['/api/journal/rewards/pending'],
    queryFn: async () => {
      const response = await fetch('/api/journal/rewards/pending');
      if (!response.ok) throw new Error('Failed to fetch pending rewards');
      return response.json();
    }
  });

  // Update reward status mutation
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
      if (!response.ok) throw new Error('Failed to update reward status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/journal/rewards/pending'] });
    }
  });

  const handleApproval = async (entry: EntryMetrics) => {
    try {
      setIsProcessing(true);
      const rewardAmount = BigInt(entry.calculatedReward);

      if (rewardAmount <= 0) {
        throw new Error('Invalid reward amount calculated');
      }

      // Distribute the reward
      await distributeReward(entry.wallet_address, rewardAmount);

      // Update entry status
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

  const handleDenial = async (entry: EntryMetrics) => {
    try {
      setIsProcessing(true);
      await updateStatusMutation.mutateAsync({
        entryId: entry.id,
        status: 'denied'
      });

      toast({
        title: "Reward Denied",
        description: "Successfully denied the reward request"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Denial Failed",
        description: error.message || "Failed to deny reward. Please try again."
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
          {!pendingRewards?.length && (
            <p className="text-sm text-gray-500">No pending rewards to review</p>
          )}
          {pendingRewards?.map((entry) => (
            <div key={entry.id} className="border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Entry Metrics</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm">Content Length: {entry.contentLength} characters</li>
                    <li className="text-sm">Media Attachments: {entry.mediaCount}</li>
                    <li className="text-sm">Days Since Last: {entry.daysSinceLastEntry}</li>
                    <li className="text-sm">Current Streak: {entry.entryStreak} days</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Reward Details</h4>
                  <ul className="mt-2 space-y-1">
                    <li className="text-sm">Calculated Amount: {ethers.formatUnits(entry.calculatedReward, 18)} SPIRIT</li>
                    <li className="text-sm">Date: {new Date(entry.created_at).toLocaleDateString()}</li>
                    <li className="text-sm break-all">Wallet: {entry.wallet_address}</li>
                  </ul>
                </div>
              </div>

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