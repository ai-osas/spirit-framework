import { ethers } from 'ethers';
import { type JournalEntry } from '@shared/schema';

const REWARD_DISTRIBUTION_ADDRESS = '0xe1a50a164cb3fab65d8796c35541052865cb9fac';
const SPIRIT_TOKEN_ADDRESS = '0xdf160577bb256d24746c33c928d281c346e45f25';
const MAX_DISTRIBUTION_PERCENTAGE = 40;

// Updated network configuration for Electroneum Testnet
const ELECTRONEUM_NETWORK = {
  chainId: 5201420,
  name: 'Electroneum Testnet',
  rpcUrls: ['https://rpc.ankr.com/electroneum_testnet'],
  nativeCurrency: {
    name: 'Electroneum',
    symbol: 'ETN',
    decimals: 18
  },
  blockExplorerUrls: ['https://testnet-blockexplorer.electroneum.com/']
};

// ABI for reward distribution contract
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
  BASE_REWARD: ethers.parseUnits('0.5', 18),
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
  console.log('Content length:', contentLength);

  if (contentLength < REWARD_CRITERIA.MIN_CONTENT_LENGTH) {
    console.log('Content too short');
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
    console.log('Starting reward distribution...');
    console.log('Recipient:', recipientAddress);
    console.log('Amount:', amount.toString());

    // Request network switch to Electroneum Testnet
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
      console.error('Failed to add/switch to Electroneum testnet:', switchError);
      throw new Error('Please add and switch to the Electroneum testnet in your wallet');
    }

    // Verify correct network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (parseInt(chainId, 16) !== ELECTRONEUM_NETWORK.chainId) {
      throw new Error('Please switch to Electroneum testnet to receive rewards');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    console.log('Connected address:', await signer.getAddress());

    // Create contract instances
    const rewardContract = new ethers.Contract(
      REWARD_DISTRIBUTION_ADDRESS,
      REWARD_DISTRIBUTION_ABI,
      signer
    );

    const tokenContract = new ethers.Contract(
      SPIRIT_TOKEN_ADDRESS,
      ['function totalSupply() view returns (uint256)', 'function balanceOf(address) view returns (uint256)'],
      provider
    );

    // Check distribution limits
    const [totalSupply, distributedBalance] = await Promise.all([
      tokenContract.totalSupply(),
      tokenContract.balanceOf(REWARD_DISTRIBUTION_ADDRESS)
    ]);

    const maxDistribution = (totalSupply * BigInt(MAX_DISTRIBUTION_PERCENTAGE)) / BigInt(100);
    if (distributedBalance + amount > maxDistribution) {
      throw new Error('Maximum token distribution limit reached');
    }

    // Distribute reward
    console.log('Distributing reward...');
    const tx = await rewardContract.distributeReward(recipientAddress, amount);
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    return true;
  } catch (error: any) {
    console.error('Failed to distribute reward:', error);

    // Enhanced error handling for testnet-specific cases
    if (error.code === 4001) {
      throw new Error('Transaction was rejected by user');
    } else if (error.code === -32000) {
      throw new Error('Insufficient ETN for transaction. Visit https://faucet.electroneum.com/ to get testnet ETN');
    } else if (error.data?.message?.includes('execution reverted')) {
      throw new Error('Smart contract execution failed. Please verify contract status on testnet explorer');
    } else if (error.message.includes('network')) {
      throw new Error('Please ensure you are connected to Electroneum testnet and try again');
    } else {
      throw new Error(error.message || 'Failed to distribute tokens. Please try again later');
    }
  }
}