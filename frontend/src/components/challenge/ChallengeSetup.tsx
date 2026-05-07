import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export type AnswerMode = 'click' | 'type';
export type ChallengeDuration = 60 | 180 | 500;

interface Props {
  onStart: (mode: AnswerMode, duration: ChallengeDuration) => void;
}

const DURATIONS: { label: string; value: ChallengeDuration; sub: string }[] = [
  { label: 'Sprint', value: 60, sub: '60 s' },
  { label: 'Średni', value: 180, sub: '3 min' },
  { label: 'Maraton', value: 500, sub: '~8 min' },
];

export function ChallengeSetup({ onStart }: Props) {
  const [answerMode, setAnswerMode] = useState<AnswerMode>('click');
  const [duration, setDuration] = useState<ChallengeDuration>(60);

  return (
    <div className="flex flex-col items-center gap-8 max-w-md mx-auto py-8">
      <h1 className="font-display text-3xl font-black text-gray-900 dark:text-gray-100">
        Ustawienia Challenge
      </h1>

      <div className="w-full flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Tryb odpowiedzi
        </p>
        <div className="grid grid-cols-2 gap-3">
          {(['click', 'type'] as AnswerMode[]).map(m => (
            <button
              key={m}
              onClick={() => setAnswerMode(m)}
              className={cn(
                'py-5 rounded-2xl font-bold text-base transition-all border-2',
                answerMode === m
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500',
              )}
            >
              {m === 'click' ? 'Wybierz wynik' : 'Wpisz wynik'}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Czas trwania
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map(d => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={cn(
                'py-5 rounded-2xl font-bold transition-all border-2 flex flex-col items-center gap-1',
                duration === d.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500',
              )}
            >
              <span className="text-lg font-black">{d.label}</span>
              <span className="text-xs font-normal opacity-70">{d.sub}</span>
            </button>
          ))}
        </div>
      </div>

      <Button
        size="lg"
        onClick={() => onStart(answerMode, duration)}
        className="w-full"
      >
        Start
      </Button>
    </div>
  );
}
