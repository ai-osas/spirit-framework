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
  },
  // Prevent spam/low quality content
  PENALTIES: {
    REPETITIVE_CONTENT: 0.5, // 50% reduction for similar content to previous entries
    MAX_DAILY_ENTRIES: 3,    // Maximum rewarded entries per day
    MIN_WORDS_PER_CHAR: 0.2  // Minimum ratio of words to characters (prevents character spam)
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

function checkWordCharRatio(content: string): boolean {
  const words = content.trim().split(/\s+/).length;
  const chars = content.replace(/\s+/g, '').length;
  return (words / chars) >= REWARD_CRITERIA.PENALTIES.MIN_WORDS_PER_CHAR;
}

export async function calculateEntryReward(
  entry: JournalEntry, 
  previousEntry?: JournalEntry
): Promise<bigint> {
  // Basic content quality checks
  if (entry.content.length < REWARD_CRITERIA.MIN_CONTENT_LENGTH || !checkWordCharRatio(entry.content)) {
    return 0n;
  }

  let reward = REWARD_CRITERIA.BASE_REWARD;

  // Check for repetitive content
  if (previousEntry && isRepetitiveContent(entry.content, previousEntry.content)) {
    reward = reward * BigInt(Math.floor(REWARD_CRITERIA.PENALTIES.REPETITIVE_CONTENT * 100)) / 100n;
  }

  // Content length bonuses
  if (entry.content.length >= REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.LONG.chars) {
    reward += REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.LONG.reward;
  } else if (entry.content.length >= REWARD_CRITERIA.QUALITY_THRESHOLDS.CONTENT_LENGTH.MEDIUM.chars) {
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
    return false;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // First check if the distribution contract has allowance
    const tokenContract = new ethers.Contract(
      SPIRIT_TOKEN_ADDRESS,
      ['function allowance(address owner, address spender) view returns (uint256)'],
      provider
    );

    const allowance = await tokenContract.allowance(SPIRIT_TOKEN_ADDRESS, REWARD_DISTRIBUTION_ADDRESS);
    if (allowance === 0n) {
      console.error('RewardDistribution contract not approved for token distribution');
      return false;
    }

    // Create reward contract instance
    const rewardContract = new ethers.Contract(
      REWARD_DISTRIBUTION_ADDRESS,
      REWARD_DISTRIBUTION_ABI,
      signer
    );

    // Get total supply to check distribution limit
    const totalSupply = await tokenContract.totalSupply();
    const maxDistribution = (totalSupply * BigInt(MAX_DISTRIBUTION_PERCENTAGE)) / 100n;

    // Get current distributed amount
    const distributedBalance = await tokenContract.balanceOf(REWARD_DISTRIBUTION_ADDRESS);

    if (distributedBalance + amount > maxDistribution) {
      console.error('Reward distribution would exceed maximum allowed percentage');
      return false;
    }

    // Distribute reward
    const tx = await rewardContract.distributeReward(recipientAddress, amount);
    await tx.wait();
    console.log('Reward distributed successfully!');
    return true;
  } catch (error: any) {
    console.error('Failed to distribute reward:', error);
    return false;
  }
}