import { db } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';
import { adjustQuotaForStatusChange } from '@/lib/quota';
import { nextBibNumber } from '@/lib/bib';
import { Distance, ParticipantType, RegistrationStatus } from '@/lib/config';
import { getEventSettings } from '@/lib/settings';

export class WorkflowError extends Error {}

async function getParticipantOrThrow(participantId: string) {
  const participant = await db.participant.findUnique({ where: { id: participantId } });
  if (!participant) throw new WorkflowError('Registration not found');
  return participant;
}

export async function verifyPayment(participantId: string, adminId: string) {
  const participant = await getParticipantOrThrow(participantId);
  const latestPayment = await db.payment.findFirst({
    where: { participantId },
    orderBy: { createdAt: 'desc' },
  });

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        participantId,
        amount: participant.registrationFee,
        // Carry the slip forward — this is a new status-transition row, not
        // a new upload, so losing slipUrl here would make the slip vanish
        // from the admin UI (which reads only the latest Payment row) the
        // moment a payment is verified.
        slipUrl: latestPayment?.slipUrl,
        uploadedAt: latestPayment?.uploadedAt,
        paymentStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedById: adminId,
      },
    });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'PAYMENT_VERIFIED',
      newValue: { paymentStatus: 'VERIFIED' },
    });
  });
}

export async function flagPaymentIssue(participantId: string, adminId: string, reason: string) {
  const participant = await getParticipantOrThrow(participantId);
  const previousStatus = participant.registrationStatus;
  const latestPayment = await db.payment.findFirst({
    where: { participantId },
    orderBy: { createdAt: 'desc' },
  });

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        participantId,
        amount: participant.registrationFee,
        // Carry the slip forward (see verifyPayment) — staff need to see
        // the slip that's actually causing the issue, not "no proof".
        slipUrl: latestPayment?.slipUrl,
        uploadedAt: latestPayment?.uploadedAt,
        paymentStatus: 'PAYMENT_ISSUE',
        issueReason: reason,
      },
    });
    await tx.participant.update({
      where: { id: participantId },
      data: { registrationStatus: 'PAYMENT_ISSUE' },
    });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'PAYMENT_ISSUE_FLAGGED',
      previousValue: { registrationStatus: previousStatus },
      newValue: { registrationStatus: 'PAYMENT_ISSUE', reason },
      note: reason,
    });
  });
}

export async function sendPaymentReminder(participantId: string, adminId: string) {
  const participant = await getParticipantOrThrow(participantId);
  const previousStatus = participant.registrationStatus;

  if (['SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_ISSUE'].includes(participant.registrationStatus)) {
    await db.$transaction(async (tx) => {
      await tx.participant.update({
        where: { id: participantId },
        data: { registrationStatus: 'PAYMENT_PENDING' },
      });
      await writeAuditLog(tx, {
        adminId,
        participantId,
        action: 'PAYMENT_REMINDER_SENT',
        previousValue: { registrationStatus: previousStatus },
        newValue: { registrationStatus: 'PAYMENT_PENDING' },
      });
    });
  } else {
    await writeAuditLog(db, { adminId, participantId, action: 'PAYMENT_REMINDER_SENT' });
  }
}

export async function approveRegistration(participantId: string, adminId: string) {
  const participant = await getParticipantOrThrow(participantId);
  if (participant.registrationStatus === 'APPROVED') {
    throw new WorkflowError('Registration is already approved');
  }

  const latestPayment = await db.payment.findFirst({
    where: { participantId },
    orderBy: { createdAt: 'desc' },
  });
  if (latestPayment?.paymentStatus !== 'VERIFIED') {
    throw new WorkflowError('กรุณา Verify Payment ก่อน Approve Registration');
  }

  const previousStatus = participant.registrationStatus;

  await db.$transaction(async (tx) => {
    await adjustQuotaForStatusChange(
      participant.distance as Distance,
      participant.participantType as ParticipantType,
      previousStatus as RegistrationStatus,
      'APPROVED',
      tx
    );
    const bibNumber = await nextBibNumber(participant.distance as Distance, tx);
    await tx.participant.update({
      where: { id: participantId },
      data: { registrationStatus: 'APPROVED', bibNumber },
    });
    await tx.bibCollection.create({ data: { participantId, collected: false } });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'REGISTRATION_APPROVED',
      previousValue: { registrationStatus: previousStatus },
      newValue: { registrationStatus: 'APPROVED', bibNumber },
    });
  });
}

