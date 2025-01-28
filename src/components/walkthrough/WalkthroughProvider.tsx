// src/components/walkthrough/WalkthroughProvider.tsx

"use client";
import React, { createContext, useContext, useState } from 'react';
import { WalkthroughState, WalkthroughStep } from './types';

const WalkthroughContext = createContext<WalkthroughState | undefined>(undefined);

export const WalkthroughProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [steps] = useState<WalkthroughStep[]>([
    {
      target: ".new-entry-button",
      title: "Create New Entries",
      content: "Start your learning journey by creating a new journal entry.",
      position: "right",
    },
    {
        target: ".sidebar-patterns",
        title: "Your Learning Patterns",
        content: "View all your discovered patterns and insights organized by categories. Track your learning progress over time.",
        position: "right"
      },
      {
        target: ".active-learning-card",
        title: "Active Learning Patterns",
        content: "Your most recent learning discoveries appear here. These cards show patterns you've identified and their related concepts.",
        position: "left"
      },
      {
        target: ".filter-button",
        title: "Filter & Organize",
        content: "Use these tools to filter your patterns, view them on a timeline, or organize them by different criteria.",
        position: "bottom"
      },
      {
        target: ".chat-toggle-button",
        title: "AI Pattern Assistant",
        content: "Need help analyzing your patterns? Click here to chat with our AI assistant who can help identify connections and insights.",
        position: "left"
      },
      {
        target: ".pattern-grid",
        title: "Pattern Overview",
        content: "All your learning patterns are displayed here. Each card represents a unique insight or connection you've discovered.",
        position: "top"
      },
      {
        target: ".pattern-explore",
        title: "Deep Dive",
        content: "Click 'Explore Pattern' to dive deeper into any pattern, see related concepts, and track your understanding.",
        position: "bottom"
      }
  ]);

  const start = () => setCurrentStep(0);
  const next = () => {
    if (currentStep === steps.length - 1) {
      setCurrentStep(null);
    } else {
      setCurrentStep(prev => prev !== null ? prev + 1 : null);
    }
  };
  const end = () => setCurrentStep(null);

  return (
    <WalkthroughContext.Provider 
      value={{
        currentStep,
        steps,
        start,
        next,
        end,
        isActive: currentStep !== null
      }}
    >
      {children}
    </WalkthroughContext.Provider>
  );
};

export const useWalkthrough = () => {
  const context = useContext(WalkthroughContext);
  if (context === undefined) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider');
  }
  return context;
};