import { SourceReference } from './document';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  missionId: string;
  question: string;
  options: QuizOption[];
  explanation: string;
  sourceReference: SourceReference;
}

export interface Flashcard {
  id: string;
  missionId: string;
  front: string; // Key concept / term / threshold
  back: string;  // Plain language definition / action
  sourceReference: SourceReference;
}

export interface Mission {
  id: string;
  editionId: string;
  order: number;
  title: string;
  readingEstimateMinutes: number;
  wordCount: number;
  body: string;
  keyTakeaways: string[];
  done: boolean;
  sourceReference: SourceReference;
  quizQuestions: QuizQuestion[];
  flashcards: Flashcard[];
}

export interface Edition {
  id: string;
  userId?: string;
  title: string;
  description: string;
  sourceFileName: string;
  sourceType: string;
  status: 'draft' | 'in_progress' | 'completed';
  progress: number;
  totalMissions: number;
  totalTimeEstimateMinutes: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  coverEmoji: string;
  themeColor: string;
  missions: Mission[];
  rawSourceText?: string;
}
