import { ethers } from 'ethers';
import { type JournalEntry } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const REWARD_DISTRIBUTION_ADDRESS = '0xe1a50a164cb3fab65d8796c35541052865cb9fac';
const SPIRIT_TOKEN_ADDRESS = '0xdf160577bb256d24746c33c928d281c346e45f25';
const MAX_DISTRIBUTION_PERCENTAGE = 40;

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

// Scoring criteria for journal entries
const REWARD_CRITERIA = {
  BASE_REWARD: ethers.parseUnits('0.5', 18), // 0.5 SPIRIT tokens base reward
  MIN_CONTENT_LENGTH: 200, // Minimum characters for any reward
  QUALITY_THRESHOLDS: {
    CONTENT_LENGTH: {
      MEDIUM: { chars: 500, reward: ethers.parseUnits('0.3', 18) }, // +0.3 SPIRIT
      LONG: { chars: 1000, reward: ethers.parseUnits('0.5', 18) }   // +0.5 SPIRIT
    },
    MEDIA_BONUS: {
      IMAGE: ethers.parseUnits('0.2', 18), // +0.2 SPIRIT per image
      AUDIO: ethers.parseUnits('0.3', 18), // +0.3 SPIRIT per audio
      MAX_MEDIA: 3 // Maximum number of media items that count for rewards
    },
    CONSISTENCY: {
      DAILY: { hours: 24, reward: ethers.parseUnits('0.3', 18) },    // +0.3 SPIRIT
      STREAK: { days: 7, reward: ethers.parseUnits('0.5', 18) }      // +0.5 SPIRIT for 7-day streak
    }
  }
};

function isRepetitiveContent(content: string, previousContent?: string): boolean {
  if (!previousContent) return false;

  // Simple repetition check - can be enhanced with more sophisticated algorithms
  const contentWords = new Set(content.toLowerCase().split(/\s+/));
  const previousWords = new Set(previousContent.toLowerCase().split(/\s+/));

  const commonWords = new Set([...contentWords].filter(x => previousWords.has(x)));
  return commonWords.size / contentWords.size > 0.8; // If 80% words are same, consider repetitive
}

export async function calculateEntryReward(
  entry: JournalEntry, 
  previousEntry?: JournalEntry
): Promise<bigint> {
  // Basic content length check
  const contentLength = entry.content.trim().length;
  console.log('Content length:', contentLength); // Debug log

  if (contentLength < REWARD_CRITERIA.MIN_CONTENT_LENGTH) {
    console.log('Content too short'); // Debug log
    return 0n;
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
    console.error('No ethereum provider found');
    throw new Error('Please connect your wallet to receive rewards');
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Create reward contract instance
    const rewardContract = new ethers.Contract(
      REWARD_DISTRIBUTION_ADDRESS,
      REWARD_DISTRIBUTION_ABI,
      signer
    );

    // Get total supply to check distribution limit
    const tokenContract = new ethers.Contract(
      SPIRIT_TOKEN_ADDRESS,
      ['function totalSupply() view returns (uint256)', 'function balanceOf(address) view returns (uint256)'],
      provider
    );

    const totalSupply = await tokenContract.totalSupply();
    const maxDistribution = (totalSupply * BigInt(MAX_DISTRIBUTION_PERCENTAGE)) / 100n;

    // Get current distributed amount
    const distributedBalance = await tokenContract.balanceOf(REWARD_DISTRIBUTION_ADDRESS);

    if (distributedBalance + amount > maxDistribution) {
      throw new Error('Maximum token distribution limit reached');
    }

    // Distribute reward
    const tx = await rewardContract.distributeReward(recipientAddress, amount);
    await tx.wait();
    console.log('Reward distributed successfully!');
    return true;
  } catch (error: any) {
    console.error('Failed to distribute reward:', error);
    // Check for specific errors and provide better user feedback
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction was rejected. Please try again.');
    } else if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Contract has insufficient tokens for distribution.');
    } else {
      throw new Error('Failed to distribute tokens. Please try again later.');
    }
  }
}