export async function rejectRegistration(participantId: string, adminId: string, reason: string) {
  const participant = await getParticipantOrThrow(participantId);
  const previousStatus = participant.registrationStatus;

  await db.$transaction(async (tx) => {
    await adjustQuotaForStatusChange(
      participant.distance as Distance,
      participant.participantType as ParticipantType,
      previousStatus as RegistrationStatus,
      'REJECTED',
      tx
    );
    await tx.participant.update({
      where: { id: participantId },
      data: { registrationStatus: 'REJECTED' },
    });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'REGISTRATION_REJECTED',
      previousValue: { registrationStatus: previousStatus },
      newValue: { registrationStatus: 'REJECTED' },
      note: reason,
    });
  });
}

export async function cancelRegistration(participantId: string, adminId: string, reason: string) {
  const participant = await getParticipantOrThrow(participantId);
  const previousStatus = participant.registrationStatus;

  await db.$transaction(async (tx) => {
    await adjustQuotaForStatusChange(
      participant.distance as Distance,
      participant.participantType as ParticipantType,
      previousStatus as RegistrationStatus,
      'CANCELLED',
      tx
    );
    await tx.participant.update({
      where: { id: participantId },
      data: { registrationStatus: 'CANCELLED' },
    });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'REGISTRATION_CANCELLED',
      previousValue: { registrationStatus: previousStatus },
      newValue: { registrationStatus: 'CANCELLED' },
      note: reason,
    });
  });
}

export async function collectBib(participantId: string, adminId: string, signatureData: string) {
  const participant = await getParticipantOrThrow(participantId);
  if (participant.registrationStatus !== 'APPROVED') {
    throw new WorkflowError('การสมัครนี้ยังไม่ได้รับการอนุมัติ ไม่สามารถรับ BIB ได้');
  }
  if (!signatureData) {
    throw new WorkflowError('กรุณาให้ผู้รับ BIB เซ็นชื่อก่อนยืนยัน');
  }

  const bib = await db.bibCollection.findUnique({ where: { participantId } });
  if (bib?.collected) {
    return { alreadyCollected: true as const, participant, collectedAt: bib.collectedAt };
  }

  await db.$transaction(async (tx) => {
    await tx.bibCollection.upsert({
      where: { participantId },
      create: { participantId, collected: true, collectedAt: new Date(), collectedById: adminId, signatureData },
      update: { collected: true, collectedAt: new Date(), collectedById: adminId, signatureData },
    });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'BIB_COLLECTED',
    });
  });

  return { alreadyCollected: false as const, participant, collectedAt: new Date() };
}

/**
 * Lazily releases quota holds for registrations that never got a payment
 * slip within the admin-configured reservation window. Called on
 * dashboard/landing-page reads rather than a real cron job — fine for a
 * single-instance deployment; wire up a scheduled job in production.
 */
export async function sweepExpiredReservations() {
  const settings = await getEventSettings();
  const cutoff = new Date(Date.now() - settings.reservationExpiryMinutes * 60 * 1000);

  const expired = await db.participant.findMany({
    where: {
      registrationStatus: { in: ['SUBMITTED', 'PAYMENT_PENDING'] },
      reservedAt: { lt: cutoff },
    },
  });

  for (const participant of expired) {
    await db.$transaction(async (tx) => {
      await adjustQuotaForStatusChange(
        participant.distance as Distance,
        participant.participantType as ParticipantType,
        participant.registrationStatus as RegistrationStatus,
        'CANCELLED',
        tx
      );
      await tx.participant.update({
        where: { id: participant.id },
        data: { registrationStatus: 'CANCELLED' },
      });
      await writeAuditLog(tx, {
        participantId: participant.id,
        action: 'REGISTRATION_AUTO_CANCELLED',
        previousValue: { registrationStatus: participant.registrationStatus },
        newValue: { registrationStatus: 'CANCELLED' },
        note: 'Auto-cancelled: payment reservation expired',
      });
    });
  }

  return expired.length;
}
