import { db } from '@/lib/db';
import { DISTANCES, PARTICIPANT_TYPES, SHIRT_SIZES, DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL, Distance, ParticipantType } from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { Card } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

function ExportLink({ type }: { type: string }) {
  return (
    <a
      href={`/api/admin/reports/export?type=${type}`}
      className="inline-flex items-center h-9 px-3 rounded-lg bg-ink text-white text-xs font-semibold hover:bg-gray-700"
    >
      Export CSV / Excel
    </a>
  );
}

export default async function ReportsPage() {
  const activeParticipants = await db.participant.findMany({
    where: { registrationStatus: { notIn: ['REJECTED', 'CANCELLED'] } },
    include: { payments: { orderBy: { createdAt: 'desc' }, take: 1 }, bib: true },
  });

  const registrationCounts = new Map<string, number>();
  const shirtCounts = new Map<string, number>();
  for (const p of activeParticipants) {
    const rKey = `${p.distance}|${p.participantType}`;
    registrationCounts.set(rKey, (registrationCounts.get(rKey) ?? 0) + 1);
    shirtCounts.set(p.shirtSize, (shirtCounts.get(p.shirtSize) ?? 0) + 1);
  }

  const totalExpected = activeParticipants.reduce((s, p) => s + p.registrationFee, 0);
  let verified = 0;
  let pending = 0;
  let issue = 0;
  for (const p of activeParticipants) {
    const status = p.payments[0]?.paymentStatus ?? 'NOT_PAID';
    if (status === 'VERIFIED') verified += p.registrationFee;
    else if (status === 'PAYMENT_ISSUE') issue += p.registrationFee;
    else pending += p.registrationFee;
  }

  const approvedCount = await db.participant.count({ where: { registrationStatus: 'APPROVED' } });
  const collectedCount = await db.bibCollection.count({ where: { collected: true } });

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-4xl">
      <h1 className="text-2xl font-extrabold text-ink">Reports</h1>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">Registration Report</h2>
          <ExportLink type="registrations" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DISTANCES.flatMap((d) =>
            PARTICIPANT_TYPES.map((t) => (
              <div key={`${d}-${t}`} className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-xs text-gray-500">
                  {DISTANCE_LABEL[d]} {PARTICIPANT_TYPE_LABEL[t].split(' /')[0]}
                </p>
                <p className="text-2xl font-extrabold text-ink">{registrationCounts.get(`${d}|${t}`) ?? 0}</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">Shirt Report</h2>
          <ExportLink type="shirts" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SHIRT_SIZES.map((size) => (
            <div key={size} className="rounded-xl bg-gray-50 p-2 text-center">
              <p className="text-xs text-gray-500">{size}</p>
              <p className="text-lg font-extrabold text-ink">{shirtCounts.get(size) ?? 0}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">Payment Report</h2>
          <ExportLink type="payments" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3">
            <p className="text-xs text-gray-500">Total Expected</p>
            <p className="text-xl font-extrabold text-ink">{formatTHB(totalExpected)}</p>
          </div>
          <div className="rounded-xl bg-teal-50 p-3">
            <p className="text-xs text-gray-500">Verified</p>
            <p className="text-xl font-extrabold text-teal-600">{formatTHB(verified)}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-extrabold text-amber-600">{formatTHB(pending)}</p>
          </div>
          <div className="rounded-xl bg-red-50 p-3">
            <p className="text-xs text-gray-500">Payment Issue</p>
            <p className="text-xl font-extrabold text-red-600">{formatTHB(issue)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-ink">BIB Collection Report</h2>
          <ExportLink type="bib" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-xs text-gray-500">Confirmed</p>
            <p className="text-xl font-extrabold text-ink">{approvedCount}</p>
          </div>
          <div className="rounded-xl bg-teal-50 p-3 text-center">
            <p className="text-xs text-gray-500">Collected</p>
            <p className="text-xl font-extrabold text-teal-600">{collectedCount}</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-xs text-gray-500">Not Collected</p>
            <p className="text-xl font-extrabold text-amber-600">{approvedCount - collectedCount}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
