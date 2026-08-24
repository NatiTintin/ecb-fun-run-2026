'use client';

import { useState, useTransition } from 'react';
import { participantInfoSchema, shirtSizeSchema, validateIdentityFields, parseDateOfBirth } from '@/lib/validation';
import { submitRegistrationAction } from '@/lib/actions/publicRegistration';
import { calculateAge, requiredParticipantType } from '@/lib/config';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Dictionary } from '@/lib/i18n/dictionaries';
import { RegistrationDraft, emptyDraft, QuotaOverviewItem, PricingInfo, PaymentInfo } from '@/components/register/types';
import { StepIndicator } from '@/components/register/StepIndicator';
import { StepDetails } from '@/components/register/steps/StepDetails';
import { StepRace } from '@/components/register/steps/StepRace';
import { StepShirt } from '@/components/register/steps/StepShirt';
import { StepHealthConsent } from '@/components/register/steps/StepHealthConsent';
import { StepPayment } from '@/components/register/steps/StepPayment';
import { StepReview } from '@/components/register/steps/StepReview';
import { StepSuccess } from '@/components/register/steps/StepSuccess';
import { Button } from '@/components/ui/Button';

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

function validateStep(
  step: number,
  draft: RegistrationDraft,
  dict: Dictionary,
  childMaxAgeYears: number | null
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    const result = participantInfoSchema
      .pick({ fullName: true, phone: true, email: true })
      .safeParse({ fullName: draft.fullName, phone: draft.phone, email: draft.email });
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = String(issue.path[0]) as 'fullName' | 'phone' | 'email';
        errors[field] = dict.register.details.errors[field];
      }
    }

    const identityErrors = validateIdentityFields({
      dateOfBirth: draft.dateOfBirth,
      idType: draft.idType,
      idNumber: draft.idNumber,
    });
    if (identityErrors.dateOfBirth) errors.dateOfBirth = dict.register.details.errors[identityErrors.dateOfBirth];
    if (identityErrors.idNumber) errors.idNumber = dict.register.details.errors[identityErrors.idNumber];
  }

  if (step === 2) {
    if (!draft.participantType) errors.participantType = dict.register.race.errors.participantType;
    if (!draft.distance) errors.distance = dict.register.race.errors.distance;

    const dob = parseDateOfBirth(draft.dateOfBirth);
    if (dob && draft.participantType) {
      const required = requiredParticipantType(calculateAge(dob), childMaxAgeYears);
      if (required && draft.participantType !== required) {
        errors.participantType =
          required === 'CHILD' ? dict.register.race.errors.ageRequiresChild : dict.register.race.errors.ageRequiresAdult;
      }
    }
  }

  if (step === 3) {
    const result = shirtSizeSchema.safeParse({ shirtSize: draft.shirtSize });
    if (!result.success) errors.shirtSize = dict.register.shirt.errors.shirtSize;
  }

  if (step === 4) {
    const he = dict.register.health.errors;
    for (const key of QUESTION_KEYS) {
      if (draft.parq[key] === null) errors[key] = he.answerRequired;
    }
    const hasHealthFlag = QUESTION_KEYS.some((k) => draft.parq[k] === true);
    if (hasHealthFlag && !draft.parqAcknowledged) {
      errors.parqAcknowledged = he.ackRequired;
    }
    if (!draft.healthConsent) errors.healthConsent = he.healthConsentRequired;
    else if (draft.healthConsent === 'NO_CONSENT') {
      errors.healthConsent = he.healthConsentMandatory;
    }
    if (!draft.marketingConsent) errors.marketingConsent = he.marketingConsentRequired;
    if (!draft.communicationConsent) errors.communicationConsent = he.communicationConsentRequired;
    if (!draft.declarationAccepted) errors.declarationAccepted = he.declarationRequired;
  }

  return errors;
}

function buildFormData(draft: RegistrationDraft, locale: string): FormData {
  const fd = new FormData();
  fd.set('locale', locale);
  fd.set('fullName', draft.fullName);
  fd.set('phone', draft.phone);
  fd.set('email', draft.email);
  fd.set('dateOfBirth', draft.dateOfBirth);
  fd.set('idType', draft.idType);
  fd.set('idNumber', draft.idNumber);
  fd.set('participantType', draft.participantType ?? '');
  fd.set('distance', draft.distance ?? '');
  fd.set('shirtSize', draft.shirtSize ?? '');
  for (const key of QUESTION_KEYS) fd.set(key, String(draft.parq[key] === true));
  fd.set('parqAcknowledged', String(draft.parqAcknowledged));
  fd.set('healthConsent', draft.healthConsent ?? '');
  fd.set('marketingConsent', draft.marketingConsent ?? '');
  fd.set('communicationConsent', draft.communicationConsent ?? '');
  fd.set('declarationAccepted', String(draft.declarationAccepted));
  if (draft.slip) fd.set('slip', draft.slip);
  return fd;
}

type WizardSubmitResult =
  | { ok: true; registrationId: string; statusToken?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function RegistrationWizard({
  quotas,
  pricing,
  payment,
  childMaxAgeYears = null,
  submitFn = submitRegistrationAction,
  successHrefBase = '/status',
}: {
  quotas: QuotaOverviewItem[];
  pricing: PricingInfo;
  payment: PaymentInfo;
  childMaxAgeYears?: number | null;
  submitFn?: (formData: FormData) => Promise<WizardSubmitResult>;
  successHrefBase?: string;
}) {
  const { dict, locale } = useLanguage();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<RegistrationDraft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ registrationId: string; statusToken?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function update(patch: Partial<RegistrationDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function goNext() {
    const stepErrors = validateStep(step, draft, dict, childMaxAgeYears);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((s) => Math.min(6, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit() {
    setSubmitError(null);
    startTransition(async () => {
      const res = await submitFn(buildFormData(draft, locale));
      if (res.ok) {
        setResult({ registrationId: res.registrationId, statusToken: res.statusToken });
      } else {
        setSubmitError(res.error);
        if (res.fieldErrors) setErrors(res.fieldErrors);
      }
    });
  }

  if (result) {
    return (
      <StepSuccess
        registrationId={result.registrationId}
        statusToken={result.statusToken}
        successHrefBase={successHrefBase}
      />
    );
  }

  return (
    <div>
      <StepIndicator step={step} />
      <div className="max-w-2xl mx-auto px-5 py-6">
        {step === 1 && <StepDetails draft={draft} update={update} errors={errors} />}
        {step === 2 && (
          <StepRace
            draft={draft}
            update={update}
            errors={errors}
            quotas={quotas}
            pricing={pricing}
            childMaxAgeYears={childMaxAgeYears}
          />
        )}
        {step === 3 && <StepShirt draft={draft} update={update} errors={errors} />}
        {step === 4 && <StepHealthConsent draft={draft} update={update} errors={errors} />}
        {step === 5 && <StepPayment draft={draft} update={update} errors={errors} payment={payment} pricing={pricing} />}
        {step === 6 && <StepReview draft={draft} pricing={pricing} />}

        {submitError && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-8 flex gap-3">
          {step > 1 && (
            <Button variant="outline" size="lg" onClick={goBack} disabled={isPending}>
              {dict.common.back}
            </Button>
          )}
          {step < 6 ? (
            <Button size="lg" fullWidth onClick={goNext}>
              {dict.common.next}
            </Button>
          ) : (
            <Button size="lg" fullWidth onClick={handleSubmit} disabled={isPending}>
              {isPending ? dict.register.review.submitting : dict.register.review.submit}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
