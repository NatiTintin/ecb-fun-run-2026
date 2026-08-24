'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { RegistrationDraft } from '@/components/register/types';
import { Field, inputBaseClass } from '@/components/ui/Field';
import { cn } from '@/lib/utils';

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function StepDetails({
  draft,
  update,
  errors,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
}) {
  const { dict } = useLanguage();
  const t = dict.register.details;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-ink">{t.heading}</h2>
        <p className="text-sm text-gray-500">{t.subheading}</p>
      </div>

      <Field label={t.fullName} htmlFor="fullName" required error={errors.fullName}>
        <input
          id="fullName"
          className={inputBaseClass(!!errors.fullName)}
          value={draft.fullName}
          onChange={(e) => update({ fullName: e.target.value })}
          placeholder={t.fullNamePlaceholder}
          autoComplete="name"
        />
      </Field>

      <Field label={t.phone} htmlFor="phone" required error={errors.phone} hint={t.phoneHint}>
        <input
          id="phone"
          className={inputBaseClass(!!errors.phone)}
          value={draft.phone}
          onChange={(e) => update({ phone: e.target.value })}
          placeholder="081-234-5678"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>

      <Field label={t.email} htmlFor="email" required error={errors.email} hint={t.emailHint}>
        <input
          id="email"
          type="email"
          className={inputBaseClass(!!errors.email)}
          value={draft.email}
          onChange={(e) => update({ email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </Field>

      <Field
        label={t.dateOfBirth}
        htmlFor="dateOfBirth"
        required
        error={errors.dateOfBirth}
        hint={t.dateOfBirthHint}
      >
        <input
          id="dateOfBirth"
          type="date"
          max={todayIsoDate()}
          className={inputBaseClass(!!errors.dateOfBirth)}
          value={draft.dateOfBirth}
          onChange={(e) => update({ dateOfBirth: e.target.value })}
          autoComplete="bday"
        />
      </Field>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">
          {t.idType} <span className="text-brand-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update({ idType: 'THAI_ID' })}
            aria-pressed={draft.idType === 'THAI_ID'}
            className={cn(
              'h-12 rounded-xl border-2 font-semibold text-sm transition-colors',
              draft.idType === 'THAI_ID'
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-gray-200 bg-white text-ink hover:border-brand-300'
            )}
          >
            {t.idTypeThai}
          </button>
          <button
            type="button"
            onClick={() => update({ idType: 'PASSPORT' })}
            aria-pressed={draft.idType === 'PASSPORT'}
            className={cn(
              'h-12 rounded-xl border-2 font-semibold text-sm transition-colors',
              draft.idType === 'PASSPORT'
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-gray-200 bg-white text-ink hover:border-brand-300'
            )}
          >
            {t.idTypePassport}
          </button>
        </div>
      </div>

      <Field
        label={t.idNumber}
        htmlFor="idNumber"
        required
        error={errors.idNumber}
        hint={draft.idType === 'THAI_ID' ? t.idNumberHintThai : t.idNumberHintPassport}
      >
        <input
          id="idNumber"
          className={inputBaseClass(!!errors.idNumber)}
          value={draft.idNumber}
          onChange={(e) => update({ idNumber: e.target.value })}
          placeholder={draft.idType === 'THAI_ID' ? '1234567890123' : 'A1234567'}
          inputMode={draft.idType === 'THAI_ID' ? 'numeric' : 'text'}
        />
      </Field>

      <p className="text-xs text-gray-400">{t.identityPurposeNote}</p>
    </div>
  );
}
