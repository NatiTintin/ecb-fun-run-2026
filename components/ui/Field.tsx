import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600" role="alert">{error}</p>}
    </div>
  );
}

export function inputBaseClass(hasError?: boolean) {
  return cn(
    'w-full h-12 rounded-xl border-2 bg-white px-4 text-base text-ink placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300 transition-colors',
    hasError ? 'border-red-400' : 'border-gray-200 focus:border-brand-400'
  );
}
