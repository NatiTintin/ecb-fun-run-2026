import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { signFileToken, verifyFileToken } from '@/lib/tokens';
import { ALLOWED_SLIP_MIME_TYPES, MAX_SLIP_SIZE_BYTES } from '@/lib/config';

function storageRoot() {
  return path.resolve(process.cwd(), process.env.STORAGE_DIR || './private-storage');
}

function extensionFor(mimeType: string) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/png') return 'png';
  return 'jpg';
}

/**
 * Saves an uploaded payment slip to private, non-public disk storage and
 * returns an opaque storage key (never a public path). Swap this function's
 * body for an S3/Supabase-Storage `putObject` call in production — callers
 * never need to change.
 */
export async function savePaymentSlip(
  participantId: string,
  file: File
): Promise<{ storageKey: string }> {
  if (!ALLOWED_SLIP_MIME_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type');
  }
  if (file.size > MAX_SLIP_SIZE_BYTES) {
    throw new Error('File too large');
  }

  const dir = path.join(storageRoot(), 'slips', participantId);
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${extensionFor(file.type)}`;
  const storageKey = `slips/${participantId}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return { storageKey };
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const root = storageRoot();
  const resolved = path.resolve(root, storageKey);
  if (!resolved.startsWith(root)) throw new Error('Invalid storage key');
  return readFile(resolved);
}

/** Time-limited signed URL for viewing a private slip — never a raw path. */
export function signedSlipUrl(storageKey: string, ttlMs = 15 * 60 * 1000): string {
  const token = signFileToken(storageKey, Date.now() + ttlMs);
  return `/api/files/slip?token=${encodeURIComponent(token)}`;
}

export function resolveSlipToken(token: string) {
  return verifyFileToken(token);
}
