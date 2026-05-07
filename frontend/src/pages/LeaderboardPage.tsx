import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { useAuthStore } from '@/store/authStore';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Spinner } from '@/components/ui/Spinner';
import { Trophy } from 'lucide-react';

export function LeaderboardPage() {
  const user = useAuthStore(s => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => sessionsApi.leaderboard(),
    staleTime: 30_000,
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-yellow-500" />
        <h1 className="font-display text-3xl font-black text-gray-900 dark:text-gray-100">Ranking</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <LeaderboardTable
          entries={data?.leaderboard ?? []}
          currentUsername={user?.username}
        />
      )}
    </div>
  );
}
