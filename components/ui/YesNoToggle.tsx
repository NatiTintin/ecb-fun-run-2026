'use client';

import { cn } from '@/lib/utils';

export function YesNoToggle({
  value,
  onChange,
  name,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  name: string;
}) {
  return (
    <div className="flex gap-3" role="radiogroup" aria-label={name}>
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        onClick={() => onChange(true)}
        className={cn(
          'flex-1 h-12 rounded-xl border-2 font-semibold text-base transition-colors',
          value === true
            ? 'bg-red-500 border-red-500 text-white'
            : 'bg-white border-gray-200 text-ink hover:border-red-300'
        )}
      >
        ใช่ / YES
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        onClick={() => onChange(false)}
        className={cn(
          'flex-1 h-12 rounded-xl border-2 font-semibold text-base transition-colors',
          value === false
            ? 'bg-teal-500 border-teal-500 text-white'
            : 'bg-white border-gray-200 text-ink hover:border-teal-300'
        )}
      >
        ไม่ใช่ / NO
      </button>
    </div>
  );
}
