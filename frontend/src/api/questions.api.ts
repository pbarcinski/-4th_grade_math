import { apiClient } from './client';
import { Question, AnswerResult, Mode, Operation } from '../types';

export const questionsApi = {
  next: (mode: Mode, sessionId?: string) =>
    apiClient
      .get<Question>('/questions/next', { params: { mode, sessionId } })
      .then(r => r.data),

  answer: (payload: {
    operandA: number;
    operandB: number;
    operation: Operation;
    givenAnswer: number;
    mode: Mode;
    sessionId: string | null;
  }) => apiClient.post<AnswerResult>('/questions/answer', payload).then(r => r.data),
};
