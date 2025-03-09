import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "../hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { AdminQueue } from './AdminQueue';

const SPIRIT_TOKEN_ADDRESS = import.meta.env.VITE_SPIRIT_TOKEN_ADDRESS;
const REWARD_DISTRIBUTION_ADDRESS = import.meta.env.VITE_DISTRIBUTION_CONTRACT_ADDRESS;
const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET_ADDRESS;

// ABI matching our deployed SPIRIT Token contract
const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export function RewardAdmin() {
  const { account } = useWallet();
  const [distributorBalance, setDistributorBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');
  const [uniqueRecipients, setUniqueRecipients] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Only proceed if the connected wallet is the admin wallet
  const isAdmin = account?.toLowerCase() === ADMIN_WALLET?.toLowerCase();

  const fetchDistributionStats = async () => {
    if (!account || !window.ethereum || !isAdmin) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const tokenContract = new ethers.Contract(SPIRIT_TOKEN_ADDRESS!, TOKEN_ABI, provider);

      try {
        // Get total supply and distributor balance
        const [supply, balance] = await Promise.all([
          tokenContract.totalSupply(),
          tokenContract.balanceOf(REWARD_DISTRIBUTION_ADDRESS!)
        ]);

        setTotalSupply(ethers.formatUnits(supply, 18));
        setDistributorBalance(ethers.formatUnits(balance, 18));

        // Get transfer events from distributor to track unique recipients
        const filter = tokenContract.filters.Transfer(REWARD_DISTRIBUTION_ADDRESS!, null);
        const events = await tokenContract.queryFilter(filter);
        const recipients = new Set(events.map(e => {
          const event = e as ethers.EventLog;
          return event.args?.[1].toLowerCase() || '';
        }));
        setUniqueRecipients(recipients);

      } catch (error: any) {
        console.error('Contract verification failed:', error);
        if (error.code === 'BAD_DATA') {
          toast({
            variant: "destructive",
            title: "Contract Not Found",
            description: "The SPIRIT token contract could not be found. Please verify the contract deployment on Electroneum mainnet."
          });
        } else {
          throw error;
        }
      }

    } catch (error) {
      console.error('Failed to fetch distribution stats:', error);
      toast({
        variant: "destructive",
        title: "Failed to Load Stats",
        description: "Could not load distribution statistics. Please verify your network connection and contract deployment."
      });
    }
  };

  useEffect(() => {
    fetchDistributionStats();
    const interval = setInterval(fetchDistributionStats, 10000);
    return () => clearInterval(interval);
  }, [account, isAdmin]);

  // Only render for admin wallet
  if (!isAdmin) return null;

  const maxDistribution = Number(totalSupply) * 0.4;
  const currentDistributionPercentage = (Number(distributorBalance) / Number(totalSupply)) * 100;

  const handleFundDistribution = async () => {
    if (!window.ethereum || !account) {
      toast({
        variant: "destructive",
        title: "Web3 Wallet Required",
        description: "Please install a Web3 wallet like MetaMask to fund the distribution contract."
      });
      return;
    }

    setIsLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        SPIRIT_TOKEN_ADDRESS!,
        TOKEN_ABI,
        signer
      );

      // Fund with 1000 SPIRIT tokens
      const fundAmount = ethers.parseUnits("1000", 18);

      // Check admin wallet balance
      const adminBalance = await tokenContract.balanceOf(account);

      // Use BigNumber comparison
      if (ethers.toBigInt(adminBalance) < ethers.toBigInt(fundAmount)) {
        throw new Error("Your wallet doesn't have enough SPIRIT tokens to fund the distribution contract.");
      }

      // Transfer tokens to distribution contract
      const tx = await tokenContract.transfer(REWARD_DISTRIBUTION_ADDRESS!, fundAmount);

      toast({
        title: "Transaction Submitted",
        description: "Funding transaction submitted. Please wait for confirmation."
      });

      await tx.wait();

      toast({
        title: "Distribution Contract Funded",
        description: "Successfully transferred SPIRIT tokens to the distribution contract."
      });

      // Refresh stats
      await fetchDistributionStats();

    } catch (error: any) {
      console.error("Failed to fund distribution contract:", error);
      toast({
        variant: "destructive",
        title: "Funding Failed",
        description: error.message || "Failed to fund distribution contract. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Distribution Statistics</CardTitle>
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
              <p className="text-sm text-gray-500">Available for Distribution</p>
              <p className="text-lg font-medium">{Number(distributorBalance).toFixed(2)} SPIRIT</p>
              <p className="text-xs text-gray-400">
                {currentDistributionPercentage.toFixed(2)}% of total supply available
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Unique Recipients</p>
              <p className="text-lg font-medium">{uniqueRecipients.size}</p>
            </div>

            <div className="mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                onClick={handleFundDistribution}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Fund Distribution Contract
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdminQueue />
    </div>
  );
}