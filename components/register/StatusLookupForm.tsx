'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { lookupStatusAction } from '@/lib/actions/publicRegistration';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { inputBaseClass } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

const initialState = { ok: false as const, error: undefined as string | undefined };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

export function StatusLookupForm() {
  const { dict, locale } = useLanguage();
  const t = dict.statusLookup;
  const [state, formAction] = useFormState(lookupStatusAction, initialState);

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex justify-end">
          <LanguageSwitcher tone="light" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">{t.heading}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.subheading}</p>
        </div>

        <Card>
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="locale" value={locale} />
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-600">{t.fullNameLabel}</span>
              <input name="fullName" type="text" required placeholder={t.fullNamePlaceholder} className={inputBaseClass()} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-gray-600">{t.dobLabel}</span>
              <input name="dateOfBirth" type="date" required className={inputBaseClass()} />
            </label>
            {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
            <SubmitButton label={t.submit} pendingLabel={t.submitting} />
          </form>
        </Card>
      </div>
    </main>
  );
}
