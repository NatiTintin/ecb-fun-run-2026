'use client';

import { cn } from '@/lib/utils';

export function YesNoToggle({
  value,
  onChange,
  name,
  yesLabel = 'YES',
  noLabel = 'NO',
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
  name: string;
  yesLabel?: string;
  noLabel?: string;
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
        {yesLabel}
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
        {noLabel}
      </button>
    </div>
  );
}
