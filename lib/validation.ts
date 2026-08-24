import { z } from 'zod';
import { DISTANCES, PARTICIPANT_TYPES, SHIRT_SIZES } from '@/lib/config';

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
