import { useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  question: Question;
  resetKey?: number;
  onSubmit: (value: number) => void;
  disabled?: boolean;
  highlightCorrect?: number;
  highlightClicked?: number;
}

function computeCorrect(q: Question): number {
  if (q.operation === 'CONVERT') {
    if (!q.conversionFactor) return 0;
    return q.conversionMultiply ? q.operandA * q.conversionFactor : q.operandA / q.conversionFactor;
  }
  return q.operation === 'MULTIPLY' ? q.operandA * q.operandB : q.operandA / q.operandB;
}

function generateChoices(correct: number, question: Question): number[] {
  const choices = new Set<number>([correct]);

  let candidates: number[];

  if (question.operation === 'CONVERT') {
    const src = question.operandA;
    const f = question.conversionFactor ?? 1;
    candidates = [
      question.conversionMultiply ? Math.round(src / f) : src * f,
      correct * 10,
      correct * 100,
      correct * f,
      Math.round(correct / 10),
    ].filter(n => Number.isFinite(n) && Number.isInteger(n) && n > 0 && n !== correct);
  } else {
    const { operandA, operandB } = question;
    candidates = [
      correct + 1, correct - 1, correct + 2, correct - 2,
      correct + operandA, correct - operandA,
      correct + operandB, correct - operandB,
      operandA * (operandB + 1), operandA * (operandB - 1),
      (operandA + 1) * operandB, (operandA - 1) * operandB,
    ].filter(n => n > 0 && n !== correct);
  }

  for (const c of candidates) {
    if (choices.size >= 4) break;
    choices.add(c);
  }

  let safety = 0;
  while (choices.size < 4 && safety++ < 50) {
    const offset = Math.ceil(Math.random() * Math.max(correct, 5));
    const n = Math.random() < 0.5 ? correct + offset : Math.max(1, correct - offset);
    if (Number.isInteger(n) && n > 0) choices.add(n);
  }

  return [...choices].sort(() => Math.random() - 0.5);
}

export function ClickChoices({ question, resetKey = 0, onSubmit, disabled, highlightCorrect, highlightClicked }: Props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => {
    const correct = computeCorrect(question);
    return generateChoices(correct, question);
  }, [resetKey]);

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {choices.map(n => {
        const isClicked = highlightClicked === n;
        const isCorrect = highlightCorrect === n;
        const showFeedback = highlightCorrect !== undefined;

        return (
          <button
            key={n}
            type="button"
            onClick={() => onSubmit(n)}
            disabled={disabled}
            className={cn(
              'py-5 rounded-2xl font-display text-3xl font-black transition-all border-2 disabled:cursor-not-allowed',
              !showFeedback && 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95 disabled:opacity-50',
              showFeedback && isClicked && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-105',
              showFeedback && isClicked && !isCorrect && 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400',
              showFeedback && !isClicked && isCorrect && 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              showFeedback && !isClicked && !isCorrect && 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 opacity-40',
            )}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
