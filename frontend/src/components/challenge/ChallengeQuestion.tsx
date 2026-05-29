import { useRef, useEffect, FormEvent, useState } from 'react';
import { Question } from '@/types';
import { ClickChoices } from '@/components/learn/ClickChoices';

interface Props {
  question: Question;
  onAnswer: (value: number) => void;
  resetKey: number;
  answerMode?: 'click' | 'type';
}

function computeCorrect(q: Question): number {
  if (q.operation === 'CONVERT') {
    if (!q.conversionFactor) return 0;
    return q.conversionMultiply ? q.operandA * q.conversionFactor : q.operandA / q.conversionFactor;
  }
  return q.operation === 'MULTIPLY' ? q.operandA * q.operandB : q.operandA / q.operandB;
}

export function ChallengeQuestion({ question, onAnswer, resetKey, answerMode = 'type' }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    if (answerMode === 'type') inputRef.current?.focus();
  }, [resetKey, answerMode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!isNaN(num)) onAnswer(num);
  };

  const questionDisplay = (
    <div
      className="font-display text-6xl sm:text-8xl font-black text-blue-600 dark:text-blue-400 animate-flip-in"
      key={resetKey}
    >
      {question.display}
    </div>
  );

  if (answerMode === 'click') {
    return (
      <div className="flex flex-col items-center gap-6">
        {questionDisplay}
        <ClickChoicesWithFeedback
          question={question}
          resetKey={resetKey}
          onAnswer={onAnswer}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
      {questionDisplay}
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

// Click mode with visual feedback (correct/wrong highlight)
function ClickChoicesWithFeedback({
  question,
  resetKey,
  onAnswer,
}: {
  question: Question;
  resetKey: number;
  onAnswer: (n: number) => void;
}) {
  const [clicked, setClicked] = useState<number | null>(null);
  const correct = computeCorrect(question);

  useEffect(() => { setClicked(null); }, [resetKey]);

  const handleClick = (n: number) => {
    if (clicked !== null) return;
    setClicked(n);
    setTimeout(() => onAnswer(n), 250);
  };

  return (
    <ClickChoices
      question={question}
      resetKey={resetKey}
      onSubmit={handleClick}
      disabled={clicked !== null}
      highlightCorrect={clicked !== null ? correct : undefined}
      highlightClicked={clicked ?? undefined}
    />
  );
}
