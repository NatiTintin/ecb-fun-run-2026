'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { SHIRT_SIZES, SHIRT_SIZE_GUIDE } from '@/lib/config';
import { RegistrationDraft } from '@/components/register/types';
import { cn } from '@/lib/utils';

export function StepShirt({
  draft,
  update,
  errors,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
}) {
  const [guideOpen, setGuideOpen] = useState(true);
  const { dict } = useLanguage();
  const t = dict.register.shirt;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-ink">{t.heading}</h2>
        <p className="text-sm text-gray-500">{t.subheading}</p>
      </div>

      <div className="rounded-xl bg-amber-100/60 border border-amber-400/50 p-3 text-sm text-amber-900">{t.warning}</div>

      <div>
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          className="text-sm font-semibold text-brand-600 underline"
        >
          {guideOpen ? t.hideGuide : t.showGuide}
        </button>
        {guideOpen && (
          <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="py-2 px-2 font-semibold">{t.size}</th>
                  <th className="py-2 px-2 font-semibold">{t.chest}</th>
                  <th className="py-2 px-2 font-semibold">{t.length}</th>
                </tr>
              </thead>
              <tbody>
                {SHIRT_SIZES.map((size) => (
                  <tr key={size} className="border-t border-gray-100">
                    <td className="py-1.5 px-2 font-semibold">{size}</td>
                    <td className="py-1.5 px-2">{SHIRT_SIZE_GUIDE[size].chest}</td>
                    <td className="py-1.5 px-2">{SHIRT_SIZE_GUIDE[size].length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">
          {t.shirtSize} <span className="text-brand-500">*</span>
        </p>
        <div className="grid grid-cols-5 gap-2">
          {SHIRT_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => update({ shirtSize: size })}
              aria-pressed={draft.shirtSize === size}
              className={cn(
                'h-14 rounded-xl border-2 font-bold text-sm transition-colors',
                draft.shirtSize === size
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-200 bg-white text-ink hover:border-brand-300'
              )}
            >
              {size}
            </button>
          ))}
        </div>
        {errors.shirtSize && <p className="text-xs font-medium text-red-600 mt-2">{errors.shirtSize}</p>}
      </div>
    </div>
  );
}
