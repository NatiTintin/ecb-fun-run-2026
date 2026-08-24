import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { qrCodeDataUrl } from '@/lib/qr';
import {
  DISTANCE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  REGISTRATION_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  Distance,
  ParticipantType,
  RegistrationStatus,
  PaymentStatus,
} from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SlipUploadForm } from '@/components/register/SlipUploadForm';
import { SaveQrButton } from '@/components/register/SaveQrButton';

export const dynamic = 'force-dynamic';

function statusTone(status: RegistrationStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'CANCELLED' || status === 'PAYMENT_ISSUE') return 'danger' as const;
  return 'warning' as const;
}

export default async function StatusPage({ params }: { params: { token: string } }) {
  const participant = await db.participant.findUnique({
    where: { statusToken: params.token },
    include: { qrCode: true, payments: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });

  if (!participant) notFound();

  const latestPayment = participant.payments[0];
  const canUploadSlip = ['SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_REVIEW', 'PAYMENT_ISSUE'].includes(
    participant.registrationStatus
  );

  let qrDataUrl: string | null = null;
  if (participant.registrationStatus === 'APPROVED' && participant.qrCode) {
    qrDataUrl = await qrCodeDataUrl(participant.qrCode.token);
  }

  return (
    <main className="min-h-screen px-5 py-10">
      <div className="max-w-lg mx-auto space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-ink">สถานะการสมัคร</h1>
          <p className="text-sm text-gray-500">Registration Status</p>
        </div>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Registration ID</p>
            <p className="font-bold text-ink">{participant.registrationId}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">ชื่อ</p>
            <p className="font-semibold text-ink">{participant.fullName}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">รายการ</p>
            <p className="font-semibold text-ink">
              {DISTANCE_LABEL[participant.distance as Distance]} ·{' '}
              {PARTICIPANT_TYPE_LABEL[participant.participantType as ParticipantType]}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">ขนาดเสื้อ</p>
            <p className="font-semibold text-ink">{participant.shirtSize}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">ค่าสมัคร</p>
            <p className="font-semibold text-ink">{formatTHB(participant.registrationFee)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">สถานะการชำระเงิน</p>
            <Badge tone={latestPayment?.paymentStatus === 'VERIFIED' ? 'success' : 'neutral'}>
              {PAYMENT_STATUS_LABEL[(latestPayment?.paymentStatus ?? 'NOT_PAID') as PaymentStatus]}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">สถานะการสมัคร</p>
            <Badge tone={statusTone(participant.registrationStatus as RegistrationStatus)}>
              {REGISTRATION_STATUS_LABEL[participant.registrationStatus as RegistrationStatus]}
            </Badge>
          </div>
        </Card>

        {canUploadSlip && (
          <Card>
            <h2 className="font-bold text-ink mb-3">Upload Payment Slip</h2>
            <SlipUploadForm token={params.token} />
          </Card>
        )}

        {qrDataUrl && (
          <Card className="text-center space-y-3">
            <h2 className="font-bold text-ink">QR Code สำหรับรับ BIB</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 mx-auto rounded-xl border border-gray-200" />
            <p className="text-sm text-gray-500">กรุณาแสดง QR Code นี้ในวันรับ BIB</p>
            <SaveQrButton dataUrl={qrDataUrl} filename={`${participant.registrationId}-qr.png`} />
          </Card>
        )}
      </div>
    </main>
  );
}
