import { db } from '@/lib/db';
import { getEventSettings, computeRegistrationWindowState, priceFor } from '@/lib/settings';
import { reserveQuotaSlot } from '@/lib/quota';
import { nextRegistrationId } from '@/lib/registrationId';
import { generateSecureToken } from '@/lib/tokens';
import { writeAuditLog } from '@/lib/audit';
import { sendEmail } from '@/lib/email/send';
import { registrationReceivedEmail } from '@/lib/email/templates';
import { savePaymentSlip } from '@/lib/storage';
import { FullRegistrationInput, parseDateOfBirth } from '@/lib/validation';
import { Locale } from '@/lib/i18n/dictionaries';
import { calculateAge, requiredParticipantType, ParticipantType } from '@/lib/config';

export class RegistrationClosedError extends Error {
  constructor(state: string) {
    super(`Registration is not open (state: ${state})`);
    this.name = 'RegistrationClosedError';
  }
}

export class AgeCategoryMismatchError extends Error {
  constructor(public requiredType: ParticipantType) {
    super(`Participant type must be ${requiredType} based on date of birth`);
    this.name = 'AgeCategoryMismatchError';
  }
}

export function statusUrlFor(statusToken: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/status/${statusToken}`;
}

export async function submitRegistration(
  input: FullRegistrationInput,
  opts: { createdByAdminId?: string | null; locale?: Locale } = {}
) {
  const locale: Locale = opts.locale ?? 'en';
  const settings = await getEventSettings();

  if (!opts.createdByAdminId) {
    const state = computeRegistrationWindowState(settings);
    if (state !== 'OPEN') throw new RegistrationClosedError(state);
  }

  const dob = parseDateOfBirth(input.dateOfBirth);
  if (dob) {
    const required = requiredParticipantType(calculateAge(dob), settings.childMaxAgeYears);
    if (required && input.participantType !== required) {
      throw new AgeCategoryMismatchError(required);
    }
  }

  const fee = priceFor(settings, input.distance, input.participantType);
  const hasHealthFlag = [input.q1, input.q2, input.q3, input.q4, input.q5, input.q6, input.q7].some(
    Boolean
  );

  const participant = await db.$transaction(async (tx) => {
    await reserveQuotaSlot(input.distance, input.participantType, tx);
    const registrationId = await nextRegistrationId(input.distance, input.participantType, tx);
    const statusToken = generateSecureToken();

    const created = await tx.participant.create({
      data: {
        registrationId,
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        dateOfBirth: parseDateOfBirth(input.dateOfBirth) ?? new Date(0),
        idType: input.idType,
        idNumber: input.idNumber.trim(),
        participantType: input.participantType,
        distance: input.distance,
        shirtSize: input.shirtSize,
        registrationFee: fee,
        registrationStatus: 'SUBMITTED',
        statusToken,
        createdByAdminId: opts.createdByAdminId ?? null,
        declarationAccepted: input.declarationAccepted,
        declarationAcceptedAt: new Date(),
        preferredLocale: locale,
      },
    });

    await tx.parqResponse.create({
      data: {
        participantId: created.id,
        q1: input.q1,
        q2: input.q2,
        q3: input.q3,
        q4: input.q4,
        q5: input.q5,
        q6: input.q6,
        q7: input.q7,
        hasHealthFlag,
        // Not shown/required when there's no health flag, so it's
        // meaningless in that case — record true for a clean audit trail.
        declarationAccepted: hasHealthFlag ? input.parqAcknowledged : true,
        acceptedAt: new Date(),
      },
    });

    await tx.consent.createMany({
      data: [
        {
          participantId: created.id,
          consentType: 'HEALTH',
          consentStatus: input.healthConsent,
          policyVersion: settings.consentPolicyVersion,
        },
        {
          participantId: created.id,
          consentType: 'MARKETING',
          consentStatus: input.marketingConsent,
          policyVersion: settings.consentPolicyVersion,
        },
        {
          participantId: created.id,
          consentType: 'COMMUNICATION',
          consentStatus: input.communicationConsent,
          policyVersion: settings.consentPolicyVersion,
        },
      ],
    });

    await tx.payment.create({
      data: { participantId: created.id, amount: fee, paymentStatus: 'NOT_PAID' },
    });

    await writeAuditLog(tx, {
      adminId: opts.createdByAdminId ?? null,
      participantId: created.id,
      action: opts.createdByAdminId ? 'MANUAL_REGISTRATION_CREATED' : 'REGISTRATION_SUBMITTED',
      newValue: { registrationId, distance: input.distance, participantType: input.participantType },
      note: opts.createdByAdminId ? 'Created by Admin' : null,
    });

    return created;
  });

  const { subject, html } = registrationReceivedEmail({
    locale: participant.preferredLocale as Locale,
    fullName: participant.fullName,
    registrationId: participant.registrationId,
    distance: participant.distance as 'KM3' | 'KM5',
    participantType: participant.participantType as 'ADULT' | 'CHILD',
    shirtSize: participant.shirtSize,
    fee: participant.registrationFee,
    statusUrl: statusUrlFor(participant.statusToken),
  });
  await sendEmail({ to: participant.email, subject, html, kind: 'RECEIVED', participantId: participant.id });

  return participant;
}

/** Used both for the slip attached at initial submit and later re-uploads. */
export async function attachPaymentSlip(participantId: string, file: File) {
  const { storageKey } = await savePaymentSlip(participantId, file);

  const participant = await db.participant.findUniqueOrThrow({ where: { id: participantId } });
  const forwardableStatuses = ['SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_ISSUE'];

  await db.$transaction(async (tx) => {
    await tx.payment.create({
      data: {
        participantId,
        amount: participant.registrationFee,
        slipUrl: storageKey,
        paymentStatus: 'SLIP_UPLOADED',
        uploadedAt: new Date(),
      },
    });

    if (forwardableStatuses.includes(participant.registrationStatus)) {
      await tx.participant.update({
        where: { id: participantId },
        data: { registrationStatus: 'PAYMENT_REVIEW' },
      });
    }

    await writeAuditLog(tx, {
      participantId,
      action: 'PAYMENT_SLIP_UPLOADED',
      previousValue: { registrationStatus: participant.registrationStatus },
      newValue: { paymentStatus: 'SLIP_UPLOADED' },
    });
  });
}
