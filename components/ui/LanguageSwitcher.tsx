'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
  className,
  tone = 'dark',
}: {
  className?: string;
  /** 'dark' = for use on a dark/navy background (light text). 'light' = for use on a light background. */
  tone?: 'dark' | 'light';
}) {
  const { locale, setLocale } = useLanguage();

  const wrapperTone =
    tone === 'dark' ? 'border-white/30 bg-white/10 backdrop-blur-sm' : 'border-gray-200 bg-white';
  const inactiveTone = tone === 'dark' ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-ink';
  const activeTone = tone === 'dark' ? 'bg-white text-navy-800' : 'bg-navy-800 text-white';

  return (
    <div
      className={cn('inline-flex items-center rounded-full border p-0.5 text-xs font-semibold', wrapperTone, className)}
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn('px-3 py-1.5 rounded-full transition-colors', locale === 'en' ? activeTone : inactiveTone)}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('th')}
        className={cn('px-3 py-1.5 rounded-full transition-colors', locale === 'th' ? activeTone : inactiveTone)}
      >
        ไทย
      </button>
    </div>
  );
}
