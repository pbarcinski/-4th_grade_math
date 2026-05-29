import { apiClient } from './client';
import { LeaderboardEntry, Session, Category } from '../types';

export const sessionsApi = {
  start: (durationSecs: number, category: Category = 'MULTIPLICATION') =>
    apiClient.post<{ id: string }>('/sessions', { durationSecs, category }).then(r => r.data),

  end: (id: string, score: number, totalAsked: number) =>
    apiClient.patch(`/sessions/${id}/end`, { score, totalAsked }).then(r => r.data),

  leaderboard: (durationSecs: number, category: Category = 'MULTIPLICATION') =>
    apiClient
      .get<{ leaderboard: LeaderboardEntry[] }>('/sessions/leaderboard', { params: { duration: durationSecs, category } })
      .then(r => r.data),

  personalBest: (category?: Category) =>
    apiClient
      .get<Session | null>('/sessions/personal-best', { params: category ? { category } : {} })
      .then(r => r.data),
};
