'use client';

import { useState, useTransition } from 'react';
import { participantInfoSchema, shirtSizeSchema } from '@/lib/validation';
import { submitRegistrationAction } from '@/lib/actions/publicRegistration';
import {
  RegistrationDraft,
  emptyDraft,
  QuotaOverviewItem,
  PricingInfo,
  PaymentInfo,
  ConsentTextInfo,
} from '@/components/register/types';
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

function validateStep(step: number, draft: RegistrationDraft): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    const result = participantInfoSchema
      .pick({ fullName: true, phone: true, email: true })
      .safeParse({ fullName: draft.fullName, phone: draft.phone, email: draft.email });
    if (!result.success) {
      for (const issue of result.error.issues) errors[String(issue.path[0])] = issue.message;
    }
  }

  if (step === 2) {
    if (!draft.participantType) errors.participantType = 'กรุณาเลือกประเภทผู้สมัคร';
    if (!draft.distance) errors.distance = 'กรุณาเลือกระยะการวิ่ง';
  }

  if (step === 3) {
    const result = shirtSizeSchema.safeParse({ shirtSize: draft.shirtSize });
    if (!result.success) errors.shirtSize = 'กรุณาเลือกขนาดเสื้อ';
  }

  if (step === 4) {
    for (const key of QUESTION_KEYS) {
      if (draft.parq[key] === null) errors[key] = 'กรุณาตอบคำถามข้อนี้';
    }
    const hasHealthFlag = QUESTION_KEYS.some((k) => draft.parq[k] === true);
    if (hasHealthFlag && !draft.parqAcknowledged) {
      errors.parqAcknowledged = 'กรุณายืนยันว่ารับทราบคำแนะนำ';
    }
    if (!draft.healthConsent) errors.healthConsent = 'กรุณาเลือกตัวเลือกความยินยอม';
    else if (draft.healthConsent === 'NO_CONSENT') {
      errors.healthConsent = 'จำเป็นต้องยินยอมให้เก็บข้อมูลสุขภาพเพื่อความปลอดภัยในการเข้าร่วมกิจกรรม';
    }
    if (!draft.marketingConsent) errors.marketingConsent = 'กรุณาเลือกตัวเลือกความยินยอม';
    if (!draft.communicationConsent) errors.communicationConsent = 'กรุณาเลือกตัวเลือกความยินยอม';
    if (!draft.declarationAccepted) errors.declarationAccepted = 'กรุณายืนยันคำรับรองก่อนดำเนินการต่อ';
  }

  return errors;
}

function buildFormData(draft: RegistrationDraft): FormData {
  const fd = new FormData();
  fd.set('fullName', draft.fullName);
  fd.set('phone', draft.phone);
  fd.set('email', draft.email);
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
  consentText,
  submitFn = submitRegistrationAction,
  successHrefBase = '/status',
}: {
  quotas: QuotaOverviewItem[];
  pricing: PricingInfo;
  payment: PaymentInfo;
  consentText: ConsentTextInfo;
  submitFn?: (formData: FormData) => Promise<WizardSubmitResult>;
  successHrefBase?: string;
}) {
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
    const stepErrors = validateStep(step, draft);
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
      const res = await submitFn(buildFormData(draft));
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
        {step === 2 && <StepRace draft={draft} update={update} errors={errors} quotas={quotas} pricing={pricing} />}
        {step === 3 && <StepShirt draft={draft} update={update} errors={errors} />}
        {step === 4 && (
          <StepHealthConsent draft={draft} update={update} errors={errors} consentText={consentText} />
        )}
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
              ย้อนกลับ
            </Button>
          )}
          {step < 6 ? (
            <Button size="lg" fullWidth onClick={goNext}>
              ถัดไป
            </Button>
          ) : (
            <Button size="lg" fullWidth onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสมัคร / Submit'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
