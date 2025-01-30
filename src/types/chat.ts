export interface Message {
    content: string;
    sender: 'user' | 'assistant';
  }
  
  export interface FollowUpQuestion {
    question: string;
    isSelected: boolean;
  }
  
  export interface ChatResponse {
    message: string;
    followUpQuestions: string[];
  }