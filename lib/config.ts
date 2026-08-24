// Domain constants shared by the form, server actions, and admin UI.
// Distances/participant-types/shirt-sizes/statuses are fixed by the event
// rules; prices/quotas/dates are NOT here — those live in EventSettings /
// Quota rows so admins can change them without a code deploy.

export const DISTANCES = ['KM3', 'KM5'] as const;
export type Distance = (typeof DISTANCES)[number];

export const DISTANCE_LABEL: Record<Distance, string> = {
  KM3: '3 KM',
  KM5: '5 KM',
};

export const PARTICIPANT_TYPES = ['ADULT', 'CHILD'] as const;
export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];

export const PARTICIPANT_TYPE_LABEL: Record<ParticipantType, string> = {
  ADULT: 'Adult / ผู้ใหญ่',
  CHILD: 'Child / เด็ก',
};

export const SHIRT_SIZES = [
  '3XS',
  '2XS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  '2XL',
  '3XL',
  '4XL',
] as const;
export type ShirtSize = (typeof SHIRT_SIZES)[number];

// รอบอก / ความยาว — units intentionally unspecified, per source table.
export const SHIRT_SIZE_GUIDE: Record<ShirtSize, { chest: number; length: number }> = {
  '3XS': { chest: 32, length: 23 },
  '2XS': { chest: 34, length: 24 },
  XS: { chest: 36, length: 25 },
  S: { chest: 38, length: 26 },
  M: { chest: 40, length: 27 },
  L: { chest: 42, length: 28 },
  XL: { chest: 44, length: 29 },
  '2XL': { chest: 46, length: 30 },
  '3XL': { chest: 48, length: 31 },
  '4XL': { chest: 50, length: 31 },
};

export const REGISTRATION_STATUSES = [
  'SUBMITTED',
  'PAYMENT_PENDING',
  'PAYMENT_REVIEW',
  'PAYMENT_ISSUE',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

// Thai labels — used as-is by the (Thai-only) admin panel.
export const REGISTRATION_STATUS_LABEL: Record<RegistrationStatus, string> = {
  SUBMITTED: 'สมัครเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ',
  PAYMENT_PENDING: 'ยังไม่ได้รับหลักฐานการชำระเงิน',
  PAYMENT_REVIEW: 'แนบ Slip แล้ว รอตรวจสอบ',
  PAYMENT_ISSUE: 'Slip หรือยอดเงินมีปัญหา',
  APPROVED: 'อนุมัติแล้ว',
  REJECTED: 'ถูกปฏิเสธ',
  CANCELLED: 'ยกเลิก',
};

// English labels — used by the bilingual participant-facing status page.
export const REGISTRATION_STATUS_LABEL_EN: Record<RegistrationStatus, string> = {
  SUBMITTED: 'Registered — awaiting staff review',
  PAYMENT_PENDING: 'Payment proof not yet received',
  PAYMENT_REVIEW: 'Payment slip attached — under review',
  PAYMENT_ISSUE: 'There is an issue with the payment slip or amount',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

// Statuses that still occupy a reserved (not-yet-approved) quota slot.
export const RESERVED_BUCKET_STATUSES: RegistrationStatus[] = [
  'SUBMITTED',
  'PAYMENT_PENDING',
  'PAYMENT_REVIEW',
  'PAYMENT_ISSUE',
];
export const APPROVED_BUCKET_STATUSES: RegistrationStatus[] = ['APPROVED'];

export const PAYMENT_STATUSES = [
  'NOT_PAID',
  'SLIP_UPLOADED',
  'UNDER_REVIEW',
  'PAYMENT_ISSUE',
  'VERIFIED',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  NOT_PAID: 'ยังไม่ชำระเงิน',
  SLIP_UPLOADED: 'แนบหลักฐานแล้ว',
  UNDER_REVIEW: 'กำลังตรวจสอบ',
  PAYMENT_ISSUE: 'มีปัญหา',
  VERIFIED: 'ตรวจสอบแล้ว',
};

export const PAYMENT_STATUS_LABEL_EN: Record<PaymentStatus, string> = {
  NOT_PAID: 'Not Paid',
  SLIP_UPLOADED: 'Proof Attached',
  UNDER_REVIEW: 'Under Review',
  PAYMENT_ISSUE: 'Issue Found',
  VERIFIED: 'Verified',
};

export const CONSENT_TYPES = ['HEALTH', 'MARKETING', 'COMMUNICATION'] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

export const CONSENT_STATUSES = ['CONSENT', 'NO_CONSENT'] as const;
export type ConsentStatus = (typeof CONSENT_STATUSES)[number];

export const ADMIN_ROLES = ['SUPER_ADMIN', 'REGISTRATION_STAFF', 'BIB_STAFF'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABEL: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  REGISTRATION_STAFF: 'Registration Staff',
  BIB_STAFF: 'BIB Staff',
};

export const PARQ_QUESTIONS = [
  'แพทย์เคยบอกว่าท่านเป็นโรคหัวใจ และควรออกกำลังกายตามคำแนะนำของแพทย์เท่านั้นหรือไม่?',
  'ท่านรู้สึกเจ็บหน้าอกขณะออกกำลังกายหรือไม่?',
  'ในเดือนที่ผ่านมา ท่านมีอาการเจ็บหน้าอกขณะที่ไม่ได้ออกกำลังกายหรือไม่?',
  'ท่านเคยเสียการทรงตัวเนื่องจากอาการเวียนศีรษะ หรือเคยหมดสติหรือไม่?',
  'ท่านมีปัญหาเกี่ยวกับกระดูกหรือข้อต่อ เช่น หลัง เข่า หรือสะโพก ที่อาจมีอาการแย่ลงจากการออกกำลังกายหรือไม่?',
  'ปัจจุบันแพทย์สั่งยาให้ท่านเพื่อรักษาความดันโลหิตหรือโรคหัวใจหรือไม่?',
  'ท่านทราบเหตุผลอื่นใดที่ทำให้ท่านไม่ควรออกกำลังกายหรือไม่?',
] as const;

export const ALLOWED_SLIP_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
export const MAX_SLIP_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export function distanceCode(distance: Distance): '3' | '5' {
  return distance === 'KM3' ? '3' : '5';
}

export function participantTypeCode(type: ParticipantType): 'A' | 'C' {
  return type === 'ADULT' ? 'A' : 'C';
}
