import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { signFileToken, verifyFileToken } from '@/lib/tokens';
import { ALLOWED_SLIP_MIME_TYPES, MAX_SLIP_SIZE_BYTES } from '@/lib/config';

const SLIP_BUCKET = 'payment-slips';

function storageRoot() {
  return path.resolve(process.cwd(), process.env.STORAGE_DIR || './private-storage');
}

function extensionFor(mimeType: string) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/png') return 'png';
  return 'jpg';
}

/**
 * Supabase Storage is used when configured (production); otherwise slips
 * fall back to local disk (zero-setup local dev). The service role key
 * bypasses RLS, so this client must never be imported into client code.
 */
function supabaseStorage() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } }).storage.from(SLIP_BUCKET);
}

/**
 * Saves an uploaded payment slip to private, non-public storage and
 * returns an opaque storage key (never a public path).
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

  const filename = `${Date.now()}-${randomUUID()}.${extensionFor(file.type)}`;
  const storageKey = `slips/${participantId}/${filename}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const bucket = supabaseStorage();
  if (bucket) {
    const { error } = await bucket.upload(storageKey, buffer, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw new Error(`Slip upload failed: ${error.message}`);
    return { storageKey };
  }

  const dir = path.join(storageRoot(), 'slips', participantId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(storageRoot(), storageKey), buffer);
  return { storageKey };
}

export async function readStoredFile(storageKey: string): Promise<Buffer> {
  const bucket = supabaseStorage();
  if (bucket) {
    const { data, error } = await bucket.download(storageKey);
    if (error) throw new Error(`Slip download failed: ${error.message}`);
    return Buffer.from(await data.arrayBuffer());
  }

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
