import { useMemo } from 'react';
import { Question } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  question: Question;
  resetKey?: number;
  onSubmit: (value: number) => void;
  disabled?: boolean;
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
    const f = question.conversionFactor ?? 1;
    // Generate plausible wrong answers: ×/÷ by factor variants, neighbors
    const isDiv = !question.conversionMultiply;
    candidates = [
      correct + 1, correct - 1,
      correct * 10, correct / 10,
      isDiv ? question.operandA : question.operandA / f / f,
      correct * f,
      correct + f, correct - f,
    ].filter(n => Number.isInteger(n) && n > 0 && n !== correct);
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
    const n = correct + Math.ceil(Math.random() * 6) * (Math.random() < 0.5 ? 1 : -1);
    if (n > 0 && Number.isInteger(n)) choices.add(n);
  }

  return [...choices].sort(() => Math.random() - 0.5);
}

export function ClickChoices({ question, resetKey = 0, onSubmit, disabled }: Props) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => {
    const correct = computeCorrect(question);
    return generateChoices(correct, question);
  }, [resetKey]);

  return (
    <div className="grid grid-cols-2 gap-3 w-full">
      {choices.map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onSubmit(n)}
          disabled={disabled}
          className={cn(
            'py-5 rounded-2xl font-display text-3xl font-black transition-all border-2',
            'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100',
            'hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
