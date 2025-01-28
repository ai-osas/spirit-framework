// src/components/walkthrough/WalkthroughHighlight.tsx

"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from 'react';

interface HighlightProps {
  targetSelector: string;
}

export const WalkthroughHighlight = ({ targetSelector }: HighlightProps) => {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const targetElement = document.querySelector(targetSelector);
    if (targetElement) {
      const updatePosition = () => {
        const rect = targetElement.getBoundingClientRect();
        setPosition({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16
        });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      return () => window.removeEventListener('resize', updatePosition);
    }
  }, [targetSelector]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed pointer-events-none"
      style={{
        ...position,
        border: '2px solid #3B82F6',
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
        zIndex: 50
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          boxShadow: ['0 0 0 0 rgba(59, 130, 246, 0.5)', '0 0 0 10px rgba(59, 130, 246, 0)']
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity
        }}
      />
    </motion.div>
  );
};