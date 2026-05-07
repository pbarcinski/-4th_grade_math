import { apiClient } from './client';
import { LeaderboardEntry, Session } from '../types';

export const sessionsApi = {
  start: () =>
    apiClient.post<{ id: string }>('/sessions').then(r => r.data),

  end: (id: string, score: number, totalAsked: number) =>
    apiClient.patch(`/sessions/${id}/end`, { score, totalAsked }).then(r => r.data),

  leaderboard: () =>
    apiClient.get<{ leaderboard: LeaderboardEntry[] }>('/sessions/leaderboard').then(r => r.data),

  personalBest: () =>
    apiClient.get<Session | null>('/sessions/personal-best').then(r => r.data),
};
