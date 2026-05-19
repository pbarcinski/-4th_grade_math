import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { useAuthStore } from '@/store/authStore';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Spinner } from '@/components/ui/Spinner';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { label: 'Sprint', duration: 60, sub: '60 s' },
  { label: 'Średni', duration: 180, sub: '3 min' },
  { label: 'Maraton', duration: 500, sub: '~8 min' },
] as const;

type Duration = typeof CATEGORIES[number]['duration'];

export function LeaderboardPage() {
  const user = useAuthStore(s => s.user);
  const [active, setActive] = useState<Duration>(60);

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', active],
    queryFn: () => sessionsApi.leaderboard(active),
    staleTime: 30_000,
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-yellow-500" />
        <h1 className="font-display text-3xl font-black text-gray-900 dark:text-gray-100">Ranking</h1>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 self-start">
        {CATEGORIES.map(c => (
          <button
            key={c.duration}
            onClick={() => setActive(c.duration)}
            className={cn(
              'flex flex-col items-center px-5 py-2.5 transition-all',
              active === c.duration
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            )}
          >
            <span className="text-sm font-bold">{c.label}</span>
            <span className={cn('text-xs', active === c.duration ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500')}>
              {c.sub}
            </span>
          </button>
        ))}
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
