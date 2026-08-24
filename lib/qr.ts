import QRCode from 'qrcode';
import { generateSecureToken } from '@/lib/tokens';

/** The QR image encodes only this URL + a random opaque token — no PII. */
export function qrVerificationUrl(token: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${base}/admin/checkin/verify/${token}`;
}

export function newQrToken(): string {
  return generateSecureToken(24);
}

export async function qrCodeDataUrl(token: string): Promise<string> {
  return QRCode.toDataURL(qrVerificationUrl(token), {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 480,
    color: { dark: '#1F2937', light: '#FFFFFF' },
  });
}
