import { db } from '@/lib/db';
import { writeAuditLog } from '@/lib/audit';
import { adjustQuotaForStatusChange } from '@/lib/quota';
import { newQrToken, qrCodeDataUrl } from '@/lib/qr';
import { sendEmail } from '@/lib/email/send';
import {
  paymentIssueEmail,
  paymentReminderEmail,
  registrationApprovedEmail,
} from '@/lib/email/templates';
import { statusUrlFor } from '@/lib/registration';
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

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        participantId,
        amount: participant.registrationFee,
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

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        participantId,
        amount: participant.registrationFee,
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

  const { subject, html } = paymentIssueEmail({
    fullName: participant.fullName,
    registrationId: participant.registrationId,
    reason,
    statusUrl: statusUrlFor(participant.statusToken),
  });
  await sendEmail({ to: participant.email, subject, html, kind: 'PAYMENT_ISSUE', participantId });
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

  const { subject, html } = paymentReminderEmail({
    fullName: participant.fullName,
    registrationId: participant.registrationId,
    fee: participant.registrationFee,
    statusUrl: statusUrlFor(participant.statusToken),
  });
  await sendEmail({ to: participant.email, subject, html, kind: 'PAYMENT_REMINDER', participantId });
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

  const token = newQrToken();
  const previousStatus = participant.registrationStatus;

  await db.$transaction(async (tx) => {
    await adjustQuotaForStatusChange(
      participant.distance as Distance,
      participant.participantType as ParticipantType,
      previousStatus as RegistrationStatus,
      'APPROVED',
      tx
    );
    await tx.participant.update({
      where: { id: participantId },
      data: { registrationStatus: 'APPROVED' },
    });
    await tx.qrCode.create({ data: { participantId, token, status: 'ACTIVE' } });
    await tx.bibCollection.create({ data: { participantId, collected: false } });
    await writeAuditLog(tx, {
      adminId,
      participantId,
      action: 'REGISTRATION_APPROVED',
      previousValue: { registrationStatus: previousStatus },
      newValue: { registrationStatus: 'APPROVED' },
    });
  });

  const qrDataUrl = await qrCodeDataUrl(token);
  const { subject, html } = registrationApprovedEmail({
    fullName: participant.fullName,
    registrationId: participant.registrationId,
    distance: participant.distance as Distance,
    participantType: participant.participantType as ParticipantType,
    shirtSize: participant.shirtSize,
    qrCodeDataUrl: qrDataUrl,
    statusUrl: statusUrlFor(participant.statusToken),
  });
  await sendEmail({ to: participant.email, subject, html, kind: 'APPROVED', participantId });
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

export async function collectBib(token: string, adminId: string) {
  const qr = await db.qrCode.findUnique({ where: { token }, include: { participant: true } });
  if (!qr) throw new WorkflowError('QR Code ไม่ถูกต้อง');
  if (qr.status !== 'ACTIVE') throw new WorkflowError('QR Code นี้ถูกยกเลิกแล้ว');

  const bib = await db.bibCollection.findUnique({ where: { participantId: qr.participantId } });
  if (bib?.collected) {
    return { alreadyCollected: true as const, participant: qr.participant, collectedAt: bib.collectedAt };
  }

  await db.$transaction(async (tx) => {
    await tx.bibCollection.upsert({
      where: { participantId: qr.participantId },
      create: { participantId: qr.participantId, collected: true, collectedAt: new Date(), collectedById: adminId },
      update: { collected: true, collectedAt: new Date(), collectedById: adminId },
    });
    await writeAuditLog(tx, {
      adminId,
      participantId: qr.participantId,
      action: 'BIB_COLLECTED',
    });
  });

  return { alreadyCollected: false as const, participant: qr.participant, collectedAt: new Date() };
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
