'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { updateSettingsAction, SettingsFormResult } from '@/lib/actions/adminSettings';
import { inputBaseClass } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { toBangkokInputValue } from '@/lib/utils';
import type { EventSettings } from '@prisma/client';

type QuotaOverviewItem = { distance: string; participantType: string; capacity: number };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="space-y-3">
      <h2 className="font-bold text-ink">{title}</h2>
      {children}
    </Card>
  );
}

function TextField({ label, name, defaultValue, type = 'text' }: { label: string; name: string; defaultValue?: string | number; type?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={inputBaseClass()} />
    </label>
  );
}

function TextAreaField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <textarea name={name} defaultValue={defaultValue} rows={3} className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:outline-none focus:border-brand-400" />
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
    </Button>
  );
}

const initialState: SettingsFormResult = { ok: false };

export function SettingsForm({ settings, quotas }: { settings: EventSettings; quotas: QuotaOverviewItem[] }) {
  const [state, formAction] = useFormState(updateSettingsAction, initialState);

  const quotaCapacity = (distance: string, participantType: string) =>
    quotas.find((q) => q.distance === distance && q.participantType === participantType)?.capacity ?? 0;

  return (
    <form action={formAction} className="space-y-5">
      <Section title="Event">
        <TextField label="Event Name" name="eventName" defaultValue={settings.eventName} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField label="Event Date" name="eventDate" type="datetime-local" defaultValue={toBangkokInputValue(settings.eventDate)} />
          <TextField
            label="Registration Open"
            name="registrationOpenAt"
            type="datetime-local"
            defaultValue={toBangkokInputValue(settings.registrationOpenAt)}
          />
          <TextField
            label="Registration Close"
            name="registrationCloseAt"
            type="datetime-local"
            defaultValue={toBangkokInputValue(settings.registrationCloseAt)}
          />
        </div>
        <TextField label="Reservation Expiry (minutes)" name="reservationExpiryMinutes" type="number" defaultValue={settings.reservationExpiryMinutes} />
        <TextAreaField label="Child Eligibility Note (informational only, not enforced)" name="childCriteriaNote" defaultValue={settings.childCriteriaNote} />
      </Section>

      <Section title="Pricing (THB)">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="5KM Adult" name="price5kmAdult" type="number" defaultValue={settings.price5kmAdult} />
          <TextField label="5KM Child" name="price5kmChild" type="number" defaultValue={settings.price5kmChild} />
          <TextField label="3KM Adult" name="price3kmAdult" type="number" defaultValue={settings.price3kmAdult} />
          <TextField label="3KM Child" name="price3kmChild" type="number" defaultValue={settings.price3kmChild} />
        </div>
      </Section>

      <Section title="Quota">
        <div className="grid grid-cols-2 gap-3">
          <TextField label="5KM Adult" name="quota5kmAdult" type="number" defaultValue={quotaCapacity('KM5', 'ADULT')} />
          <TextField label="5KM Child" name="quota5kmChild" type="number" defaultValue={quotaCapacity('KM5', 'CHILD')} />
          <TextField label="3KM Adult" name="quota3kmAdult" type="number" defaultValue={quotaCapacity('KM3', 'ADULT')} />
          <TextField label="3KM Child" name="quota3kmChild" type="number" defaultValue={quotaCapacity('KM3', 'CHILD')} />
        </div>
      </Section>

      <Section title="Payment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Bank Name" name="bankName" defaultValue={settings.bankName} />
          <TextField label="Account Name" name="bankAccountName" defaultValue={settings.bankAccountName} />
          <TextField label="Account Number" name="bankAccountNumber" defaultValue={settings.bankAccountNumber} />
          <TextField label="PromptPay Number" name="promptPayNumber" defaultValue={settings.promptPayNumber} />
        </div>
        <TextField label="PromptPay QR Image URL" name="promptPayQrImageUrl" defaultValue={settings.promptPayQrImageUrl} />
        <TextAreaField label="Payment Instructions" name="paymentInstructions" defaultValue={settings.paymentInstructions} />
      </Section>

      <Section title="Contact">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TextField label="Organizer Email" name="organizerEmail" defaultValue={settings.organizerEmail} />
          <TextField label="Organizer Phone" name="organizerPhone" defaultValue={settings.organizerPhone} />
          <TextField label="LINE / Contact Channel" name="lineContact" defaultValue={settings.lineContact} />
        </div>
      </Section>

      <Section title="Email">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <TextField label="Sender Name" name="emailSenderName" defaultValue={settings.emailSenderName} />
          <TextField label="Reply-to Email" name="emailReplyTo" defaultValue={settings.emailReplyTo} />
        </div>
      </Section>

      <Section title="Consent">
        <TextField label="Consent Policy Version" name="consentPolicyVersion" defaultValue={settings.consentPolicyVersion} />
        <p className="text-xs text-gray-500">
          The consent wording shown to participants is fixed, bilingual legal copy (see
          lib/i18n/dictionaries.ts) so it stays consistent in both languages — only the policy
          version number is editable here, for audit-trail purposes.
        </p>
      </Section>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      {state?.ok && <p className="text-sm font-medium text-teal-600">บันทึกเรียบร้อยแล้ว</p>}
      <SubmitButton />
    </form>
  );
}
