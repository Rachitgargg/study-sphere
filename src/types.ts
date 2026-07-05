export interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: 'pdf' | 'docx' | 'txt' | 'pptx';
  status: 'processed' | 'processing';
  summary?: string;
  pageCount?: number;
  concepts?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: string;
  retrieved_context?: any[];
  sources?: string[];
  error?: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index in options
  explanation: string;
  userAnswer?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastReviewed?: string;
}

export interface ConceptNode {
  id: string;
  label: string;
  type: 'document' | 'concept' | 'subconcept';
  group?: string;
  val?: number;
}

export interface ConceptLink {
  source: string;
  target: string;
  type?: string;
}

export interface VivaQuestion {
  id: string;
  question: string;
  expectedKeywords: string[];
  userAnswerAudio?: string;
  feedback?: {
    score: number; // 0-100
    strengths: string[];
    gaps: string[];
    suggestedAnswer: string;
  };
}
