import { apiClient } from './client';
import { User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  register: (username: string, email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/register', { username, email, password }).then(r => r.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),

  logout: () =>
    apiClient.post('/auth/logout').then(r => r.data),
};
