import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

// ABI for the basic ERC20 balanceOf function
const TOKEN_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  }
];

const SPIRIT_TOKEN_ADDRESS = '0xdf160577bb256d24746c33c928d281c346e45f25';

export function TokenBalance() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !window.ethereum) return;

      setIsLoading(true);
      try {
        // Create contract instance
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(SPIRIT_TOKEN_ADDRESS, TOKEN_ABI, provider);

        // Get balance
        const balance = await contract.balanceOf(account);
        // Convert from wei to ether (18 decimals)
        const formattedBalance = ethers.formatUnits(balance, 18);
        setBalance(formattedBalance);
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [account]);

  if (!account) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">SPIRIT Balance</h3>
          <div className="mt-1">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">
                {balance === null ? '0.00' : Number(balance).toFixed(2)} SPIRIT
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}