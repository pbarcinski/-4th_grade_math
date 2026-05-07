interface Props {
  score: number;
  total: number;
}

export function ScoreBadge({ score, total }: Props) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
        Wynik
      </span>
      <span className="font-display text-3xl font-black text-blue-600 dark:text-blue-400">
        {score}
        <span className="text-lg text-gray-400">/{total}</span>
      </span>
    </div>
  );
}
