import { z } from 'zod';
import { DISTANCES, PARTICIPANT_TYPES, SHIRT_SIZES, ID_TYPES, IdType, calculateAge } from '@/lib/config';

const THAI_PHONE_RE = /^(0[689]\d{8}|\+66[689]\d{8})$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s-]/g, '');
}

export function formatThaiPhone(raw: string): string {
  const digits = normalizePhone(raw).replace('+66', '0');
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw;
}

export const phoneSchema = z
  .string()
  .trim()
  .transform(normalizePhone)
  .refine((v) => THAI_PHONE_RE.test(v), 'กรุณากรอกเบอร์โทรศัพท์มือถือไทยให้ถูกต้อง เช่น 081-234-5678');

export const participantInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'กรุณากรอกชื่อ-นามสกุล').max(120),
  phone: phoneSchema,
  email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  participantType: z.enum(PARTICIPANT_TYPES, { errorMap: () => ({ message: 'กรุณาเลือกประเภทผู้สมัคร' }) }),
  distance: z.enum(DISTANCES, { errorMap: () => ({ message: 'กรุณาเลือกระยะการวิ่ง' }) }),
});

const DOB_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date of birth is a pure calendar date with no time-of-day or timezone
 * meaning — anchor it to UTC midnight explicitly so it round-trips as the
 * same calendar date regardless of the server's local timezone (which
 * `new Date("YYYY-MM-DDT00:00:00")`, with no zone suffix, would otherwise
 * depend on).
 */
export function parseDateOfBirth(value: string): Date | null {
  if (!DOB_RE.test(value)) return null;
  const d = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Standard Thai national ID mod-11 checksum (13 digits). */
export function isValidThaiNationalId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  const digits = id.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += digits[i] * (13 - i);
  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === digits[12];
}

const PASSPORT_RE = /^[A-Za-z0-9]{5,20}$/;

export type IdentityErrorCode =
  | 'DOB_REQUIRED'
  | 'DOB_INVALID'
  | 'DOB_FUTURE'
  | 'DOB_UNREALISTIC'
  | 'ID_REQUIRED'
  | 'ID_INVALID_THAI'
  | 'ID_INVALID_PASSPORT';

/**
 * Shared identity-field validation, used both for the wizard's client-side
 * step check and the server action's authoritative check — one source of
 * truth for the Thai ID checksum / passport format / DOB sanity rules.
 * Returns error CODEs (not display strings) so callers can render them in
 * whichever locale is active.
 */
export function validateIdentityFields(input: {
  dateOfBirth: string;
  idType: IdType;
  idNumber: string;
}): { dateOfBirth?: IdentityErrorCode; idNumber?: IdentityErrorCode } {
  const errors: { dateOfBirth?: IdentityErrorCode; idNumber?: IdentityErrorCode } = {};

  if (!input.dateOfBirth.trim()) {
    errors.dateOfBirth = 'DOB_REQUIRED';
  } else {
    const dob = parseDateOfBirth(input.dateOfBirth);
    if (!dob) errors.dateOfBirth = 'DOB_INVALID';
    else if (dob.getTime() > Date.now()) errors.dateOfBirth = 'DOB_FUTURE';
    else if (calculateAge(dob) > 120) errors.dateOfBirth = 'DOB_UNREALISTIC';
  }

  const idNumber = input.idNumber.trim();
  if (!idNumber) {
    errors.idNumber = 'ID_REQUIRED';
  } else if (input.idType === 'THAI_ID' && !isValidThaiNationalId(idNumber.replace(/[\s-]/g, ''))) {
    errors.idNumber = 'ID_INVALID_THAI';
  } else if (input.idType === 'PASSPORT' && !PASSPORT_RE.test(idNumber)) {
    errors.idNumber = 'ID_INVALID_PASSPORT';
  }

  return errors;
}

export const identityShape = z.object({
  dateOfBirth: z.string(),
  idType: z.enum(ID_TYPES),
  idNumber: z.string(),
});

export const shirtSizeSchema = z.object({
  shirtSize: z.enum(SHIRT_SIZES, { errorMap: () => ({ message: 'กรุณาเลือกขนาดเสื้อ' }) }),
});

export const parqSchema = z.object({
  q1: z.boolean(),
  q2: z.boolean(),
  q3: z.boolean(),
  q4: z.boolean(),
  q5: z.boolean(),
  q6: z.boolean(),
  q7: z.boolean(),
  // Section 6's "รับทราบคำแนะนำ" checkbox — only required when any q1-q7 is
  // YES; enforced conditionally in fullRegistrationSchema's superRefine
  // below, not here (so this field alone can stay a plain boolean).
  parqAcknowledged: z.boolean(),
});

export const consentSchema = z.object({
  // PAR-Q health screening is mandatory for participant safety, so — unlike
  // marketing/communication — declining this consent blocks submission.
  healthConsent: z.literal('CONSENT', {
    errorMap: () => ({
      message: 'จำเป็นต้องยินยอมให้เก็บข้อมูลสุขภาพ (PAR-Q) เพื่อความปลอดภัยในการเข้าร่วมกิจกรรม',
    }),
  }),
  marketingConsent: z.enum(['CONSENT', 'NO_CONSENT']),
  communicationConsent: z.enum(['CONSENT', 'NO_CONSENT']),
  // Section 7 "Participant Declaration" checkbox — always required,
  // regardless of PAR-Q answers (distinct from parqAcknowledged above).
  declarationAccepted: z.literal(true, {
    errorMap: () => ({ message: 'กรุณายืนยันคำรับรองก่อน Submit' }),
  }),
});

export const fullRegistrationSchema = participantInfoSchema
  .merge(identityShape)
  .merge(shirtSizeSchema)
  .merge(parqSchema)
  .merge(consentSchema)
  .superRefine((data, ctx) => {
    const hasHealthFlag = [data.q1, data.q2, data.q3, data.q4, data.q5, data.q6, data.q7].some(
      Boolean
    );
    if (hasHealthFlag && !data.parqAcknowledged) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['parqAcknowledged'],
        message: 'กรุณายืนยันว่ารับทราบคำแนะนำเนื่องจากท่านตอบ "ใช่" ในคำถามสุขภาพ',
      });
    }

    const identityErrors = validateIdentityFields(data);
    if (identityErrors.dateOfBirth) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dateOfBirth'], message: identityErrors.dateOfBirth });
    }
    if (identityErrors.idNumber) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['idNumber'], message: identityErrors.idNumber });
    }
  });

export type FullRegistrationInput = z.infer<typeof fullRegistrationSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const paymentIssueSchema = z.object({
  reason: z.string().trim().min(3, 'กรุณาระบุเหตุผล'),
});

export const rejectSchema = z.object({
  reason: z.string().trim().min(3, 'กรุณาระบุเหตุผล'),
});
