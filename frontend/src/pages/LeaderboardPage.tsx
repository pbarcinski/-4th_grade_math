import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { useAuthStore } from '@/store/authStore';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { Spinner } from '@/components/ui/Spinner';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const DURATIONS = [
  { label: 'Sprint', duration: 60, sub: '60 s' },
  { label: 'Średni', duration: 180, sub: '3 min' },
  { label: 'Maraton', duration: 500, sub: '~8 min' },
] as const;

const CAT_TABS: { key: Category; label: string }[] = [
  { key: 'MULTIPLICATION', label: 'Tabliczka' },
  { key: 'UNIT_CONVERSION', label: 'Zamiana miar' },
];

type Duration = typeof DURATIONS[number]['duration'];

export function LeaderboardPage() {
  const user = useAuthStore(s => s.user);
  const [activeDuration, setActiveDuration] = useState<Duration>(60);
  const [activeCategory, setActiveCategory] = useState<Category>('MULTIPLICATION');

  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', activeDuration, activeCategory],
    queryFn: () => sessionsApi.leaderboard(activeDuration, activeCategory),
    staleTime: 30_000,
  });

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy size={28} className="text-yellow-500" />
        <h1 className="font-display text-3xl font-black text-gray-900 dark:text-gray-100">Ranking</h1>
      </div>

      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 self-start">
        {CAT_TABS.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className={cn(
              'px-5 py-2.5 text-sm font-bold transition-all',
              activeCategory === c.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 self-start">
        {DURATIONS.map(c => (
          <button
            key={c.duration}
            onClick={() => setActiveDuration(c.duration)}
            className={cn(
              'flex flex-col items-center px-5 py-2.5 transition-all',
              activeDuration === c.duration
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
            )}
          >
            <span className="text-sm font-bold">{c.label}</span>
            <span className={cn('text-xs', activeDuration === c.duration ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500')}>
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
