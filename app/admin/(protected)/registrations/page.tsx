import Link from 'next/link';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
  DISTANCE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  REGISTRATION_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  RegistrationStatus,
  PaymentStatus,
  Distance,
  ParticipantType,
} from '@/lib/config';
import { formatTHB, formatThaiDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { RegistrationFilters } from '@/components/admin/RegistrationFilters';

export const dynamic = 'force-dynamic';

function statusTone(status: RegistrationStatus) {
  if (status === 'APPROVED') return 'success' as const;
  if (status === 'REJECTED' || status === 'CANCELLED' || status === 'PAYMENT_ISSUE') return 'danger' as const;
  return 'warning' as const;
}

const SORT_FIELDS: Record<string, Prisma.ParticipantOrderByWithRelationInput> = {
  date_desc: { createdAt: 'desc' },
  date_asc: { createdAt: 'asc' },
  name_asc: { fullName: 'asc' },
  name_desc: { fullName: 'desc' },
  distance_asc: { distance: 'asc' },
  status_asc: { registrationStatus: 'asc' },
};

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const q = searchParams.q?.trim();
  const distance = searchParams.distance as Distance | undefined;
  const participantType = searchParams.participantType as ParticipantType | undefined;
  const shirtSize = searchParams.shirtSize;
  const paymentStatus = searchParams.paymentStatus as PaymentStatus | undefined;
  const registrationStatus = searchParams.registrationStatus as RegistrationStatus | undefined;
  const bibStatus = searchParams.bibStatus;
  const sort = searchParams.sort ?? 'date_desc';

  const where: Prisma.ParticipantWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { fullName: { contains: q } },
              { registrationId: { contains: q } },
              { phone: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {},
      distance ? { distance } : {},
      participantType ? { participantType } : {},
      shirtSize ? { shirtSize } : {},
      registrationStatus ? { registrationStatus } : {},
      bibStatus === 'COLLECTED' ? { bib: { collected: true } } : {},
      bibStatus === 'NOT_COLLECTED' ? { OR: [{ bib: null }, { bib: { collected: false } }] } : {},
    ],
  };

  const participants = await db.participant.findMany({
    where,
    orderBy: SORT_FIELDS[sort] ?? SORT_FIELDS.date_desc,
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 }, bib: true },
    take: 300,
  });

  const filtered = paymentStatus
    ? participants.filter((p) => (p.payments[0]?.paymentStatus ?? 'NOT_PAID') === paymentStatus)
    : participants;

  return (
    <div className="p-5 lg:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Registrations</h1>
          <p className="text-sm text-gray-500">{filtered.length} รายการ</p>
        </div>
        <Link
          href="/admin/registrations/new"
          className="h-11 px-4 rounded-xl bg-brand-500 text-white font-semibold flex items-center hover:bg-brand-600"
        >
          + เพิ่มผู้สมัคร
        </Link>
      </div>

      <RegistrationFilters />

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left font-semibold px-3 py-2.5">Registration ID</th>
              <th className="text-left font-semibold px-3 py-2.5">Name</th>
              <th className="text-left font-semibold px-3 py-2.5">Phone</th>
              <th className="text-left font-semibold px-3 py-2.5">Email</th>
              <th className="text-left font-semibold px-3 py-2.5">Type</th>
              <th className="text-left font-semibold px-3 py-2.5">Distance</th>
              <th className="text-left font-semibold px-3 py-2.5">Shirt</th>
              <th className="text-left font-semibold px-3 py-2.5">Amount</th>
              <th className="text-left font-semibold px-3 py-2.5">Payment</th>
              <th className="text-left font-semibold px-3 py-2.5">Status</th>
              <th className="text-left font-semibold px-3 py-2.5">Submitted</th>
              <th className="text-left font-semibold px-3 py-2.5">BIB</th>
              <th className="text-left font-semibold px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-2.5 font-semibold text-ink">{p.registrationId}</td>
                <td className="px-3 py-2.5">{p.fullName}</td>
                <td className="px-3 py-2.5 text-gray-500">{p.phone}</td>
                <td className="px-3 py-2.5 text-gray-500">{p.email}</td>
                <td className="px-3 py-2.5">{PARTICIPANT_TYPE_LABEL[p.participantType as ParticipantType].split(' /')[0]}</td>
                <td className="px-3 py-2.5">{DISTANCE_LABEL[p.distance as Distance]}</td>
                <td className="px-3 py-2.5">{p.shirtSize}</td>
                <td className="px-3 py-2.5">{formatTHB(p.registrationFee)}</td>
                <td className="px-3 py-2.5">
                  <Badge tone="neutral">
                    {PAYMENT_STATUS_LABEL[(p.payments[0]?.paymentStatus ?? 'NOT_PAID') as PaymentStatus]}
                  </Badge>
                </td>
                <td className="px-3 py-2.5">
                  <Badge tone={statusTone(p.registrationStatus as RegistrationStatus)}>
                    {REGISTRATION_STATUS_LABEL[p.registrationStatus as RegistrationStatus]}
                  </Badge>
                </td>
                <td className="px-3 py-2.5 text-gray-500">{formatThaiDateTime(p.createdAt)}</td>
                <td className="px-3 py-2.5">
                  {p.bib?.collected ? <Badge tone="success">Collected</Badge> : <Badge tone="neutral">-</Badge>}
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/admin/registrations/${p.id}`} className="text-brand-600 font-semibold hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={13} className="px-3 py-10 text-center text-gray-400">
                  ไม่พบข้อมูล
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
