'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function SelectableCard({
  selected,
  disabled,
  onClick,
  title,
  subtitle,
  badge,
  className,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'w-full rounded-2xl border-2 p-4 text-left transition-all',
        disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
        !disabled && selected && 'border-brand-500 bg-brand-50 shadow-soft',
        !disabled && !selected && 'border-gray-200 bg-white hover:border-brand-300',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-bold text-ink text-base">{title}</div>
        {badge}
      </div>
      {subtitle && <div className="mt-1 text-sm text-gray-500">{subtitle}</div>}
    </button>
  );
}
