import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "../hooks/use-toast";

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
        const recipients = new Set(events.map(e => {
          const event = e as ethers.EventLog;
          return event.args?.[1].toLowerCase() || '';
        }));
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

          <div>
            <p className="text-sm text-gray-500">Unique Recipients</p>
            <p className="text-lg font-medium">{uniqueRecipients.size}</p>
          </div>

          {/* Add button to fund distribution contract */}
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={async () => {
                try {
                  if (!window.ethereum) {
                    toast({
                      variant: "destructive",
                      title: "Web3 Wallet Required",
                      description: "Please install a Web3 wallet like MetaMask to fund the distribution contract."
                    });
                    return;
                  }

                  const provider = new ethers.BrowserProvider(window.ethereum);
                  const signer = await provider.getSigner();
                  const tokenContract = new ethers.Contract(
                    SPIRIT_TOKEN_ADDRESS,
                    [
                      "function transfer(address to, uint256 amount) returns (bool)",
                      "function balanceOf(address account) view returns (uint256)"
                    ],
                    signer
                  );

                  // Fund with 1000 SPIRIT tokens (adjust as needed)
                  const fundAmount = ethers.parseUnits("1000", 18);
                  
                  // Check admin wallet balance first
                  const adminBalance = await tokenContract.balanceOf(account);
                  if (adminBalance < fundAmount) {
                    toast({
                      variant: "destructive",
                      title: "Insufficient Balance",
                      description: "Your wallet doesn't have enough SPIRIT tokens to fund the distribution contract."
                    });
                    return;
                  }

                  // Transfer tokens to distribution contract
                  const tx = await tokenContract.transfer(REWARD_DISTRIBUTION_ADDRESS, fundAmount);
                  
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
                }
              }}
            >
              Fund Distribution Contract
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
