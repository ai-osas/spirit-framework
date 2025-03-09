import { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

// ABI matching the SPIRIT_TestToken contract
const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)"
];

const SPIRIT_TOKEN_ADDRESS = import.meta.env.VITE_SPIRIT_TOKEN_ADDRESS;

export function TokenBalance() {
  const { account } = useWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>("SPRT");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account || !window.ethereum) return;

      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(SPIRIT_TOKEN_ADDRESS!, TOKEN_ABI, provider);

        // Get balance and token details
        const [tokenBalance, tokenSymbol] = await Promise.all([
          contract.balanceOf(account),
          contract.symbol()
        ]);

        // Format balance with 18 decimals
        const formattedBalance = ethers.formatUnits(tokenBalance, 18);
        setBalance(formattedBalance);
        setSymbol(tokenSymbol);
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Set up balance refresh interval
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [account]);

  if (!account) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Token Balance</h3>
          <div className="mt-1">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">
                {balance === null ? '0.00' : Number(balance).toFixed(2)} {symbol}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Earn {symbol} tokens by consistently journaling and adding rich content!
          </p>
        </div>
      </div>
    </Card>
  );
}