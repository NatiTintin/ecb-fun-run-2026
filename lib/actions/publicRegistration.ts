'use server';

import { fullRegistrationSchema } from '@/lib/validation';
import { submitRegistration, RegistrationClosedError, attachPaymentSlip } from '@/lib/registration';
import { QuotaFullError } from '@/lib/quota';
import { rateLimit, clientIpFrom } from '@/lib/rateLimit';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

function formDataToInput(formData: FormData) {
  const bool = (v: FormDataEntryValue | null) => v === 'true';
  return {
    fullName: String(formData.get('fullName') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
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
  const ip = clientIpFrom(headers());
  if (!rateLimit(`register:${ip}`, 8, 10 * 60 * 1000)) {
    return { ok: false, error: 'มีการส่งคำขอถี่เกินไป กรุณาลองใหม่อีกครั้งในภายหลัง' };
  }

  const raw = formDataToInput(formData);
  const parsed = fullRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { ok: false, error: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', fieldErrors };
  }

  try {
    const participant = await submitRegistration(parsed.data);

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
    if (err instanceof QuotaFullError) {
      return { ok: false, error: 'ขออภัย ประเภทที่ท่านเลือกมีผู้สมัครเต็มจำนวนแล้ว กรุณาเลือกประเภทอื่น' };
    }
    if (err instanceof RegistrationClosedError) {
      return { ok: false, error: 'ขณะนี้ระบบปิดรับสมัครแล้ว' };
    }
    console.error('submitRegistrationAction failed', err);
    return { ok: false, error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' };
  }
}

export async function uploadSlipAction(
  statusToken: string,
  formData: FormData
): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = clientIpFrom(headers());
  if (!rateLimit(`upload:${ip}`, 15, 10 * 60 * 1000)) {
    return { ok: false, error: 'มีการส่งคำขอถี่เกินไป กรุณาลองใหม่อีกครั้งในภายหลัง' };
  }

  const participant = await db.participant.findUnique({ where: { statusToken } });
  if (!participant) return { ok: false, error: 'ไม่พบข้อมูลการสมัคร' };
  if (!['SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_REVIEW', 'PAYMENT_ISSUE'].includes(participant.registrationStatus)) {
    return { ok: false, error: 'ไม่สามารถแนบหลักฐานได้ในสถานะปัจจุบัน' };
  }

  const slip = formData.get('slip');
  if (!(slip instanceof File) || slip.size === 0) {
    return { ok: false, error: 'กรุณาเลือกไฟล์หลักฐานการชำระเงิน' };
  }

  try {
    await attachPaymentSlip(participant.id, slip);
    return { ok: true };
  } catch (err) {
    console.error('uploadSlipAction failed', err);
    return { ok: false, error: err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ' };
  }
}
