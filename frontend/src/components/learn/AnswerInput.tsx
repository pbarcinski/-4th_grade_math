import { useRef, useEffect, FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Props {
  onSubmit: (value: number) => void;
  disabled?: boolean;
  resetKey?: number;
}

export function AnswerInput({ onSubmit, disabled, resetKey }: Props) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    if (!disabled) inputRef.current?.focus();
  }, [resetKey, disabled]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const num = parseInt(value, 10);
    if (!isNaN(num)) onSubmit(num);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={e => setValue(e.target.value)}
        disabled={disabled}
        placeholder="?"
        aria-label="Twoja odpowiedź"
        className="w-28 text-center font-display text-3xl font-bold px-4 py-3 rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all disabled:opacity-50"
      />
      <Button type="submit" size="lg" disabled={disabled || value === ''}>
        Sprawdź
      </Button>
    </form>
  );
}
