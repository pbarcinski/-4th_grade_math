export type Operation = 'MULTIPLY' | 'DIVIDE';
export type Mode = 'LEARN' | 'CHALLENGE';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  stats?: {
    totalAnswered: number;
    totalCorrect: number;
    accuracy: number;
    bestChallengeScore: number;
  };
}

export interface Question {
  operandA: number;
  operandB: number;
  operation: Operation;
  display: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: number;
  hint: number[] | null;
}

export interface Session {
  id: string;
  startedAt: string;
  score: number;
  totalAsked: number;
  durationSecs: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  achievedAt: string;
}

export interface WeakArea {
  operandA: number;
  operandB: number;
  operation: Operation;
  wrongCount: number;
}
