import { db } from '@/lib/db';
import { getQuotaOverview } from '@/lib/quota';
import { sweepExpiredReservations } from '@/lib/workflow';
import { DISTANCE_LABEL, PARTICIPANT_TYPE_LABEL } from '@/lib/config';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { RegistrationOverrideControl } from '@/components/admin/RegistrationOverrideControl';
import { getEventSettings, computeRegistrationWindowState } from '@/lib/settings';

export const dynamic = 'force-dynamic';

function Kpi({ label, value, tone }: { label: string; value: number | string; tone?: 'brand' | 'teal' | 'red' | 'amber' }) {
  const toneClass =
    tone === 'teal'
      ? 'text-teal-600'
      : tone === 'red'
        ? 'text-red-600'
        : tone === 'amber'
          ? 'text-amber-600'
          : 'text-brand-600';
  return (
    <Card>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-extrabold mt-1 ${toneClass}`}>{value}</p>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  await sweepExpiredReservations();
  const settings = await getEventSettings();
  const windowState = computeRegistrationWindowState(settings);
  const quotas = await getQuotaOverview();

  const [total, approved, pendingApproval, paymentPending, paymentIssue, bibCollected] = await Promise.all([
    db.participant.count({
      where: { registrationStatus: { notIn: ['REJECTED', 'CANCELLED'] } },
    }),
    db.participant.count({ where: { registrationStatus: 'APPROVED' } }),
    db.participant.count({ where: { registrationStatus: { in: ['SUBMITTED', 'PAYMENT_REVIEW'] } } }),
    db.participant.count({ where: { registrationStatus: 'PAYMENT_PENDING' } }),
    db.participant.count({ where: { registrationStatus: 'PAYMENT_ISSUE' } }),
    db.bibCollection.count({ where: { collected: true } }),
  ]);

  const totalCapacity = quotas.reduce((s, q) => s + q.capacity, 0);

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
          <p className="text-sm text-gray-500">ภาพรวมการลงทะเบียน ECB Fun Run 2026</p>
        </div>
        <RegistrationOverrideControl current={settings.registrationOverride} computedState={windowState} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Kpi label={`Total Registered / ${totalCapacity}`} value={total} />
        <Kpi label="Approved" value={approved} tone="teal" />
        <Kpi label="Pending Approval" value={pendingApproval} tone="amber" />
        <Kpi label="Payment Pending" value={paymentPending} tone="amber" />
        <Kpi label="Payment Issue" value={paymentIssue} tone="red" />
        <Kpi label="BIB Collected" value={bibCollected} tone="teal" />
      </div>

      <Card>
        <h2 className="font-bold text-ink mb-4">Quota Progress</h2>
        <div className="space-y-4">
          {quotas.map((q) => (
            <div key={`${q.distance}-${q.participantType}`}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-semibold text-ink">
                  {DISTANCE_LABEL[q.distance]} {PARTICIPANT_TYPE_LABEL[q.participantType].split(' /')[0]}
                </span>
                <span className="text-gray-500">
                  {q.occupied} / {q.capacity}
                </span>
              </div>
              <ProgressBar
                value={q.occupied}
                max={q.capacity}
                tone={q.status === 'FULL' ? 'danger' : q.status === 'ALMOST_FULL' ? 'brand' : 'teal'}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
