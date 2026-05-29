import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Zap, Trophy, Ruler, Calculator } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { sessionsApi } from '@/api/sessions.api';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: personalBest } = useQuery({
    queryKey: ['personal-best', selectedCategory],
    queryFn: () => sessionsApi.personalBest(selectedCategory ?? 'MULTIPLICATION'),
    enabled: selectedCategory !== null,
  });

  const categories: { key: Category; label: string; sub: string; icon: React.ReactNode; examples: string }[] = [
    {
      key: 'MULTIPLICATION',
      label: 'Tabliczka mnożenia',
      sub: 'Mnożenie i dzielenie do 100',
      icon: <Calculator size={36} />,
      examples: '7 × 8 = ?  •  56 ÷ 7 = ?',
    },
    {
      key: 'UNIT_CONVERSION',
      label: 'Zamiana miar',
      sub: 'Długości i wagi',
      icon: <Ruler size={36} />,
      examples: '500 cm = ? m  •  2 kg = ? g',
    },
  ];

  return (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">
          Cześć, <span className="text-blue-600 dark:text-blue-400">{user?.username}</span>! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Wybierz kategorię i zacznij ćwiczyć!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(c => c === cat.key ? null : cat.key)}
            className={cn(
              'group p-6 rounded-3xl text-left transition-all hover:scale-105 flex flex-col gap-3 border-2',
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 dark:shadow-blue-900/40'
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-blue-200 dark:border-blue-800 shadow-md hover:border-blue-400 dark:hover:border-blue-600',
            )}
          >
            <div className={cn(
              'transition-colors',
              selectedCategory === cat.key ? 'text-white' : 'text-blue-600 dark:text-blue-400',
            )}>
              {cat.icon}
            </div>
            <div>
              <span className="font-display text-xl font-black block">{cat.label}</span>
              <span className={cn(
                'text-sm block mt-0.5',
                selectedCategory === cat.key ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400',
              )}>
                {cat.sub}
              </span>
              <span className={cn(
                'text-xs font-mono mt-2 block',
                selectedCategory === cat.key ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500',
              )}>
                {cat.examples}
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl animate-fade-in">
          <button
            onClick={() => navigate(`/learn?category=${selectedCategory}`)}
            className="group p-8 rounded-3xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/40 transition-all hover:scale-105 flex flex-col items-center gap-3"
          >
            <BookOpen size={40} />
            <span className="font-display text-2xl font-black">Tryb Nauki</span>
            <span className="text-blue-100 text-sm text-center">Ćwicz bez limitu czasu</span>
          </button>

          <button
            onClick={() => navigate(`/challenge?category=${selectedCategory}`)}
            className="group p-8 rounded-3xl bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-lg border-2 border-blue-200 dark:border-blue-800 transition-all hover:scale-105 flex flex-col items-center gap-3"
          >
            <Zap size={40} className="text-blue-600 dark:text-blue-400" />
            <span className="font-display text-2xl font-black">Challenge</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm text-center">60 sekund, ile zdążysz!</span>
          </button>
        </div>
      )}

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
