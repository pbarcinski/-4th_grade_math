import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
