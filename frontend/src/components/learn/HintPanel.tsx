import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { Question } from '@/types';

interface Props {
  question: Question;
}

export function HintPanel({ question }: Props) {
  const [open, setOpen] = useState(false);

  if (question.operation === 'CONVERT') {
    const { fromUnit, toUnit, conversionFactor, operandA } = question;
    if (!fromUnit || !toUnit || !conversionFactor) return null;

    const isMultiply = question.conversionMultiply ?? false;
    // Build example rows: pick 5 representative source values
    const baseValues = isMultiply ? [1, 2, 3, 5, 10] : [1, 2, 3, 5, 10].map(v => v * conversionFactor);

    return (
      <div className="w-full">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          type="button"
        >
          <Lightbulb size={16} />
          {open ? 'Ukryj wskazówkę' : 'Pokaż wskazówkę'}
        </button>

        {open && (
          <div className="mt-3 animate-fade-in bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
              Zamiana {fromUnit} → {toUnit} (1 {toUnit} = {conversionFactor} {fromUnit}):
            </p>
            <div className="flex flex-wrap gap-2">
              {baseValues.map(src => {
                const dst = isMultiply ? src * conversionFactor : src / conversionFactor;
                const isHighlight = src === operandA;
                return (
                  <span
                    key={src}
                    className={`px-2 py-1 rounded-lg text-sm font-mono ${
                      isHighlight
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {src} {fromUnit} = {dst} {toUnit}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const table =
    question.operation === 'MULTIPLY'
      ? Array.from({ length: 10 }, (_, i) => ({ factor: i + 1, result: question.operandA * (i + 1) }))
      : Array.from({ length: 10 }, (_, i) => ({ factor: i + 1, result: question.operandB * (i + 1) }));

  const highlightResult =
    question.operation === 'MULTIPLY'
      ? question.operandA * question.operandB
      : question.operandA;

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        type="button"
      >
        <Lightbulb size={16} />
        {open ? 'Ukryj wskazówkę' : 'Pokaż wskazówkę'}
      </button>

      {open && (
        <div className="mt-3 animate-fade-in bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            Tabliczka {question.operation === 'MULTIPLY' ? `mnożenia przez ${question.operandA}` : `mnożenia przez ${question.operandB}`}:
          </p>
          <div className="flex flex-wrap gap-2">
            {table.map(({ factor, result }) => (
              <span
                key={factor}
                className={`px-2 py-1 rounded-lg text-sm font-mono ${
                  result === highlightResult
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {question.operation === 'MULTIPLY' ? question.operandA : question.operandB} × {factor} = {result}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
