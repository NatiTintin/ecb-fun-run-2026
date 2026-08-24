'use server';

import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { collectBib, WorkflowError } from '@/lib/workflow';
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
      registrationId: string;
      fullName: string;
      distanceLabel: string;
      participantTypeLabel: string;
      shirtSize: string;
      registrationStatusLabel: string;
      isApproved: boolean;
      alreadyCollected: boolean;
      collectedAt: string | null;
    }
  | { ok: false; error: string };

export async function lookupQrTokenAction(token: string): Promise<CheckinLookupResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: 'Unauthorized' };

  const qr = await db.qrCode.findUnique({
    where: { token },
    include: { participant: { include: { bib: true } } },
  });
  if (!qr) return { ok: false, error: 'ไม่พบ QR Code นี้ในระบบ' };
  if (qr.status !== 'ACTIVE') return { ok: false, error: 'QR Code นี้ถูกยกเลิกแล้ว' };

  const p = qr.participant;
  return {
    ok: true,
    registrationId: p.registrationId,
    fullName: p.fullName,
    distanceLabel: DISTANCE_LABEL[p.distance as Distance],
    participantTypeLabel: PARTICIPANT_TYPE_LABEL[p.participantType as ParticipantType],
    shirtSize: p.shirtSize,
    registrationStatusLabel: REGISTRATION_STATUS_LABEL[p.registrationStatus as RegistrationStatus],
    isApproved: p.registrationStatus === 'APPROVED',
    alreadyCollected: !!p.bib?.collected,
    collectedAt: p.bib?.collectedAt ? p.bib.collectedAt.toISOString() : null,
  };
}

export type ConfirmBibResult =
  | { ok: true; alreadyCollected: boolean; collectedAt: string }
  | { ok: false; error: string };

export async function confirmBibCollectionAction(token: string): Promise<ConfirmBibResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: 'Unauthorized' };

  try {
    const result = await collectBib(token, session.adminId);
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
