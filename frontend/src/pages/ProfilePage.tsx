import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/profile/StatCard';
import { SessionHistory } from '@/components/profile/SessionHistory';
import { WeakAreasList } from '@/components/results/WeakAreasList';
import { Spinner } from '@/components/ui/Spinner';
import { AvatarPicker } from '@/components/ui/AvatarPicker';
import { DEFAULT_AVATAR } from '@/lib/avatars';
import { Target, CheckCircle, Trophy, BookOpen, Pencil, X, Check } from 'lucide-react';

export function ProfilePage() {
  const { user: authUser, login } = useAuthStore();
  const queryClient = useQueryClient();
  const [editingAvatar, setEditingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState('');

  const avatarMutation = useMutation({
    mutationFn: (avatar: string) => usersApi.updateAvatar(avatar),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (authUser) login({ ...authUser, avatar: updatedUser.avatar }, useAuthStore.getState().token!);
      setEditingAvatar(false);
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => usersApi.me(),
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => usersApi.sessions(),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersApi.stats(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="text-6xl leading-none select-none">
            {profile?.avatar ?? DEFAULT_AVATAR}
          </div>
          <button
            onClick={() => { setPendingAvatar(profile?.avatar ?? DEFAULT_AVATAR); setEditingAvatar(true); }}
            className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            title="Zmień awatar"
          >
            <Pencil size={12} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div>
          <h1 className="font-display text-3xl font-black text-gray-900 dark:text-gray-100">
            {profile?.username}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{profile?.email}</p>
        </div>
      </div>

      {editingAvatar && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
          <AvatarPicker value={pendingAvatar} onChange={setPendingAvatar} />
          <div className="flex gap-2 mt-4 justify-end">
            <button
              onClick={() => setEditingAvatar(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={14} /> Anuluj
            </button>
            <button
              onClick={() => avatarMutation.mutate(pendingAvatar)}
              disabled={avatarMutation.isPending}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <Check size={14} /> Zapisz
            </button>
          </div>
        </div>
      )}

      {profile?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={BookOpen} value={profile.stats.totalAnswered} label="Odpowiedzi" />
          <StatCard icon={CheckCircle} value={`${profile.stats.accuracy}%`} label="Celność" color="text-green-500" />
          <StatCard icon={Trophy} value={profile.stats.bestChallengeScore} label="Rekord" color="text-yellow-500" />
          <StatCard icon={Target} value={profile.stats.totalCorrect} label="Poprawnych" color="text-blue-600 dark:text-blue-400" />
        </div>
      )}

      {stats?.weakAreas && stats.weakAreas.length > 0 && (
        <div>
          <h2 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">Słabe obszary</h2>
          <WeakAreasList weakAreas={stats.weakAreas} />
        </div>
      )}

      <div>
        <h2 className="font-semibold text-lg mb-3 text-gray-700 dark:text-gray-300">Historia</h2>
        <SessionHistory sessions={sessions?.sessions ?? []} />
      </div>
    </div>
  );
}
