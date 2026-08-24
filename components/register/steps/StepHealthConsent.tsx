'use client';

import { PARQ_QUESTIONS } from '@/lib/config';
import { RegistrationDraft, ConsentTextInfo } from '@/components/register/types';
import { YesNoToggle } from '@/components/ui/YesNoToggle';

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

function ConsentBlock({
  title,
  text,
  value,
  onChange,
  error,
  required,
}: {
  title: string;
  text: string;
  value: 'CONSENT' | 'NO_CONSENT' | null;
  onChange: (v: 'CONSENT' | 'NO_CONSENT') => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
      <p className="font-bold text-ink">
        {title}
        {required && <span className="text-brand-500"> *</span>}
      </p>
      <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange('CONSENT')}
          className={`flex-1 h-11 rounded-xl border-2 font-semibold text-sm ${
            value === 'CONSENT' ? 'bg-teal-500 border-teal-500 text-white' : 'bg-white border-gray-200 text-ink'
          }`}
        >
          I Consent / ยินยอม
        </button>
        <button
          type="button"
          onClick={() => onChange('NO_CONSENT')}
          className={`flex-1 h-11 rounded-xl border-2 font-semibold text-sm ${
            value === 'NO_CONSENT' ? 'bg-gray-500 border-gray-500 text-white' : 'bg-white border-gray-200 text-ink'
          }`}
        >
          I Do Not Consent / ไม่ยินยอม
        </button>
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export function StepHealthConsent({
  draft,
  update,
  errors,
  consentText,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
  consentText: ConsentTextInfo;
}) {
  const hasHealthFlag = QUESTION_KEYS.some((k) => draft.parq[k] === true);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-ink">แบบสอบถามความพร้อมในการออกกำลังกาย</h2>
        <p className="text-sm text-gray-500">
          Physical Activity Readiness Questionnaire (PAR-Q)
        </p>
      </div>

      <div className="space-y-4">
        {PARQ_QUESTIONS.map((question, i) => {
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
              />
              {errors[key] && <p className="text-xs font-medium text-red-600">{errors[key]}</p>}
            </div>
          );
        })}
      </div>

      {hasHealthFlag && (
        <div className="rounded-2xl bg-red-50 border-2 border-red-300 p-4 space-y-3">
          <p className="font-bold text-red-700">
            จากข้อมูลที่ท่านให้ไว้ กรุณาปรึกษาแพทย์ก่อนเข้าร่วมกิจกรรมหรือออกกำลังกาย
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 accent-red-600 flex-shrink-0"
              checked={draft.parqAcknowledged}
              onChange={(e) => update({ parqAcknowledged: e.target.checked })}
            />
            <span className="text-sm text-red-800">
              ข้าพเจ้ารับทราบคำแนะนำดังกล่าว และยืนยันว่าข้อมูลสุขภาพที่ให้ไว้เป็นข้อมูลที่ถูกต้อง
            </span>
          </label>
          {errors.parqAcknowledged && (
            <p className="text-xs font-medium text-red-600">{errors.parqAcknowledged}</p>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 pt-6 space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink">ความยินยอมด้านข้อมูลส่วนบุคคล (PDPA)</h2>
          <p className="text-sm text-gray-500">PDPA Consent — ผู้สมัครสามารถถอนความยินยอมได้ตามช่องทางที่ผู้จัดงานกำหนด</p>
        </div>

        <ConsentBlock
          title="A. Health Information Consent"
          text={consentText.health}
          value={draft.healthConsent}
          onChange={(v) => update({ healthConsent: v })}
          error={errors.healthConsent}
          required
        />
        <ConsentBlock
          title="B. Marketing & Media Consent"
          text={consentText.marketing}
          value={draft.marketingConsent}
          onChange={(v) => update({ marketingConsent: v })}
          error={errors.marketingConsent}
        />
        <ConsentBlock
          title="C. Communication Consent"
          text={consentText.communication}
          value={draft.communicationConsent}
          onChange={(v) => update({ communicationConsent: v })}
          error={errors.communicationConsent}
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
          <span className="text-sm text-ink font-medium">
            ข้าพเจ้ารับรองว่าข้อมูลที่ให้ไว้เป็นความจริง และหากตอบ &ldquo;ใช่&rdquo; ในคำถาม PAR-Q ข้อใดข้อหนึ่ง
            ข้าพเจ้ารับทราบว่าควรปรึกษาแพทย์ก่อนเข้าร่วมกิจกรรม รวมถึงจะแจ้งผู้จัดงานหากสถานะสุขภาพมีการเปลี่ยนแปลง
          </span>
        </label>
        {errors.declarationAccepted && (
          <p className="text-xs font-medium text-red-600 mt-2">{errors.declarationAccepted}</p>
        )}
      </div>
    </div>
  );
}
