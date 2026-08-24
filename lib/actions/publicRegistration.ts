'use server';

import { fullRegistrationSchema, IdentityErrorCode } from '@/lib/validation';
import { submitRegistration, RegistrationClosedError, AgeCategoryMismatchError, attachPaymentSlip } from '@/lib/registration';
import { QuotaFullError } from '@/lib/quota';
import { rateLimit, clientIpFrom } from '@/lib/rateLimit';
import { db } from '@/lib/db';
import { headers } from 'next/headers';
import { dictionaries, Locale } from '@/lib/i18n/dictionaries';

function localeFrom(formData: FormData): Locale {
  const v = formData.get('locale');
  return v === 'th' ? 'th' : 'en';
}

const SERVER_MESSAGES: Record<Locale, Record<string, string>> = {
  en: {
    rateLimited: 'Too many requests. Please try again later.',
    invalidData: 'Some information isn’t valid — please check and try again.',
    quotaFull: 'Sorry, that category is now full. Please choose a different one.',
    registrationClosed: 'Registration is currently closed.',
    generic: 'Something went wrong. Please try again.',
    notFound: 'Registration not found.',
    wrongStatus: 'Payment proof cannot be attached in the current status.',
    chooseFile: 'Please choose a payment proof file.',
    uploadFailed: 'Upload failed.',
  },
  th: {
    rateLimited: 'มีการส่งคำขอถี่เกินไป กรุณาลองใหม่อีกครั้งในภายหลัง',
    invalidData: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
    quotaFull: 'ขออภัย ประเภทที่ท่านเลือกมีผู้สมัครเต็มจำนวนแล้ว กรุณาเลือกประเภทอื่น',
    registrationClosed: 'ขณะนี้ระบบปิดรับสมัครแล้ว',
    generic: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
    notFound: 'ไม่พบข้อมูลการสมัคร',
    wrongStatus: 'ไม่สามารถแนบหลักฐานได้ในสถานะปัจจุบัน',
    chooseFile: 'กรุณาเลือกไฟล์หลักฐานการชำระเงิน',
    uploadFailed: 'อัปโหลดไม่สำเร็จ',
  },
};

function fieldErrorMessage(path: string, locale: Locale, code?: string): string {
  const t = dictionaries[locale].register;
  switch (path) {
    case 'fullName':
    case 'phone':
    case 'email':
      return t.details.errors[path];
    case 'dateOfBirth':
    case 'idNumber':
      return t.details.errors[(code as IdentityErrorCode) ?? 'ID_REQUIRED'];
    case 'participantType':
    case 'distance':
      return t.race.errors[path];
    case 'shirtSize':
      return t.shirt.errors.shirtSize;
    case 'parqAcknowledged':
      return t.health.errors.ackRequired;
    case 'healthConsent':
      return t.health.errors.healthConsentMandatory;
    case 'marketingConsent':
      return t.health.errors.marketingConsentRequired;
    case 'communicationConsent':
      return t.health.errors.communicationConsentRequired;
    case 'declarationAccepted':
      return t.health.errors.declarationRequired;
    case 'q1':
    case 'q2':
    case 'q3':
    case 'q4':
    case 'q5':
    case 'q6':
    case 'q7':
      return t.health.errors.answerRequired;
    default:
      return SERVER_MESSAGES[locale].invalidData;
  }
}

function formDataToInput(formData: FormData) {
  const bool = (v: FormDataEntryValue | null) => v === 'true';
  return {
    fullName: String(formData.get('fullName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    dateOfBirth: String(formData.get('dateOfBirth') ?? ''),
    idType: String(formData.get('idType') ?? 'THAI_ID'),
    idNumber: String(formData.get('idNumber') ?? ''),
    participantType: String(formData.get('participantType') ?? ''),
    distance: String(formData.get('distance') ?? ''),
    shirtSize: String(formData.get('shirtSize') ?? ''),
    q1: bool(formData.get('q1')),
    q2: bool(formData.get('q2')),
    q3: bool(formData.get('q3')),
    q4: bool(formData.get('q4')),
    q5: bool(formData.get('q5')),
    q6: bool(formData.get('q6')),
    q7: bool(formData.get('q7')),
    parqAcknowledged: bool(formData.get('parqAcknowledged')),
    healthConsent: String(formData.get('healthConsent') ?? ''),
    marketingConsent: String(formData.get('marketingConsent') ?? ''),
    communicationConsent: String(formData.get('communicationConsent') ?? ''),
    declarationAccepted: bool(formData.get('declarationAccepted')),
  };
}

export type SubmitRegistrationResult =
  | { ok: true; registrationId: string; statusToken: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function submitRegistrationAction(formData: FormData): Promise<SubmitRegistrationResult> {
  const locale = localeFrom(formData);
  const msg = SERVER_MESSAGES[locale];

  const ip = clientIpFrom(headers());
  if (!rateLimit(`register:${ip}`, 8, 10 * 60 * 1000)) {
    return { ok: false, error: msg.rateLimited };
  }

  const raw = formDataToInput(formData);
  const parsed = fullRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = String(issue.path[0]);
      fieldErrors[path] = fieldErrorMessage(path, locale, issue.message);
    }
    return { ok: false, error: msg.invalidData, fieldErrors };
  }

  try {
    const participant = await submitRegistration(parsed.data, { locale });

    const slip = formData.get('slip');
    if (slip instanceof File && slip.size > 0) {
      try {
        await attachPaymentSlip(participant.id, slip);
      } catch {
        // Registration already succeeded; slip can still be uploaded later
        // from the secure status page, so this must not fail the request.
      }
    }

    return { ok: true, registrationId: participant.registrationId, statusToken: participant.statusToken };
  } catch (err) {
    if (err instanceof AgeCategoryMismatchError) {
      const t = dictionaries[locale].register.race.errors;
      return {
        ok: false,
        error: msg.invalidData,
        fieldErrors: { participantType: err.requiredType === 'CHILD' ? t.ageRequiresChild : t.ageRequiresAdult },
      };
    }
    if (err instanceof QuotaFullError) {
      return { ok: false, error: msg.quotaFull };
    }
    if (err instanceof RegistrationClosedError) {
      return { ok: false, error: msg.registrationClosed };
    }
    console.error('submitRegistrationAction failed', err);
    return { ok: false, error: msg.generic };
  }
}

export async function uploadSlipAction(
  statusToken: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const locale = localeFrom(formData);
  const msg = SERVER_MESSAGES[locale];

  const ip = clientIpFrom(headers());
  if (!rateLimit(`upload:${ip}`, 15, 10 * 60 * 1000)) {
    return { ok: false, error: msg.rateLimited };
  }

  const participant = await db.participant.findUnique({ where: { statusToken } });
  if (!participant) return { ok: false, error: msg.notFound };
  if (!['SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_REVIEW', 'PAYMENT_ISSUE'].includes(participant.registrationStatus)) {
    return { ok: false, error: msg.wrongStatus };
  }

  const slip = formData.get('slip');
  if (!(slip instanceof File) || slip.size === 0) {
    return { ok: false, error: msg.chooseFile };
  }

  try {
    await attachPaymentSlip(participant.id, slip);
    return { ok: true };
  } catch (err) {
    console.error('uploadSlipAction failed', err);
    return { ok: false, error: err instanceof Error ? err.message : msg.uploadFailed };
  }
}
