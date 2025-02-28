import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "../hooks/use-toast";
import { Loader2 } from 'lucide-react';

const SPIRIT_TOKEN_ADDRESS = '0xdf160577bb256d24746c33c928d281c346e45f25';
const REWARD_DISTRIBUTION_ADDRESS = '0xe1a50a164cb3fab65d8796c35541052865cb9fac';

// ABI for token approval and balance checks
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)"
];

export function RewardAdmin() {
  const { account } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [allowance, setAllowance] = useState<string>('0');
  const [distributorBalance, setDistributorBalance] = useState<string>('0');
  const [totalSupply, setTotalSupply] = useState<string>('0');

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!account || !window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const tokenContract = new ethers.Contract(SPIRIT_TOKEN_ADDRESS, TOKEN_ABI, provider);

        // Get current allowance
        const currentAllowance = await tokenContract.allowance(account, REWARD_DISTRIBUTION_ADDRESS);
        setAllowance(ethers.formatUnits(currentAllowance, 18));

        // Get distributor balance
        const balance = await tokenContract.balanceOf(REWARD_DISTRIBUTION_ADDRESS);
        setDistributorBalance(ethers.formatUnits(balance, 18));

        // Get total supply
        const supply = await tokenContract.totalSupply();
        setTotalSupply(ethers.formatUnits(supply, 18));
      } catch (error) {
        console.error('Failed to fetch contract info:', error);
      }
    };

    fetchContractInfo();
    const interval = setInterval(fetchContractInfo, 10000);
    return () => clearInterval(interval);
  }, [account]);

  const approveTokens = async () => {
    if (!account || !window.ethereum) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please connect your wallet first.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(SPIRIT_TOKEN_ADDRESS, TOKEN_ABI, signer);

      // Approve for 40% of total supply
      const totalSupply = await tokenContract.totalSupply();
      const approvalAmount = (totalSupply * BigInt(40)) / BigInt(100);

      const tx = await tokenContract.approve(REWARD_DISTRIBUTION_ADDRESS, approvalAmount);
      await tx.wait();

      toast({
        title: "Success",
        description: "Successfully approved tokens for distribution.",
      });

      // Refresh allowance
      const newAllowance = await tokenContract.allowance(account, REWARD_DISTRIBUTION_ADDRESS);
      setAllowance(ethers.formatUnits(newAllowance, 18));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to approve tokens.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) return null;

  const maxDistribution = Number(totalSupply) * 0.4;
  const currentDistributionPercentage = (Number(distributorBalance) / Number(totalSupply)) * 100;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Reward Distribution Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Current Allowance</p>
            <p className="text-lg font-medium">{Number(allowance).toFixed(2)} SPIRIT</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Distributor Balance</p>
            <p className="text-lg font-medium">{Number(distributorBalance).toFixed(2)} SPIRIT</p>
            <p className="text-xs text-gray-400">
              {currentDistributionPercentage.toFixed(2)}% of total supply
              (Max: 40%)
            </p>
          </div>

          <Button
            onClick={approveTokens}
            disabled={isLoading || Number(allowance) > maxDistribution}
            className="w-full"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {Number(allowance) > maxDistribution ? 'Already Approved' : 'Approve Tokens for Distribution'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}