import { apiClient } from './client';
import { User, WeakArea, Session, Category } from '../types';

export const usersApi = {
  me: () => apiClient.get<User>('/users/me').then(r => r.data),

  updateAvatar: (avatar: string) =>
    apiClient.patch<User>('/users/me/avatar', { avatar }).then(r => r.data),

  stats: (category?: Category) =>
    apiClient
      .get<{ weakAreas: WeakArea[] }>('/users/me/stats', { params: category ? { category } : {} })
      .then(r => r.data),

  sessions: (page = 1, limit = 10) =>
    apiClient
      .get<{ sessions: Session[]; total: number; page: number; limit: number }>(
        '/users/me/sessions',
        { params: { page, limit } },
      )
      .then(r => r.data),
};
