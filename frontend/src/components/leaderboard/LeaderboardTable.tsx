import { LeaderboardEntry } from '@/types';
import { Card } from '@/components/ui/Card';
import { Medal } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Props {
  entries: LeaderboardEntry[];
  currentUsername?: string;
}

const medalColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-500';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-amber-600';
  return 'text-gray-300 dark:text-gray-600';
};

export function LeaderboardTable({ entries, currentUsername }: Props) {
  if (entries.length === 0) {
    return <p className="text-center text-gray-400 py-8">Brak wyników</p>;
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium text-sm">#</th>
            <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium text-sm">Gracz</th>
            <th className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium text-sm">Wynik</th>
            <th className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 font-medium text-sm hidden sm:table-cell">Data</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr
              key={e.rank}
              className={`border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors ${
                e.username === currentUsername
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
              }`}
            >
              <td className="px-4 py-3">
                <Medal size={20} className={medalColor(e.rank)} />
              </td>
              <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                {e.username}
                {e.username === currentUsername && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(Ty)</span>
                )}
              </td>
              <td className="px-4 py-3 text-center font-display font-black text-xl text-blue-600 dark:text-blue-400">
                {e.score}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-400 dark:text-gray-500 hidden sm:table-cell">
                {formatDate(e.achievedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
