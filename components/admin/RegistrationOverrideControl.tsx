'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setRegistrationOverrideAction } from '@/lib/actions/adminSettings';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

const OPTIONS: { value: 'AUTO' | 'FORCE_OPEN' | 'FORCE_CLOSED'; label: string }[] = [
  { value: 'AUTO', label: 'Auto (ตามวันที่)' },
  { value: 'FORCE_OPEN', label: 'Force Open' },
  { value: 'FORCE_CLOSED', label: 'Force Closed' },
];

export function RegistrationOverrideControl({
  current,
  computedState,
}: {
  current: string;
  computedState: 'UPCOMING' | 'OPEN' | 'CLOSED';
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="flex items-center gap-2">
      <Badge tone={computedState === 'OPEN' ? 'success' : computedState === 'UPCOMING' ? 'warning' : 'danger'}>
        Registration: {computedState}
      </Badge>
      <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            disabled={isPending}
            onClick={() =>
              startTransition(async () => {
                await setRegistrationOverrideAction(opt.value);
                router.refresh();
              })
            }
            className={cn(
              'px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors',
              current === opt.value ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
