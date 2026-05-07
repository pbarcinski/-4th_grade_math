import { cn } from '@/lib/utils';

interface Props {
  timeLeft: number;
  total?: number;
}

export function CountdownTimer({ timeLeft, total = 60 }: Props) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / total;
  const offset = circumference * (1 - progress);

  const color =
    timeLeft <= 10 ? 'stroke-red-500' : timeLeft <= 20 ? 'stroke-amber-400' : 'stroke-blue-500';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={100} height={100} className="-rotate-90">
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          strokeWidth={8}
          className="stroke-gray-200 dark:stroke-gray-700"
        />
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(color, 'transition-all duration-1000')}
        />
      </svg>
      <span
        className={cn(
          'font-display text-3xl font-black -mt-16',
          timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-gray-100',
        )}
      >
        {timeLeft}
      </span>
    </div>
  );
}
