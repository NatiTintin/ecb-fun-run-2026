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
} from '@/lib/config';

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
    include: { bib: true },
    orderBy: { createdAt: 'desc' },
  });
  if (!participant) return { ok: false, error: 'ไม่พบข้อมูลผู้สมัครที่ตรงกับเลขนี้' };

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
  };
}

export type ConfirmBibResult =
  | { ok: true; alreadyCollected: boolean; collectedAt: string }
  | { ok: false; error: string };

export async function confirmBibCollectionAction(participantId: string): Promise<ConfirmBibResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: 'Unauthorized' };

  try {
    const result = await collectBib(participantId, session.adminId);
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
