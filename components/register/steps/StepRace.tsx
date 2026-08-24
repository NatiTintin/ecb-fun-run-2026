'use client';

import { DISTANCES, DISTANCE_LABEL, PARTICIPANT_TYPES, PARTICIPANT_TYPE_LABEL } from '@/lib/config';
import { formatTHB } from '@/lib/utils';
import { RegistrationDraft, QuotaOverviewItem, PricingInfo, priceFor } from '@/components/register/types';
import { SelectableCard } from '@/components/ui/SelectableCard';
import { Badge } from '@/components/ui/Badge';

export function StepRace({
  draft,
  update,
  errors,
  quotas,
  pricing,
}: {
  draft: RegistrationDraft;
  update: (patch: Partial<RegistrationDraft>) => void;
  errors: Record<string, string>;
  quotas: QuotaOverviewItem[];
  pricing: PricingInfo;
}) {
  const quotaFor = (distance: (typeof DISTANCES)[number], type: (typeof PARTICIPANT_TYPES)[number]) =>
    quotas.find((q) => q.distance === distance && q.participantType === type);

  const selectedQuota =
    draft.distance && draft.participantType ? quotaFor(draft.distance, draft.participantType) : null;
  const fee = draft.distance && draft.participantType ? priceFor(pricing, draft.distance, draft.participantType) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink">เลือกประเภทและระยะการวิ่ง</h2>
        <p className="text-sm text-gray-500">Participant Type &amp; Race Distance</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">
          Participant Type <span className="text-brand-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PARTICIPANT_TYPES.map((type) => (
            <SelectableCard
              key={type}
              selected={draft.participantType === type}
              onClick={() => update({ participantType: type })}
              title={PARTICIPANT_TYPE_LABEL[type]}
            />
          ))}
        </div>
        {errors.participantType && <p className="text-xs font-medium text-red-600 mt-1">{errors.participantType}</p>}
      </div>

      <div>
        <p className="text-sm font-semibold text-ink mb-2">
          Race Distance <span className="text-brand-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DISTANCES.map((distance) => {
            const q = draft.participantType ? quotaFor(distance, draft.participantType) : null;
            const full = q?.status === 'FULL';
            return (
              <SelectableCard
                key={distance}
                disabled={!draft.participantType || full}
                selected={draft.distance === distance}
                onClick={() => update({ distance })}
                title={DISTANCE_LABEL[distance]}
                subtitle={q ? `เหลือ ${q.remaining} สิทธิ์` : draft.participantType ? undefined : 'เลือก Participant Type ก่อน'}
                badge={full ? <Badge tone="danger">FULL / เต็ม</Badge> : q?.status === 'ALMOST_FULL' ? <Badge tone="warning">Almost Full</Badge> : undefined}
              />
            );
          })}
        </div>
        {errors.distance && <p className="text-xs font-medium text-red-600 mt-1">{errors.distance}</p>}
      </div>

      {fee !== null && (
        <div className="rounded-2xl bg-brand-50 border-2 border-brand-200 p-4">
          <p className="text-sm text-gray-600">Registration Fee</p>
          <p className="text-2xl font-extrabold text-brand-600">{formatTHB(fee)}</p>
          {selectedQuota && (
            <p className="text-sm text-gray-600 mt-1">Remaining: {selectedQuota.remaining} spots</p>
          )}
        </div>
      )}
    </div>
  );
}
