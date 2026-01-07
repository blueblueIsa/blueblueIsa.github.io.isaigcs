export interface Term {
  term: string;
  topic: string;
  definition: string;
  example?: string;
  misconception?: string;
  contrast?: string;
}

export interface Unit {
  id: string;
  number: number;
  title: string;
  group: string;
  description: string;
  terms: Term[];
}

export interface Question {
  question: string;
  answer: string;
  paper: string;
  topic: string;
  tags?: string[];
  marks?: number;
  keywords?: string[];
}

export type QAData = Record<string, Record<string, Question[]>>;

export type ViewMode = 'list' | 'flashcards' | 'confusions' | 'qa';

export interface AppState {
  activeUnitId: string | null;
  scope: 'current' | 'all';
  search: string;
  topic: string;
  letter: string;
  confusionsOnly: boolean;
  viewMode: ViewMode;
}
