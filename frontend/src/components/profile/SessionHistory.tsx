import { Session } from '@/types';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

interface Props {
  sessions: Session[];
}

export function SessionHistory({ sessions }: Props) {
  if (sessions.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-gray-500 py-8">
        Brak rozegranych challengy
      </p>
    );
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Data</th>
            <th className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium">Wynik</th>
            <th className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium">Pytań</th>
            <th className="px-4 py-3 text-center text-gray-500 dark:text-gray-400 font-medium">Celność</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatDate(s.startedAt)}</td>
              <td className="px-4 py-3 text-center font-display font-bold text-blue-600 dark:text-blue-400">{s.score}</td>
              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{s.totalAsked}</td>
              <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                {s.totalAsked > 0 ? `${Math.round((s.score / s.totalAsked) * 100)}%` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
