import { apiClient } from './client';
import { User } from '../types';

export const adminApi = {
  getUsers: () =>
    apiClient.get<{ users: User[] }>('/admin/users').then(r => r.data),

  confirmUser: (id: string) =>
    apiClient.patch<User>(`/admin/users/${id}/confirm`).then(r => r.data),

  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`).then(r => r.data),
};
