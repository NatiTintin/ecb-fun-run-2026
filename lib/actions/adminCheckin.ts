'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { collectBib, WorkflowError } from '@/lib/workflow';
import { normalizeIdNumber } from '@/lib/validation';
import {
  Distance,
  ParticipantType,
  RegistrationStatus,
  DISTANCE_LABEL,
  PARTICIPANT_TYPE_LABEL,
  REGISTRATION_STATUS_LABEL,
  MAX_SIGNATURE_SIZE_BYTES,
} from '@/lib/config';

// Short staff-facing Thai labels for the PAR-Q items — not the full question
// text participants saw at registration (see lib/i18n/dictionaries.ts), just
// enough for BIB staff to know what to ask about.
const PARQ_FLAG_LABEL: Record<'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7', string> = {
  q1: 'โรคหัวใจ (แพทย์วินิจฉัย)',
  q2: 'เจ็บหน้าอกขณะออกกำลังกาย',
  q3: 'เจ็บหน้าอกขณะพัก (เดือนที่ผ่านมา)',
  q4: 'เวียนศีรษะ/เคยหมดสติ',
  q5: 'ปัญหากระดูก/ข้อ',
  q6: 'ทานยาความดัน/หัวใจ',
  q7: 'เหตุผลสุขภาพอื่น',
};

export type CheckinLookupResult =
  | {
      ok: true;
      participantId: string;
      registrationId: string;
      fullName: string;
      distanceLabel: string;
      participantTypeLabel: string;
      shirtSize: string;
      registrationStatusLabel: string;
      isApproved: boolean;
      bibNumber: number | null;
      alreadyCollected: boolean;
      collectedAt: string | null;
      hasHealthFlag: boolean;
      healthFlagItems: string[];
    }
  | { ok: false; error: string };

export async function lookupByIdNumberAction(idNumber: string): Promise<CheckinLookupResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: 'Unauthorized' };

  const normalized = normalizeIdNumber(idNumber);
  if (!normalized) return { ok: false, error: 'กรุณากรอกเลขบัตรประชาชนหรือพาสปอร์ต' };

  // Most recent non-rejected/cancelled registration for this ID — handles a
  // re-registration after an earlier rejection legitimately reusing the ID.
  const participant = await db.participant.findFirst({
    where: { idNumber: normalized, registrationStatus: { notIn: ['REJECTED', 'CANCELLED'] } },
    include: { bib: true, parq: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!participant) return { ok: false, error: 'ไม่พบข้อมูลผู้สมัครที่ตรงกับเลขนี้' };

  const healthFlagItems = participant.parq
    ? (Object.keys(PARQ_FLAG_LABEL) as Array<keyof typeof PARQ_FLAG_LABEL>)
        .filter((q) => participant.parq![q])
        .map((q) => PARQ_FLAG_LABEL[q])
    : [];

  return {
    ok: true,
    participantId: participant.id,
    registrationId: participant.registrationId,
    fullName: participant.fullName,
    distanceLabel: DISTANCE_LABEL[participant.distance as Distance],
    participantTypeLabel: PARTICIPANT_TYPE_LABEL[participant.participantType as ParticipantType],
    shirtSize: participant.shirtSize,
    registrationStatusLabel: REGISTRATION_STATUS_LABEL[participant.registrationStatus as RegistrationStatus],
    isApproved: participant.registrationStatus === 'APPROVED',
    bibNumber: participant.bibNumber,
    alreadyCollected: !!participant.bib?.collected,
    collectedAt: participant.bib?.collectedAt ? participant.bib.collectedAt.toISOString() : null,
    hasHealthFlag: participant.parq?.hasHealthFlag ?? false,
    healthFlagItems,
  };
}

export type ConfirmBibResult =
  | { ok: true; alreadyCollected: boolean; collectedAt: string }
  | { ok: false; error: string };

export async function confirmBibCollectionAction(
  participantId: string,
  signatureData: string
): Promise<ConfirmBibResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: 'Unauthorized' };

  if (!signatureData.startsWith('data:image/png;base64,')) {
    return { ok: false, error: 'กรุณาให้ผู้รับ BIB เซ็นชื่อก่อนยืนยัน' };
  }
  if (signatureData.length > MAX_SIGNATURE_SIZE_BYTES) {
    return { ok: false, error: 'ลายเซ็นมีขนาดใหญ่เกินไป กรุณาลองใหม่' };
  }

  try {
    const result = await collectBib(participantId, session.adminId, signatureData);
    return {
      ok: true,
      alreadyCollected: result.alreadyCollected,
      collectedAt: (result.collectedAt ?? new Date()).toISOString(),
    };
  } catch (err) {
    if (err instanceof WorkflowError) return { ok: false, error: err.message };
    console.error('confirmBibCollectionAction failed', err);
    return { ok: false, error: 'เกิดข้อผิดพลาด' };
  }
}
