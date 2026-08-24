import { Distance, ParticipantType, ShirtSize } from '@/lib/config';

export type QuotaOverviewItem = {
  distance: Distance;
  participantType: ParticipantType;
  capacity: number;
  remaining: number;
  status: 'AVAILABLE' | 'ALMOST_FULL' | 'FULL';
};

export type PricingInfo = {
  price5kmAdult: number;
  price5kmChild: number;
  price3kmAdult: number;
  price3kmChild: number;
};

export type PaymentInfo = {
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  promptPayNumber: string;
  promptPayQrImageUrl: string;
  paymentInstructions: string;
};

export type RegistrationDraft = {
  fullName: string;
  phone: string;
  email: string;
  participantType: ParticipantType | null;
  distance: Distance | null;
  shirtSize: ShirtSize | null;
  parq: {
    q1: boolean | null;
    q2: boolean | null;
    q3: boolean | null;
    q4: boolean | null;
    q5: boolean | null;
    q6: boolean | null;
    q7: boolean | null;
  };
  parqAcknowledged: boolean;
  healthConsent: 'CONSENT' | 'NO_CONSENT' | null;
  marketingConsent: 'CONSENT' | 'NO_CONSENT' | null;
  communicationConsent: 'CONSENT' | 'NO_CONSENT' | null;
  declarationAccepted: boolean;
  slip: File | null;
};

export const emptyDraft: RegistrationDraft = {
  fullName: '',
  phone: '',
  email: '',
  participantType: null,
  distance: null,
  shirtSize: null,
  parq: { q1: null, q2: null, q3: null, q4: null, q5: null, q6: null, q7: null },
  parqAcknowledged: false,
  healthConsent: null,
  marketingConsent: null,
  communicationConsent: null,
  declarationAccepted: false,
  slip: null,
};

export function priceFor(pricing: PricingInfo, distance: Distance, type: ParticipantType): number {
  if (distance === 'KM5') return type === 'ADULT' ? pricing.price5kmAdult : pricing.price5kmChild;
  return type === 'ADULT' ? pricing.price3kmAdult : pricing.price3kmChild;
}
