import { CheckCircle, XCircle } from 'lucide-react';
import { AnswerResult } from '@/types';

interface Props {
  result: AnswerResult;
  operation: string;
  operandA: number;
}

export function FeedbackBanner({ result, operation, operandA }: Props) {
  if (result.isCorrect) {
    return (
      <div className="animate-bounce-in flex items-center gap-3 px-6 py-4 rounded-2xl bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
        <CheckCircle size={28} className="flex-shrink-0" />
        <span className="font-display text-xl font-bold">Brawo! Dobrze!</span>
      </div>
    );
  }

  return (
    <div className="animate-bounce-in flex flex-col gap-2 px-6 py-4 rounded-2xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
      <div className="flex items-center gap-3">
        <XCircle size={28} className="flex-shrink-0" />
        <span className="font-display text-xl font-bold">
          Źle. Poprawna odpowiedź: <span className="text-red-900 dark:text-red-100">{result.correctAnswer}</span>
        </span>
      </div>
      {result.hint && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="font-semibold">Tabliczka {operation === 'MULTIPLY' ? '×' : '÷'} {operandA}:</span>{' '}
          {result.hint.map((v, i) => (
            <span key={i} className={v === result.correctAnswer ? 'font-bold text-blue-600 dark:text-blue-400' : ''}>
              {v}{i < result.hint!.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
