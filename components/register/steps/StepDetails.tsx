'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { RegistrationDraft } from '@/components/register/types';
import { Field, inputBaseClass } from '@/components/ui/Field';

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
    </div>
  );
}
