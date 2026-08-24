import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { qrCodeDataUrl } from '@/lib/qr';
import { Distance, ParticipantType, RegistrationStatus, PaymentStatus } from '@/lib/config';
import { StatusContent } from '@/components/register/StatusContent';

export const dynamic = 'force-dynamic';

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
    <StatusContent
      token={params.token}
      registrationId={participant.registrationId}
      fullName={participant.fullName}
      distance={participant.distance as Distance}
      participantType={participant.participantType as ParticipantType}
      shirtSize={participant.shirtSize}
      registrationFee={participant.registrationFee}
      registrationStatus={participant.registrationStatus as RegistrationStatus}
      paymentStatus={(latestPayment?.paymentStatus ?? 'NOT_PAID') as PaymentStatus}
      canUploadSlip={canUploadSlip}
      qrDataUrl={qrDataUrl}
    />
  );
}
