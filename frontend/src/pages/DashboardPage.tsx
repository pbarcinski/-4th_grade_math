import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Trophy } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { Card } from '@/components/ui/Card';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);

  const { data: personalBest } = useQuery({
    queryKey: ['personal-best'],
    queryFn: () => sessionsApi.personalBest(),
  });

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">
          Cześć, <span className="text-blue-600 dark:text-blue-400">{user?.username}</span>! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Wybierz tryb i zacznij ćwiczyć!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        <button
          onClick={() => navigate('/learn')}
          className="group p-8 rounded-3xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40 transition-all hover:scale-105 flex flex-col items-center gap-3"
        >
          <BookOpen size={40} />
          <span className="font-display text-2xl font-black">Tryb Nauki</span>
          <span className="text-blue-100 text-sm text-center">Ćwicz bez limitu czasu</span>
        </button>

        <button
          onClick={() => navigate('/challenge')}
          className="group p-8 rounded-3xl bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-lg border-2 border-blue-200 dark:border-blue-800 transition-all hover:scale-105 flex flex-col items-center gap-3"
        >
          <Zap size={40} className="text-blue-600 dark:text-blue-400" />
          <span className="font-display text-2xl font-black">Challenge</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm text-center">60 sekund, ile zdążysz!</span>
        </button>
      </div>

      {personalBest && (
        <Card className="p-5 flex items-center gap-4 w-full max-w-xl">
          <Trophy size={28} className="text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Twój rekord</p>
            <p className="font-display font-black text-2xl text-blue-600 dark:text-blue-400">
              {personalBest.score} pkt
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
