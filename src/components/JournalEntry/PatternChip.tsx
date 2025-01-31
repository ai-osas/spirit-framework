// src/components/JournalEntry/PatternChip.tsx
import { motion } from 'framer-motion';
import { type Pattern } from '@/types/journal';

export function PatternChip({ pattern }: { pattern: Pattern }) {
  return (
    <motion.div
      layout
      className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm flex items-center gap-2"
    >
      {pattern.type === 'concept' ? '💡' : '🔗'}
      {pattern.name}
      <span className="text-blue-400 text-xs">
        {Math.round(pattern.confidence * 100)}%
      </span>
    </motion.div>
  );
}
