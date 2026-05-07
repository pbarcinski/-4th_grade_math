import { create } from 'zustand';
import { Question } from '../types';

interface AnswerRecord {
  question: Question;
  isCorrect: boolean;
}

interface GameState {
  sessionId: string | null;
  score: number;
  totalAsked: number;
  timeLeft: number;
  currentQuestion: Question | null;
  answers: AnswerRecord[];
  startSession: (sessionId: string, durationSecs?: number) => void;
  setQuestion: (q: Question) => void;
  recordAnswer: (question: Question, isCorrect: boolean) => void;
  tick: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  sessionId: null,
  score: 0,
  totalAsked: 0,
  timeLeft: 60,
  currentQuestion: null,
  answers: [],

  startSession: (sessionId, durationSecs = 60) =>
    set({ sessionId, timeLeft: durationSecs, score: 0, totalAsked: 0, answers: [] }),

  setQuestion: (q) => set({ currentQuestion: q }),

  recordAnswer: (question, isCorrect) =>
    set((s) => ({
      score: isCorrect ? s.score + 1 : s.score,
      totalAsked: s.totalAsked + 1,
      answers: [...s.answers, { question, isCorrect }],
    })),

  tick: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),

  reset: () =>
    set({ sessionId: null, score: 0, totalAsked: 0, timeLeft: 60, currentQuestion: null, answers: [] }),
}));
