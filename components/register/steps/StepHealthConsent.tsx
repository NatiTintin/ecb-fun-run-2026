'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { RegistrationDraft } from '@/components/register/types';
import { YesNoToggle } from '@/components/ui/YesNoToggle';

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

function ConsentBlock({
  title,
  text,
  value,
  onChange,
  error,
  required,
  iConsent,
}: {
  title: string;
  text: string;
  value: 'CONSENT' | 'NO_CONSENT' | null;
  onChange: (v: 'CONSENT') => void;
  error?: string;
  required?: boolean;
  iConsent: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <p className="font-bold text-ink">
        {title}
        {required && <span className="text-brand-500"> *</span>}
      </p>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
      <button
        type="button"
        onClick={() => onChange('CONSENT')}
        className={`w-full h-11 rounded-xl border-2 font-semibold text-sm ${
          value === 'CONSENT' ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200 text-ink'
        }`}
      >
        {iConsent}
      </button>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function StepHealthConsent({
  draft,
  update,
  errors,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
}) {
  const { dict } = useLanguage();
  const t = dict.register.health;
  const hasHealthFlag = QUESTION_KEYS.some((k) => draft.parq[k] === true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-ink">{t.heading}</h2>
        <p className="text-sm text-gray-500">{t.subheading}</p>
      </div>

      <div className="space-y-4">
        {t.questions.map((question, i) => {
          const key = QUESTION_KEYS[i];
          return (
            <div key={key} className="rounded-2xl border border-gray-200 p-4 space-y-2.5">
              <p className="text-sm font-semibold text-ink">
                {i + 1}. {question}
              </p>
              <YesNoToggle
                name={`parq-${key}`}
                value={draft.parq[key]}
                onChange={(v) => update({ parq: { ...draft.parq, [key]: v } })}
                yesLabel={t.yes}
                noLabel={t.no}
              />
              {errors[key] && <p className="text-xs font-medium text-red-600">{errors[key]}</p>}
            </div>
          );
        })}
      </div>

      {hasHealthFlag && (
        <div className="rounded-2xl bg-red-50 border-2 border-red-300 p-4 space-y-3">
          <p className="font-bold text-red-700">{t.warningTitle}</p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-red-600 flex-shrink-0"
              checked={draft.parqAcknowledged}
              onChange={(e) => update({ parqAcknowledged: e.target.checked })}
            />
            <span className="text-sm text-red-800">{t.ack}</span>
          </label>
          {errors.parqAcknowledged && <p className="text-xs font-medium text-red-600">{errors.parqAcknowledged}</p>}
        </div>
      )}

      <div className="border-t border-gray-100 pt-6 space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink">{t.pdpaHeading}</h2>
          <p className="text-sm text-gray-500">{t.pdpaSubheading}</p>
        </div>

        <ConsentBlock
          title={t.consentA.title}
          text={t.consentA.text}
          value={draft.healthConsent}
          onChange={(v) => update({ healthConsent: v })}
          error={errors.healthConsent}
          required
          iConsent={t.iConsent}
        />
        <ConsentBlock
          title={t.consentB.title}
          text={t.consentB.text}
          value={draft.marketingConsent}
          onChange={(v) => update({ marketingConsent: v })}
          error={errors.marketingConsent}
          iConsent={t.iConsent}
        />
        <ConsentBlock
          title={t.consentC.title}
          text={t.consentC.text}
          value={draft.communicationConsent}
          onChange={(v) => update({ communicationConsent: v })}
          error={errors.communicationConsent}
          iConsent={t.iConsent}
        />
      </div>

      <div className="rounded-2xl border-2 border-brand-300 bg-brand-50 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-brand-600 flex-shrink-0"
            checked={draft.declarationAccepted}
            onChange={(e) => update({ declarationAccepted: e.target.checked })}
          />
          <span className="text-sm text-ink font-medium">{t.declaration}</span>
        </label>
        {errors.declarationAccepted && <p className="text-xs font-medium text-red-600 mt-2">{errors.declarationAccepted}</p>}
      </div>
    </div>
  );
}
