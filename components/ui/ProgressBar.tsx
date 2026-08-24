import { cn } from '@/lib/utils';

export function ProgressBar({
  value,
  max,
  tone = 'brand',
  className,
}: {
  value: number;
  max: number;
  tone?: 'brand' | 'teal' | 'danger';
  className?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor =
    tone === 'danger' ? 'bg-red-500' : tone === 'teal' ? 'bg-teal-500' : 'bg-brand-500';
  return (
    <div className={cn('h-3 w-full rounded-full bg-gray-100 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all', barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
