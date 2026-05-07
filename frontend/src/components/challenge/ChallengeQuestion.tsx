import { useRef, useEffect, FormEvent, useState, useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  question: Question;
  onAnswer: (value: number) => void;
  resetKey: number;
  answerMode?: 'click' | 'type';
}

function computeCorrect(q: Question): number {
  return q.operation === 'MULTIPLY' ? q.operandA * q.operandB : q.operandA / q.operandB;
}

function generateChoices(correct: number, operandA: number, operandB: number): number[] {
  const choices = new Set<number>([correct]);

  const candidates = [
    correct + 1, correct - 1, correct + 2, correct - 2,
    correct + operandA, correct - operandA,
    correct + operandB, correct - operandB,
    operandA * (operandB + 1), operandA * (operandB - 1),
    (operandA + 1) * operandB, (operandA - 1) * operandB,
  ].filter(n => n > 0 && n !== correct);

  for (const c of candidates) {
    if (choices.size >= 4) break;
    choices.add(c);
  }

  let safety = 0;
  while (choices.size < 4 && safety++ < 50) {
    const n = correct + Math.ceil(Math.random() * 6) * (Math.random() < 0.5 ? 1 : -1);
    if (n > 0) choices.add(n);
  }

  return [...choices].sort(() => Math.random() - 0.5);
}

export function ChallengeQuestion({ question, onAnswer, resetKey, answerMode = 'type' }: Props) {
  const [value, setValue] = useState('');
  const [clicked, setClicked] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => {
    const correct = computeCorrect(question);
    return generateChoices(correct, question.operandA, question.operandB);
  }, [resetKey]);

  const correct = computeCorrect(question);

  useEffect(() => {
    setValue('');
    setClicked(null);
    if (answerMode === 'type') inputRef.current?.focus();
  }, [resetKey, answerMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!isNaN(num)) onAnswer(num);
  };

  const handleClick = (n: number) => {
    if (clicked !== null) return;
    setClicked(n);
    setTimeout(() => onAnswer(n), 250);
  };

  if (answerMode === 'click') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div
          className="font-display text-6xl sm:text-8xl font-black text-blue-600 dark:text-blue-400 animate-flip-in"
          key={resetKey}
        >
          {question.display}
        </div>
        <div className="grid grid-cols-2 gap-3 w-full">
          {choices.map(n => (
            <button
              key={n}
              onClick={() => handleClick(n)}
              disabled={clicked !== null}
              className={cn(
                'py-6 rounded-2xl font-display text-3xl font-black transition-all border-2 disabled:cursor-not-allowed',
                clicked === null
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95'
                  : clicked === n
                  ? n === correct
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-105'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                  : n === correct
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 opacity-40',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
      <div
        className="font-display text-6xl sm:text-8xl font-black text-blue-600 dark:text-blue-400 animate-flip-in"
        key={resetKey}
      >
        {question.display}
      </div>
      <div className="flex gap-3">
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="?"
          aria-label="Odpowiedź"
          className="w-28 text-center font-display text-3xl font-bold px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all"
        />
        <button
          type="submit"
          disabled={value === ''}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg disabled:opacity-50 transition-all"
        >
          OK
        </button>
      </div>
    </form>
  );
}
