import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface Props {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: string;
}

export function StatCard({ icon: Icon, value, label, color = 'text-blue-600 dark:text-blue-400' }: Props) {
  return (
    <Card className="p-5 flex flex-col items-center gap-2">
      <Icon size={24} className={color} />
      <span className={`font-display text-3xl font-black ${color}`}>{value}</span>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide text-center">
        {label}
      </span>
    </Card>
  );
}
