'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/session';
import { writeAuditLog } from '@/lib/audit';
import { fromBangkokInputValue } from '@/lib/utils';

export async function setRegistrationOverrideAction(override: 'AUTO' | 'FORCE_OPEN' | 'FORCE_CLOSED') {
  const session = await requireAdmin(['SUPER_ADMIN', 'REGISTRATION_STAFF']);
  if (!session) return { ok: false as const, error: 'Unauthorized' };

  const before = await db.eventSettings.findUnique({ where: { id: 'singleton' } });
  await db.eventSettings.update({ where: { id: 'singleton' }, data: { registrationOverride: override } });
  await writeAuditLog(db, {
    adminId: session.adminId,
    action: 'REGISTRATION_OVERRIDE_CHANGED',
    previousValue: { registrationOverride: before?.registrationOverride },
    newValue: { registrationOverride: override },
  });

  revalidatePath('/admin');
  revalidatePath('/');
  return { ok: true as const };
}

export type SettingsFormResult = { ok: boolean; error?: string };

export async function updateSettingsAction(
  _prevState: SettingsFormResult,
  formData: FormData
): Promise<SettingsFormResult> {
  const session = await requireAdmin(['SUPER_ADMIN']);
  if (!session) return { ok: false, error: 'Unauthorized' };

  const str = (key: string) => String(formData.get(key) ?? '').trim();
  const int = (key: string) => {
    const v = Number(formData.get(key));
    return Number.isFinite(v) ? Math.round(v) : 0;
  };

  const before = await db.eventSettings.findUnique({ where: { id: 'singleton' } });

  const data = {
    eventName: str('eventName') || 'ECB Fun Run 2026',
    eventDate: fromBangkokInputValue(str('eventDate')),
    registrationOpenAt: fromBangkokInputValue(str('registrationOpenAt')),
    registrationCloseAt: fromBangkokInputValue(str('registrationCloseAt')),
    reservationExpiryMinutes: int('reservationExpiryMinutes'),
    childCriteriaNote: str('childCriteriaNote'),
    price5kmAdult: int('price5kmAdult'),
    price5kmChild: int('price5kmChild'),
    price3kmAdult: int('price3kmAdult'),
    price3kmChild: int('price3kmChild'),
    bankName: str('bankName'),
    bankAccountName: str('bankAccountName'),
    bankAccountNumber: str('bankAccountNumber'),
    promptPayNumber: str('promptPayNumber'),
    promptPayQrImageUrl: str('promptPayQrImageUrl'),
    paymentInstructions: str('paymentInstructions'),
    organizerEmail: str('organizerEmail'),
    organizerPhone: str('organizerPhone'),
    lineContact: str('lineContact'),
    emailSenderName: str('emailSenderName'),
    emailReplyTo: str('emailReplyTo'),
    consentPolicyVersion: str('consentPolicyVersion'),
    consentTextHealth: str('consentTextHealth'),
    consentTextMarketing: str('consentTextMarketing'),
    consentTextCommunication: str('consentTextCommunication'),
  };

  if (Number.isNaN(data.eventDate.getTime())) return { ok: false, error: 'วันที่จัดกิจกรรมไม่ถูกต้อง' };
  if (Number.isNaN(data.registrationOpenAt.getTime()) || Number.isNaN(data.registrationCloseAt.getTime())) {
    return { ok: false, error: 'ช่วงเวลาเปิดรับสมัครไม่ถูกต้อง' };
  }

  await db.eventSettings.update({ where: { id: 'singleton' }, data });

  const quotaUpdates: [string, string, string][] = [
    ['KM5', 'ADULT', 'quota5kmAdult'],
    ['KM5', 'CHILD', 'quota5kmChild'],
    ['KM3', 'ADULT', 'quota3kmAdult'],
    ['KM3', 'CHILD', 'quota3kmChild'],
  ];
  for (const [distance, participantType, field] of quotaUpdates) {
    const capacity = int(field);
    if (capacity > 0) {
      await db.quota.update({
        where: { distance_participantType: { distance, participantType } },
        data: { capacity },
      });
    }
  }

  await writeAuditLog(db, {
    adminId: session.adminId,
    action: 'SETTINGS_UPDATED',
    previousValue: before,
    newValue: data,
  });

  revalidatePath('/', 'layout');
  return { ok: true };
}
