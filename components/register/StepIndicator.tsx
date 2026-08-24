'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { cn } from '@/lib/utils';

export function StepIndicator({ step }: { step: number }) {
  const { dict } = useLanguage();
  const labels = dict.register.steps;

  return (
    <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur border-b border-gray-100 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-gray-500 mb-1.5">
          <span className="whitespace-nowrap">
            {dict.register.stepOf.replace('{current}', String(step)).replace('{total}', String(labels.length))}
          </span>
          <span className="text-brand-600 truncate">{labels[step - 1]}</span>
          <LanguageSwitcher tone="light" className="flex-shrink-0" />
        </div>
        <div className="flex gap-1.5">
          {labels.map((label, i) => (
            <div
              key={label}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                i + 1 <= step ? 'bg-brand-500' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
