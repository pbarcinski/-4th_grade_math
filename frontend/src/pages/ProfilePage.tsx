import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { StatCard } from '@/components/profile/StatCard';
import { SessionHistory } from '@/components/profile/SessionHistory';
import { WeakAreasList } from '@/components/results/WeakAreasList';
import { Spinner } from '@/components/ui/Spinner';
import { Target, CheckCircle, Trophy, BookOpen } from 'lucide-react';

export function ProfilePage() {
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
      <div>
        <h1 className="font-display text-3xl font-black text-gray-900 dark:text-gray-100">
          {profile?.username}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{profile?.email}</p>
      </div>

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
