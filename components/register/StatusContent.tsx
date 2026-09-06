'use client';

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import {
  DISTANCE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  REGISTRATION_STATUS_LABEL,
  REGISTRATION_STATUS_LABEL_EN,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_LABEL_EN,
  Distance,
  ParticipantType,
  RegistrationStatus,
  PaymentStatus,
} from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SlipUploadForm } from '@/components/register/SlipUploadForm';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

function statusTone(status: RegistrationStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'CANCELLED' || status === 'PAYMENT_ISSUE') return 'danger' as const;
  return 'warning' as const;
}

export function StatusContent({
  token,
  registrationId,
  fullName,
  distance,
  participantType,
  shirtSize,
  registrationFee,
  registrationStatus,
  paymentStatus,
  canUploadSlip,
  bibNumber,
}: {
  token: string;
  registrationId: string;
  fullName: string;
  distance: Distance;
  participantType: ParticipantType;
  shirtSize: string;
  registrationFee: number;
  registrationStatus: RegistrationStatus;
  paymentStatus: PaymentStatus;
  canUploadSlip: boolean;
  bibNumber: number | null;
}) {
  const { dict, locale } = useLanguage();
  const t = dict.status;

  const registrationStatusLabel =
    (locale === 'en' ? REGISTRATION_STATUS_LABEL_EN : REGISTRATION_STATUS_LABEL)[registrationStatus];
  const paymentStatusLabel = (locale === 'en' ? PAYMENT_STATUS_LABEL_EN : PAYMENT_STATUS_LABEL)[paymentStatus];

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="flex justify-end">
          <LanguageSwitcher tone="light" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">{t.heading}</h1>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.registrationId}</p>
            <p className="font-bold text-ink">{registrationId}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.name}</p>
            <p className="font-semibold text-ink">{fullName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.entry}</p>
            <p className="font-semibold text-ink">
              {DISTANCE_LABEL[distance]} · {PARTICIPANT_TYPE_LABEL[participantType]}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.shirtSize}</p>
            <p className="font-semibold text-ink">{shirtSize}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.fee}</p>
            <p className="font-semibold text-ink">{formatTHB(registrationFee)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.paymentStatus}</p>
            <Badge tone={paymentStatus === 'VERIFIED' ? 'success' : 'neutral'}>{paymentStatusLabel}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{t.registrationStatus}</p>
            <Badge tone={statusTone(registrationStatus)}>{registrationStatusLabel}</Badge>
          </div>
        </Card>

        {canUploadSlip && (
          <Card>
            <h2 className="font-bold text-ink mb-3">{t.uploadSlipHeading}</h2>
            <SlipUploadForm token={token} />
          </Card>
        )}

        {bibNumber != null && (
          <Card className="text-center space-y-2">
            <h2 className="font-bold text-ink">{t.bibHeading}</h2>
            <p className="text-5xl font-extrabold text-brand-600">{bibNumber}</p>
            <p className="text-sm text-gray-500">{t.bibInstruction}</p>
          </Card>
        )}
      </div>
    </main>
  );
}
