import { Trophy, Target, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Props {
  score: number;
  totalAsked: number;
}

export function ScoreSummary({ score, totalAsked }: Props) {
  const accuracy = totalAsked > 0 ? Math.round((score / totalAsked) * 100) : 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-5 flex flex-col items-center gap-2">
        <Trophy size={28} className="text-yellow-500" />
        <span className="font-display text-4xl font-black text-blue-600 dark:text-blue-400">{score}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Wynik</span>
      </Card>
      <Card className="p-5 flex flex-col items-center gap-2">
        <Target size={28} className="text-green-500" />
        <span className="font-display text-4xl font-black text-gray-900 dark:text-gray-100">{accuracy}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Celność</span>
      </Card>
      <Card className="p-5 flex flex-col items-center gap-2">
        <Clock size={28} className="text-blue-500" />
        <span className="font-display text-4xl font-black text-gray-900 dark:text-gray-100">{totalAsked}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Pytań</span>
      </Card>
    </div>
  );
}
