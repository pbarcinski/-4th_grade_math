export type Operation = 'MULTIPLY' | 'DIVIDE' | 'CONVERT';
export type Mode = 'LEARN' | 'CHALLENGE';
export type Category = 'MULTIPLICATION' | 'UNIT_CONVERSION';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role?: UserRole;
  confirmed?: boolean;
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
  // tylko dla CONVERT:
  conversionKey?: string;
  fromUnit?: string;
  toUnit?: string;
  conversionFactor?: number;
  conversionMultiply?: boolean;
}

export interface AnswerResult {
  isCorrect: boolean;
  correctAnswer: number;
  hint: number[] | null;
  conversionHint?: { factor: number; fromUnit: string; toUnit: string; multiply: boolean };
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
  conversionKey?: string;
  conversionLabel?: string;
}
