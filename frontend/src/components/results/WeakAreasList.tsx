import { WeakArea } from '@/types';
import { Card } from '@/components/ui/Card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  weakAreas: WeakArea[];
}

const opSymbol = (op: string) => (op === 'MULTIPLY' ? '×' : '÷');

export function WeakAreasList({ weakAreas }: Props) {
  if (weakAreas.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={20} className="text-amber-500" />
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Słabe obszary do ćwiczenia</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {weakAreas.map((w, i) => (
          <span
            key={i}
            className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-mono text-sm font-bold"
          >
            {w.operation === 'CONVERT'
              ? (w.conversionLabel ?? w.conversionKey ?? '?')
              : `${w.operandA} ${opSymbol(w.operation)} ${w.operandB}`}
          </span>
        ))}
      </div>
    </Card>
  );
}
