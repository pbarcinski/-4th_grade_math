import { apiClient } from './client';
import { LeaderboardEntry, Session } from '../types';

export const sessionsApi = {
  start: (durationSecs: number) =>
    apiClient.post<{ id: string }>('/sessions', { durationSecs }).then(r => r.data),

  end: (id: string, score: number, totalAsked: number) =>
    apiClient.patch(`/sessions/${id}/end`, { score, totalAsked }).then(r => r.data),

  leaderboard: (durationSecs: number) =>
    apiClient.get<{ leaderboard: LeaderboardEntry[] }>(`/sessions/leaderboard?duration=${durationSecs}`).then(r => r.data),

  personalBest: () =>
    apiClient.get<Session | null>('/sessions/personal-best').then(r => r.data),
};
