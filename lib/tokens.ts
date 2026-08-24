import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

export function generateSecureToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Signed, expiring tokens for private-file download links (payment slips).
 * Format: base64url(payload).base64url(hmac). Not a JWT on purpose — this
 * only ever needs one claim (the storage key) plus an expiry.
 */
export function signFileToken(storageKey: string, expiresAt: number): string {
  const secret = process.env.FILE_TOKEN_SECRET;
  if (!secret) throw new Error('FILE_TOKEN_SECRET is not set');
  const payload = Buffer.from(JSON.stringify({ k: storageKey, e: expiresAt })).toString(
    'base64url'
  );
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyFileToken(token: string): { storageKey: string } | null {
  const secret = process.env.FILE_TOKEN_SECRET;
  if (!secret) throw new Error('FILE_TOKEN_SECRET is not set');
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expectedSig = createHmac('sha256', secret).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      k: string;
      e: number;
    };
    if (Date.now() > decoded.e) return null;
    return { storageKey: decoded.k };
  } catch {
    return null;
  }
}
