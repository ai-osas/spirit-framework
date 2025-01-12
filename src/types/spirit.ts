export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SpiritChatResponse {
  data: {
    spiritChat: string;
  };
  extensions?: {
    invocations: {
      spiritChat: {
        executionId: string;
      };
    };
  };
}

export interface SpiritChatVariables {
  message: string;
  conversationId: string;
}

export interface Pattern {
  patternId: string;
  observation: string;
  context: string;
  confidence: number;
  timestamp: string;
}

export interface PatternsResponse {
  data: {
    getConversationPatterns: {
      patterns: Pattern[];
    }
  }
}