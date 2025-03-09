import { ethers } from 'ethers';
import { type JournalEntry } from '@shared/schema';

const SPIRIT_TOKEN_ADDRESS = import.meta.env.VITE_SPIRIT_TOKEN_ADDRESS;
const REWARD_DISTRIBUTION_ADDRESS = import.meta.env.VITE_DISTRIBUTION_CONTRACT_ADDRESS;

// Updated network configuration for Electroneum Mainnet
const ELECTRONEUM_NETWORK = {
  chainId: 52014,
  name: 'Electroneum Mainnet',
  rpcUrls: ['https://rpc.ankr.com/electroneum'],
  nativeCurrency: {
    name: 'Electroneum',
    symbol: 'ETN',
    decimals: 18
  },
  blockExplorerUrls: ['https://blockexplorer.electroneum.com/']
};

// ABI for SPRT Token contract (updated name)
const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// ABI for RewardDistribution contract
const REWARD_DISTRIBUTION_ABI = [
  {
    "inputs": [
      {"name": "_recipient", "type": "address"},
      {"name": "_amount", "type": "uint256"}
    ],
    "name": "distributeReward",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Reward criteria configuration
const REWARD_CRITERIA = {
  BASE_REWARD: ethers.parseUnits('1.0', 18), // Increased base reward to 1 SPRT
  MIN_CONTENT_LENGTH: 200,
  QUALITY_THRESHOLDS: {
    CONTENT_LENGTH: {
      MEDIUM: { chars: 500, reward: ethers.parseUnits('0.3', 18) },
      LONG: { chars: 1000, reward: ethers.parseUnits('0.5', 18) }
    },
    MEDIA_BONUS: {
      IMAGE: ethers.parseUnits('0.2', 18),
      AUDIO: ethers.parseUnits('0.3', 18),
      MAX_MEDIA: 3
    },
    CONSISTENCY: {
      DAILY: { hours: 24, reward: ethers.parseUnits('0.3', 18) },
      STREAK: { days: 7, reward: ethers.parseUnits('0.5', 18) }
    }
  }
};

export async function calculateEntryReward(
  entry: JournalEntry,
  previousEntry?: JournalEntry
): Promise<bigint> {
  const contentLength = entry.content.trim().length;

  if (contentLength < REWARD_CRITERIA.MIN_CONTENT_LENGTH) {
    return BigInt(0);
  }

  let reward = REWARD_CRITERIA.BASE_REWARD;

  // Content length bonuses
  if (contentLength >= REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.LONG.chars) {
    reward += REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.LONG.reward;
  } else if (contentLength >= REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.MEDIUM.chars) {
    reward += REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.MEDIUM.reward;
  }

  // Media bonuses (capped)
  if (entry.media) {
    const mediaCount = Math.min(entry.media.length, REWARD_CRITERIA.QUALITY_THRESHOLDS.MEDIA_BONUS.MAX_MEDIA);
    for (let i = 0; i < mediaCount; i++) {
      const mediaItem = entry.media[i];
      reward += mediaItem.file_type === 'image'
        ? REWARD_CRITERIA.QUALITY_THRESHOLDS.MEDIA_BONUS.IMAGE
        : REWARD_CRITERIA.QUALITY_THRESHOLDS.MEDIA_BONUS.AUDIO;
    }
  }

  // Consistency bonus
  if (previousEntry) {
    const previousDate = new Date(previousEntry.created_at);
    const currentDate = new Date(entry.created_at);
    const hoursDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= REWARD_CRITERIA.QUALITY_THRESHOLDS.CONSISTENCY.DAILY.hours) {
      reward += REWARD_CRITERIA.QUALITY_THRESHOLDS.CONSISTENCY.DAILY.reward;
    }
  }

  return reward;
}

export async function distributeReward(recipientAddress: string, amount: bigint) {
  if (!window.ethereum) {
    throw new Error('Please install a Web3 wallet to receive rewards');
  }

  try {
    // Request network switch to Electroneum Mainnet
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${ELECTRONEUM_NETWORK.chainId.toString(16)}`,
          chainName: ELECTRONEUM_NETWORK.name,
          nativeCurrency: ELECTRONEUM_NETWORK.nativeCurrency,
          rpcUrls: ELECTRONEUM_NETWORK.rpcUrls,
          blockExplorerUrls: ELECTRONEUM_NETWORK.blockExplorerUrls
        }]
      });
    } catch (switchError: any) {
      console.error('Failed to add/switch to Electroneum mainnet:', switchError);
      throw new Error('Please add and switch to the Electroneum mainnet in your wallet');
    }

    // Verify correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== ELECTRONEUM_NETWORK.chainId) {
      throw new Error('Please switch to Electroneum mainnet to receive rewards');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Create token contract instance
    const tokenContract = new ethers.Contract(
      SPIRIT_TOKEN_ADDRESS!,
      TOKEN_ABI,
      signer
    );

    // Check if the distribution contract already has sufficient allowance
    const currentAllowance = await tokenContract.allowance(await signer.getAddress(), REWARD_DISTRIBUTION_ADDRESS!);

    if (currentAllowance < amount) {
      // Approve distribution contract to spend tokens
      const approveTx = await tokenContract.approve(REWARD_DISTRIBUTION_ADDRESS!, amount);
      await approveTx.wait();
    }

    // Create distribution contract instance
    const distributionContract = new ethers.Contract(
      REWARD_DISTRIBUTION_ADDRESS!,
      REWARD_DISTRIBUTION_ABI,
      signer
    );

    // Distribute the reward
    const tx = await distributionContract.distributeReward(recipientAddress, amount);
    await tx.wait();

    return true;

  } catch (error: any) {
    console.error('Failed to distribute reward:', error);

    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user');
    } else if (error.code === -32000) {
      throw new Error('Insufficient ETN for transaction');
    } else if (error.message.includes('insufficient balance')) {
      throw new Error('The distribution contract has insufficient SPRT tokens');
    } else if (error.data?.message?.includes('execution reverted')) {
      throw new Error('Transaction failed. Please verify you are connected to Electroneum mainnet');
    } else {
      throw new Error(error.message || 'Failed to distribute tokens. Please try again later');
    }
  }
}