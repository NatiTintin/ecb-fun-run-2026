'use client';

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
  const fee =
    draft.distance && draft.participantType
      ? priceFor(pricing, draft.distance as Distance, draft.participantType as ParticipantType)
      : 0;
  const hasHealthFlag = Object.values(draft.parq).some((v) => v === true);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-ink">ตรวจสอบข้อมูลก่อนสมัคร</h2>
        <p className="text-sm text-gray-500">Review your registration</p>
      </div>

      <Card>
        <h3 className="font-bold text-ink mb-1">ข้อมูลผู้สมัคร</h3>
        <Row label="ชื่อ-นามสกุล" value={draft.fullName} />
        <Row label="เบอร์โทรศัพท์" value={draft.phone} />
        <Row label="อีเมล" value={draft.email} />
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-1">รายการแข่งขัน</h3>
        <Row label="ประเภท" value={draft.participantType ? PARTICIPANT_TYPE_LABEL[draft.participantType] : '-'} />
        <Row label="ระยะ" value={draft.distance ? DISTANCE_LABEL[draft.distance] : '-'} />
        <Row label="ขนาดเสื้อ" value={draft.shirtSize ?? '-'} />
        <Row label="ค่าสมัคร" value={formatTHB(fee)} />
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-1">สุขภาพและความยินยอม</h3>
        <Row label="PAR-Q" value={hasHealthFlag ? 'มีข้อควรระวัง (รับทราบแล้ว)' : 'ไม่มีข้อควรระวัง'} />
        <Row label="Health Consent" value={draft.healthConsent === 'CONSENT' ? 'ยินยอม' : 'ไม่ยินยอม'} />
        <Row label="Marketing Consent" value={draft.marketingConsent === 'CONSENT' ? 'ยินยอม' : 'ไม่ยินยอม'} />
        <Row label="Communication Consent" value={draft.communicationConsent === 'CONSENT' ? 'ยินยอม' : 'ไม่ยินยอม'} />
        <p className="text-xs text-gray-400 mt-1">รายละเอียดคำตอบ PAR-Q เป็นข้อมูลสุขภาพที่ละเอียดอ่อน จะไม่แสดงซ้ำในหน้านี้</p>
      </Card>

      <Card>
        <h3 className="font-bold text-ink mb-1">การชำระเงิน</h3>
        <Row label="หลักฐานการโอนเงิน" value={draft.slip ? `แนบแล้ว (${draft.slip.name})` : 'ยังไม่ได้แนบ — แนบภายหลังได้'} />
      </Card>
    </div>
  );
}
