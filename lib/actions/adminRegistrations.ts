'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/session';
import {
  verifyPayment,
  flagPaymentIssue,
  sendPaymentReminder,
  approveRegistration,
  rejectRegistration,
  cancelRegistration,
  WorkflowError,
} from '@/lib/workflow';
import { submitRegistration, RegistrationClosedError } from '@/lib/registration';
import { QuotaFullError } from '@/lib/quota';
import { fullRegistrationSchema } from '@/lib/validation';
import { AdminRole } from '@/lib/config';

type ActionResult = { ok: true } | { ok: false; error: string };

const STAFF_ROLES: AdminRole[] = ['SUPER_ADMIN', 'REGISTRATION_STAFF'];

export async function verifyPaymentAction(participantId: string): Promise<ActionResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };
  try {
    await verifyPayment(participantId, session.adminId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' };
  }
  revalidatePath(`/admin/registrations/${participantId}`);
  revalidatePath('/admin/registrations');
  revalidatePath('/admin');
  return { ok: true };
}

export async function paymentIssueAction(participantId: string, reason: string): Promise<ActionResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };
  if (!reason.trim()) return { ok: false, error: 'กรุณาระบุเหตุผล' };
  try {
    await flagPaymentIssue(participantId, session.adminId, reason.trim());
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' };
  }
  revalidatePath(`/admin/registrations/${participantId}`);
  revalidatePath('/admin/registrations');
  revalidatePath('/admin');
  return { ok: true };
}

export async function paymentReminderAction(participantId: string): Promise<ActionResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };
  try {
    await sendPaymentReminder(participantId, session.adminId);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' };
  }
  revalidatePath(`/admin/registrations/${participantId}`);
  revalidatePath('/admin/registrations');
  return { ok: true };
}

export async function approveRegistrationAction(participantId: string): Promise<ActionResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };
  try {
    await approveRegistration(participantId, session.adminId);
  } catch (err) {
    if (err instanceof WorkflowError) return { ok: false, error: err.message };
    console.error('approveRegistrationAction failed', err);
    return { ok: false, error: 'เกิดข้อผิดพลาด' };
  }
  revalidatePath(`/admin/registrations/${participantId}`);
  revalidatePath('/admin/registrations');
  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectRegistrationAction(participantId: string, reason: string): Promise<ActionResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };
  if (!reason.trim()) return { ok: false, error: 'กรุณาระบุเหตุผล' };
  try {
    await rejectRegistration(participantId, session.adminId, reason.trim());
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' };
  }
  revalidatePath(`/admin/registrations/${participantId}`);
  revalidatePath('/admin/registrations');
  revalidatePath('/admin');
  return { ok: true };
}

export async function cancelRegistrationAction(participantId: string, reason: string): Promise<ActionResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };
  if (!reason.trim()) return { ok: false, error: 'กรุณาระบุเหตุผล' };
  try {
    await cancelRegistration(participantId, session.adminId, reason.trim());
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'เกิดข้อผิดพลาด' };
  }
  revalidatePath(`/admin/registrations/${participantId}`);
  revalidatePath('/admin/registrations');
  revalidatePath('/admin');
  return { ok: true };
}

export type ManualRegistrationResult = { ok: true; registrationId: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createManualRegistrationAction(formData: FormData): Promise<ManualRegistrationResult> {
  const session = await requireAdmin(STAFF_ROLES);
  if (!session) return { ok: false, error: 'Unauthorized' };

  const bool = (v: FormDataEntryValue | null) => v === 'true';
  const raw = {
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

  const parsed = fullRegistrationSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { ok: false, error: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง', fieldErrors };
  }

  const locale = formData.get('locale') === 'th' ? 'th' : 'en';

  try {
    const participant = await submitRegistration(parsed.data, { createdByAdminId: session.adminId, locale });
    revalidatePath('/admin/registrations');
    revalidatePath('/admin');
    return { ok: true, registrationId: participant.registrationId };
  } catch (err) {
    if (err instanceof QuotaFullError) return { ok: false, error: 'ประเภทที่เลือกเต็มจำนวนแล้ว' };
    if (err instanceof RegistrationClosedError) return { ok: false, error: 'ระบบปิดรับสมัครแล้ว' };
    console.error('createManualRegistrationAction failed', err);
    return { ok: false, error: 'เกิดข้อผิดพลาด' };
  }
}
