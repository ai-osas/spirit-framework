// src/components/walkthrough/WalkthroughToolTip.tsx

"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { WalkthroughStep } from './types';

interface TooltipProps {
  step: WalkthroughStep;
  position: Record<string, string | number>;
  onNext: () => void;
  onDone: () => void;
  isLastStep: boolean;
}

export const WalkthroughTooltip = ({ 
  step, 
  position, 
  onNext, 
  onDone,
  isLastStep 
}: TooltipProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bg-white rounded-lg shadow-xl p-6 max-w-sm z-50"
      style={position}
    >
      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
      <p className="text-gray-600 mb-4">{step.content}</p>
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onDone}
          className="text-gray-600"
        >
          Skip
        </Button>
        <Button onClick={onNext}>
          {isLastStep ? 'Finish' : 'Next'}
        </Button>
      </div>
    </motion.div>
  );
};