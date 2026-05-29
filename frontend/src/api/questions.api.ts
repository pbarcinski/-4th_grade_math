import { apiClient } from './client';
import { Question, AnswerResult, Mode, Operation, Category } from '../types';

export const questionsApi = {
  next: (mode: Mode, sessionId?: string, category?: Category) =>
    apiClient
      .get<Question>('/questions/next', { params: { mode, sessionId, category } })
      .then(r => r.data),

  answer: (payload: {
    operandA: number;
    operandB: number;
    operation: Operation;
    givenAnswer: number;
    mode: Mode;
    sessionId: string | null;
    category?: Category;
    conversionKey?: string;
  }) => apiClient.post<AnswerResult>('/questions/answer', payload).then(r => r.data),
};
