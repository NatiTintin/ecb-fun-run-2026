import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { signedSlipUrl } from '@/lib/storage';
import {
  DISTANCE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  REGISTRATION_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PARQ_QUESTIONS,
  Distance,
  ParticipantType,
  RegistrationStatus,
  PaymentStatus,
} from '@/lib/config';
import { formatTHB, formatThaiDateTime } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RegistrationDetailActions } from '@/components/admin/RegistrationDetailActions';

export const dynamic = 'force-dynamic';

function statusTone(status: RegistrationStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'CANCELLED' || status === 'PAYMENT_ISSUE') return 'danger' as const;
  return 'warning' as const;
}

const QUESTION_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;

export default async function RegistrationDetailPage({ params }: { params: { id: string } }) {
  const participant = await db.participant.findUnique({
    where: { id: params.id },
    include: {
      payments: { orderBy: { createdAt: 'desc' } },
      parq: true,
      consents: true,
      qrCode: true,
      bib: true,
      createdByAdmin: true,
      auditLogs: { orderBy: { timestamp: 'desc' }, take: 20, include: { admin: true } },
    },
  });
  if (!participant) notFound();

  const latestPayment = participant.payments[0];
  const canVerify = !!latestPayment?.slipUrl;

  return (
    <div className="p-5 lg:p-8 space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-sm text-gray-500">Registration Detail</p>
          <h1 className="text-2xl font-extrabold text-ink">{participant.registrationId}</h1>
          {participant.createdByAdmin && (
            <Badge tone="info" className="mt-1">
              Created by Admin: {participant.createdByAdmin.name}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Badge tone={statusTone(participant.registrationStatus as RegistrationStatus)}>
            {REGISTRATION_STATUS_LABEL[participant.registrationStatus as RegistrationStatus]}
          </Badge>
          <Badge tone="neutral">
            {PAYMENT_STATUS_LABEL[(latestPayment?.paymentStatus ?? 'NOT_PAID') as PaymentStatus]}
          </Badge>
        </div>
      </div>

      <Card>
        <h2 className="font-bold text-ink mb-3">Participant</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Name</dt>
          <dd className="font-semibold text-ink">{participant.fullName}</dd>
          <dt className="text-gray-500">Phone</dt>
          <dd className="font-semibold text-ink">{participant.phone}</dd>
          <dt className="text-gray-500">Email</dt>
          <dd className="font-semibold text-ink">{participant.email}</dd>
        </dl>
      </Card>

      <Card>
        <h2 className="font-bold text-ink mb-3">Race</h2>
        <dl className="grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Distance</dt>
          <dd className="font-semibold text-ink">{DISTANCE_LABEL[participant.distance as Distance]}</dd>
          <dt className="text-gray-500">Type</dt>
          <dd className="font-semibold text-ink">{PARTICIPANT_TYPE_LABEL[participant.participantType as ParticipantType]}</dd>
          <dt className="text-gray-500">Shirt Size</dt>
          <dd className="font-semibold text-ink">{participant.shirtSize}</dd>
          <dt className="text-gray-500">Fee</dt>
          <dd className="font-semibold text-ink">{formatTHB(participant.registrationFee)}</dd>
        </dl>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">PAR-Q</h2>
          {participant.parq?.hasHealthFlag && <Badge tone="danger">Health Attention Required</Badge>}
        </div>
        <ul className="space-y-2 text-sm">
          {QUESTION_KEYS.map((key, i) => (
            <li key={key} className="flex justify-between gap-3">
              <span className="text-gray-600">{i + 1}. {PARQ_QUESTIONS[i]}</span>
              <span className={`font-bold flex-shrink-0 ${participant.parq?.[key] ? 'text-red-600' : 'text-teal-600'}`}>
                {participant.parq?.[key] ? 'YES' : 'NO'}
              </span>
            </li>
          ))}
        </ul>
        {participant.parq?.hasHealthFlag && (
          <p className="mt-3 text-xs text-gray-500">
            รับทราบคำแนะนำเมื่อ: {participant.parq?.acceptedAt ? formatThaiDateTime(participant.parq.acceptedAt) : '-'}
          </p>
        )}
      </Card>

      <Card>
        <h2 className="font-bold text-ink mb-3">PDPA Consent</h2>
        <ul className="space-y-2 text-sm">
          {participant.consents.map((c) => (
            <li key={c.id} className="flex justify-between">
              <span className="text-gray-600">
                {c.consentType} <span className="text-gray-400">(v{c.policyVersion})</span>
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={c.consentStatus === 'CONSENT' ? 'success' : 'neutral'}>
                  {c.consentStatus === 'CONSENT' ? 'ยินยอม' : 'ไม่ยินยอม'}
                </Badge>
                <span className="text-gray-400 text-xs">{formatThaiDateTime(c.consentedAt)}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-400">
          Participant Declaration: {participant.declarationAccepted ? 'ยืนยันแล้ว' : 'ยังไม่ยืนยัน'}
          {participant.declarationAcceptedAt && ` (${formatThaiDateTime(participant.declarationAcceptedAt)})`}
        </p>
      </Card>

      <Card>
        <h2 className="font-bold text-ink mb-3">Payment</h2>
        {latestPayment?.slipUrl ? (
          <a
            href={signedSlipUrl(latestPayment.slipUrl)}
            target="_blank"
            rel="noreferrer"
            className="inline-block rounded-xl border border-gray-200 p-2 hover:border-brand-300"
          >
            {latestPayment.slipUrl.endsWith('.pdf') ? (
              <div className="w-32 h-32 flex items-center justify-center bg-red-50 text-red-500 font-bold rounded-lg">
                PDF Slip
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={signedSlipUrl(latestPayment.slipUrl)} alt="Payment slip" className="w-32 h-32 object-cover rounded-lg" />
            )}
            <p className="text-xs text-brand-600 font-semibold mt-1 text-center">เปิดดูหลักฐาน</p>
          </a>
        ) : (
          <p className="text-sm text-gray-400">ยังไม่มีหลักฐานการชำระเงิน</p>
        )}
        {latestPayment?.issueReason && (
          <p className="mt-2 text-sm text-red-600">เหตุผลที่มีปัญหา: {latestPayment.issueReason}</p>
        )}
        <div className="mt-4">
          <RegistrationDetailActions
            participantId={participant.id}
            registrationStatus={participant.registrationStatus as RegistrationStatus}
            paymentStatus={(latestPayment?.paymentStatus ?? 'NOT_PAID') as PaymentStatus}
            canVerify={canVerify}
          />
        </div>
      </Card>

      <Card>
        <h2 className="font-bold text-ink mb-3">Activity Log</h2>
        <ul className="space-y-2 text-xs text-gray-500">
          {participant.auditLogs.map((log) => (
            <li key={log.id} className="flex justify-between gap-3 border-b border-gray-50 pb-1.5">
              <span>
                {log.action}
                {log.note && ` — ${log.note}`}
                {log.admin && ` (${log.admin.name})`}
              </span>
              <span className="flex-shrink-0">{formatThaiDateTime(log.timestamp)}</span>
            </li>
          ))}
          {participant.auditLogs.length === 0 && <li>ไม่มีประวัติ</li>}
        </ul>
      </Card>
    </div>
  );
}
