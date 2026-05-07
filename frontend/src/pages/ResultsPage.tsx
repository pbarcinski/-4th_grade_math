import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/api/users.api';
import { ScoreSummary } from '@/components/results/ScoreSummary';
import { WeakAreasList } from '@/components/results/WeakAreasList';
import { Button } from '@/components/ui/Button';

export function ResultsPage() {
  const navigate = useNavigate();
  const { score, totalAsked } = useGameStore();

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersApi.stats(),
  });

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto">
      <h1 className="font-display text-3xl font-black text-center text-gray-900 dark:text-gray-100">
        Wyniki
      </h1>

      <ScoreSummary score={score} totalAsked={totalAsked} />

      {stats?.weakAreas && stats.weakAreas.length > 0 && (
        <WeakAreasList weakAreas={stats.weakAreas} />
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => navigate('/challenge')} size="lg" className="flex-1">
          Zagraj jeszcze raz
        </Button>
        <Button onClick={() => navigate('/')} variant="secondary" size="lg" className="flex-1">
          Wróć do menu
        </Button>
      </div>
    </div>
  );
}
