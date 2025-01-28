// src/components/walkthrough/types.ts
export interface WalkthroughStep {
    target: string;
    title: string;
    content: string;
    position: "top" | "bottom" | "left" | "right";
  }
  
  export interface WalkthroughState {
    currentStep: number | null;
    steps: WalkthroughStep[];
    start: () => void;
    next: () => void;
    end: () => void;
    isActive: boolean;
  }