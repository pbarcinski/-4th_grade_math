import { Question } from '@/types';

interface Props {
  question: Question;
  animKey: number;
}

export function FlashCard({ question, animKey }: Props) {
  return (
    <div
      key={animKey}
      className="animate-flip-in bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 border-blue-100 dark:border-blue-900 p-10 flex items-center justify-center"
    >
      <span className="font-display text-5xl sm:text-7xl font-black text-blue-600 dark:text-blue-400 select-none">
        {question.display}
      </span>
    </div>
  );
}
