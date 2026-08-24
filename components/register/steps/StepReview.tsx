'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL, Distance, ParticipantType } from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { RegistrationDraft, PricingInfo, priceFor } from '@/components/register/types';
import { Card } from '@/components/ui/Card';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-ink text-right">{value}</span>
    </div>
  );
}

export function StepReview({ draft, pricing }: { draft: RegistrationDraft; pricing: PricingInfo }) {
  const { dict } = useLanguage();
  const t = dict.register.review;

  const fee =
    draft.distance && draft.participantType
      ? priceFor(pricing, draft.distance as Distance, draft.participantType as ParticipantType)
      : 0;
  const hasHealthFlag = Object.values(draft.parq).some((v) => v === true);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-ink">{t.heading}</h2>
        <p className="text-sm text-gray-500">{t.subheading}</p>
      </div>

      <Card>
        <h3 className="font-bold text-ink mb-1">{t.participantSection}</h3>
        <Row label={t.fullName} value={draft.fullName} />
        <Row label={t.phone} value={draft.phone} />
        <Row label={t.email} value={draft.email} />
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-1">{t.raceSection}</h3>
        <Row label={t.type} value={draft.participantType ? PARTICIPANT_TYPE_LABEL[draft.participantType] : '-'} />
        <Row label={t.distance} value={draft.distance ? DISTANCE_LABEL[draft.distance] : '-'} />
        <Row label={t.shirtSize} value={draft.shirtSize ?? '-'} />
        <Row label={t.fee} value={formatTHB(fee)} />
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-1">{t.healthSection}</h3>
        <Row label={t.parq} value={hasHealthFlag ? t.parqFlagged : t.parqClear} />
        <Row label={t.healthConsent} value={draft.healthConsent === 'CONSENT' ? t.consented : t.notConsented} />
        <Row label={t.marketingConsent} value={draft.marketingConsent === 'CONSENT' ? t.consented : t.notConsented} />
        <Row
          label={t.communicationConsent}
          value={draft.communicationConsent === 'CONSENT' ? t.consented : t.notConsented}
        />
        <p className="text-xs text-gray-400 mt-1">{t.parqSensitiveNote}</p>
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-1">{t.paymentSection}</h3>
        <Row
          label={t.slipStatus}
          value={draft.slip ? t.slipAttached.replace('{name}', draft.slip.name) : t.slipNotAttached}
        />
      </Card>
    </div>
  );
}
