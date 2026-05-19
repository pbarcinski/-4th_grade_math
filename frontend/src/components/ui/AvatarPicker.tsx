import { AVATARS } from '@/lib/avatars';

interface Props {
  value: string;
  onChange: (avatar: string) => void;
}

export function AvatarPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wybierz awatar</span>
      <div className="grid grid-cols-6 gap-2">
        {AVATARS.map((a) => (
          <button
            key={a.id}
            type="button"
            title={a.label}
            onClick={() => onChange(a.id)}
            className={`
              text-2xl rounded-xl p-2 transition-all border-2
              ${value === a.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 scale-110 shadow-md'
                : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
          >
            {a.id}
          </button>
        ))}
      </div>
    </div>
  );
}
