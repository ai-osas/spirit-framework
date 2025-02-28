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
  BASE_REWARD: ethers.parseUnits('1', 18), // 1 SPIRIT token
  MIN_CONTENT_LENGTH: 100, // Minimum characters for content
  BONUS_THRESHOLDS: {
    CONTENT_LENGTH: 500, // Bonus for entries over 500 chars
    MEDIA_BONUS: 0.5, // Bonus multiplier for including media
    CONSISTENT_POSTING: 0.2, // Bonus for posting within 24h of last entry
  }
};

export async function calculateEntryReward(
  entry: JournalEntry, 
  previousEntry?: JournalEntry
): Promise<bigint> {
  // Basic content quality check
  if (entry.content.length < REWARD_CRITERIA.MIN_CONTENT_LENGTH) {
    return 0n;
  }

  let reward = REWARD_CRITERIA.BASE_REWARD;

  // Content length bonus
  if (entry.content.length >= REWARD_CRITERIA.BONUS_THRESHOLDS.CONTENT_LENGTH) {
    reward += REWARD_CRITERIA.BASE_REWARD / 2n;
  }

  // Media bonus
  if (entry.media && entry.media.length > 0) {
    reward += REWARD_CRITERIA.BASE_REWARD * 
      BigInt(Math.floor(REWARD_CRITERIA.BONUS_THRESHOLDS.MEDIA_BONUS * 100)) / 100n;
  }

  // Consistency bonus
  if (previousEntry) {
    const previousDate = new Date(previousEntry.created_at);
    const currentDate = new Date(entry.created_at);
    const hoursDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 24) {
      reward += REWARD_CRITERIA.BASE_REWARD * 
        BigInt(Math.floor(REWARD_CRITERIA.BONUS_THRESHOLDS.CONSISTENT_POSTING * 100)) / 100n;
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