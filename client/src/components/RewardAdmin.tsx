import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "../hooks/use-toast";
import { Loader2 } from 'lucide-react';

const SPIRIT_TOKEN_ADDRESS = '0xdf160577bb256d24746c33c928d281c346e45f25';
const REWARD_DISTRIBUTION_ADDRESS = '0xe1a50a164cb3fab65d8796c35541052865cb9fac';
const ADMIN_WALLET = '0xcb2FCB4802eBc2c17b7f06C12b03918c85faC2d0';

// ABI for token balance and transfer event checks
const TOKEN_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export function RewardAdmin() {
  const { account } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [distributorBalance, setDistributorBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [uniqueRecipients, setUniqueRecipients] = useState<Set<string>>(new Set());

  // Only proceed if the connected wallet is the admin wallet
  const isAdmin = account?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  useEffect(() => {
    const fetchDistributionStats = async () => {
      if (!account || !window.ethereum || !isAdmin) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenContract = new ethers.Contract(SPIRIT_TOKEN_ADDRESS, TOKEN_ABI, provider);

        // Get total supply and distributor balance
        const [supply, balance] = await Promise.all([
          tokenContract.totalSupply(),
          tokenContract.balanceOf(REWARD_DISTRIBUTION_ADDRESS)
        ]);

        setTotalSupply(ethers.formatUnits(supply, 18));
        setDistributorBalance(ethers.formatUnits(balance, 18));

        // Get transfer events from distributor to track unique recipients
        const filter = tokenContract.filters.Transfer(REWARD_DISTRIBUTION_ADDRESS, null);
        const events = await tokenContract.queryFilter(filter);
        const recipients = new Set(events.map(e => e.args?.[1].toLowerCase()));
        setUniqueRecipients(recipients);

      } catch (error) {
        console.error('Failed to fetch distribution stats:', error);
      }
    };

    fetchDistributionStats();
    const interval = setInterval(fetchDistributionStats, 10000);
    return () => clearInterval(interval);
  }, [account, isAdmin]);

  // Only render for admin wallet
  if (!isAdmin) return null;

  const maxDistribution = Number(totalSupply) * 0.4;
  const currentDistributionPercentage = (Number(distributorBalance) / Number(totalSupply)) * 100;
  const remainingForDistribution = maxDistribution - Number(distributorBalance);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Distribution Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Total Supply</p>
            <p className="text-lg font-medium">{Number(totalSupply).toFixed(2)} SPIRIT</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Distribution Cap (40%)</p>
            <p className="text-lg font-medium">{maxDistribution.toFixed(2)} SPIRIT</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Currently Distributed</p>
            <p className="text-lg font-medium">{Number(distributorBalance).toFixed(2)} SPIRIT</p>
            <p className="text-xs text-gray-400">
              {currentDistributionPercentage.toFixed(2)}% of total supply used
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Remaining for Distribution</p>
            <p className="text-lg font-medium">{remainingForDistribution.toFixed(2)} SPIRIT</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Unique Recipients</p>
            <p className="text-lg font-medium">{uniqueRecipients.size}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}