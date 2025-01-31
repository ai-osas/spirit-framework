// src/types/journal.ts

export interface MediaPreview {
    id: string;
    type: 'image' | 'audio';
    url: string;
    name: string;
  }
  
  export interface Pattern {
    id: string;
    name: string;
    confidence: number;
    type: 'concept' | 'insight' | 'connection';
  }
  
  export interface JournalState {
    title: string;
    content: string;
    media: MediaPreview[];
    patterns: Pattern[];
    isRecording: boolean;
    showTools: boolean;
  }